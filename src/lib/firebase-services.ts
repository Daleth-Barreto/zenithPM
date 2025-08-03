
'use client';

import {
  doc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  writeBatch,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, TeamMember, Task } from './types';
import type { User } from 'firebase/auth';
import { generateAvatar } from './avatar';
import { es } from 'date-fns/locale';

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- PROJECTS ---

export async function createProject(
  projectData: { name: string; description: string },
  user: User
): Promise<Project> {
  
  const owner: TeamMember = {
    id: user.uid,
    name: user.displayName || 'Usuario sin nombre',
    email: user.email || '',
    avatarUrl: user.photoURL || generateAvatar(user.displayName || user.email || 'U'),
    initials: (user.displayName || 'U').charAt(0),
    role: 'Admin',
    expertise: 'Sin definir',
    currentWorkload: 0,
  };

  const projectColor = getRandomColor();

  const newProjectRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    ownerId: user.uid,
    teamIds: [user.uid],
    createdAt: serverTimestamp(),
    progress: 0,
    team: [owner],
    color: projectColor,
    imageUrl: `https://placehold.co/600x400/${projectColor.substring(1)}/FFFFFF`,
  });

  // Create initial columns
  const statuses: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];
  const batch = writeBatch(db);
  statuses.forEach((status, index) => {
    const columnRef = doc(collection(db, 'projects', newProjectRef.id, 'columns'));
    batch.set(columnRef, { name: getStatusLabel(status), status: status, order: index });
  });
  await batch.commit();


  return {
    id: newProjectRef.id,
    ...projectData,
    progress: 0,
    tasks: [],
    team: [owner],
    color: projectColor,
    imageUrl: `https://placehold.co/600x400/${projectColor.substring(1)}/FFFFFF`, 
  };
}

export function getProjectsForUser(
  userId: string,
  callback: (projects: Project[]) => void
) {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('teamIds', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        progress: data.progress,
        team: data.team,
        imageUrl: data.imageUrl,
        color: data.color,
        tasks: [], // Tasks would be a subcollection, loaded separately
      });
    });
    callback(projects);
  }, (error) => {
    console.error("Error fetching projects: ", error);
  });

  return unsubscribe;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
        const data = projectSnap.data();

        // Fetch tasks for the project
        const tasksCollectionRef = collection(db, 'projects', projectId, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        const tasks = tasksSnapshot.docs.map(doc => {
          const taskData = doc.data();
          return { 
            id: doc.id,
            ...taskData,
            dueDate: taskData.dueDate?.toDate(),
          } as Task;
        });

        // Fetch columns for the project
        const columnsCollectionRef = collection(db, 'projects', projectId, 'columns');
        const columnsSnapshot = await getDocs(query(columnsCollectionRef));
        const columns = columnsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


        return {
            id: projectSnap.id,
            name: data.name,
            description: data.description,
            progress: data.progress,
            team: data.team,
            imageUrl: data.imageUrl,
            color: data.color,
            tasks: tasks,
            columns: columns,
        } as any; // Cast to any to add 'columns', then to Project
    } else {
        return null;
    }
}


// --- TASKS ---
export async function getTasksForProject(
  projectId: string,
  callback: (tasks: Task[]) => void
) {
  const tasksRef = collection(db, 'projects', projectId, 'tasks');
  const q = query(tasksRef);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        dueDate: data.dueDate?.toDate(), // Convert Firestore Timestamp to JS Date
      } as Task);
    });
    callback(tasks);
  }, (error) => {
    console.error("Error fetching tasks: ", error);
  });

  return unsubscribe;
}

export async function updateTaskStatus(projectId: string, taskId: string, newStatus: TaskStatus) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await updateDoc(taskRef, { status: newStatus });
}


export async function updateTask(projectId: string, taskId: string, taskData: Partial<Task>) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  // Firestore handles undefined fields correctly (doesn't update them)
  await updateDoc(taskRef, taskData);
}

export async function createTask(projectId: string, taskData: Omit<Task, 'id'>) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const newDocRef = await addDoc(tasksRef, taskData);
    return newDocRef.id;
}

export async function deleteTask(projectId: string, taskId: string) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
}


// --- TEAM ---
export async function inviteTeamMember(projectId: string, email: string) {
  // This is a simplified version. A real app would:
  // 1. Check if the user exists in the main 'users' collection.
  // 2. If not, maybe create an "invitation" document.
  // 3. If they exist, add them to the project's team.
  // For now, we'll assume the user exists and just add them by email.
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No se encontró ningún usuario con ese correo electrónico.");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  const newMember: TeamMember = {
    id: userDoc.id,
    name: userData.displayName || 'Nuevo Miembro',
    email: userData.email,
    avatarUrl: userData.photoURL || generateAvatar(userData.displayName || userData.email),
    initials: (userData.displayName || 'N').charAt(0),
    role: 'Miembro',
    expertise: 'Sin definir',
    currentWorkload: 0,
  };

  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    team: arrayUnion(newMember),
    teamIds: arrayUnion(userDoc.id)
  });

  return newMember;
}

export async function removeTeamMember(projectId: string, memberId: string) {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if(projectSnap.exists()){
        const projectData = projectSnap.data();
        const updatedTeam = projectData.team.filter((m: TeamMember) => m.id !== memberId);
        
        await updateDoc(projectRef, {
            team: updatedTeam,
            teamIds: arrayRemove(memberId)
        });
    }
}

// --- HELPERS ---
const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
        case 'backlog': return 'Pendiente';
        case 'in-progress': return 'En Progreso';
        case 'review': return 'En Revisión';
        case 'done': return 'Hecho';
        default: return 'Columna';
    }
};
