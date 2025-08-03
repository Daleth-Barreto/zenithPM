
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
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, TeamMember, Task, TaskStatus } from './types';
import type { User } from 'firebase/auth';
import { generateAvatar } from './avatar';

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
    initials: (user.displayName || 'U').charAt(0).toUpperCase(),
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

export function getProjectById(projectId: string, callback: (project: Project | null) => void) {
    const projectRef = doc(db, 'projects', projectId);
    
    const unsubscribe = onSnapshot(projectRef, (projectSnap) => {
        if (projectSnap.exists()) {
            const data = projectSnap.data();
            callback({
                id: projectSnap.id,
                name: data.name,
                description: data.description,
                progress: data.progress,
                team: data.team,
                imageUrl: data.imageUrl,
                color: data.color,
                tasks: [],
            } as Project);
        } else {
            callback(null);
        }
    }, (error) => {
      console.error("Error fetching project: ", error);
      callback(null);
    });

    return unsubscribe;
}


// --- TASKS ---
export function getTasksForProject(
  projectId: string,
  callback: (tasks: Task[]) => void
) {
  const tasksRef = collection(db, 'projects', projectId, 'tasks');
  const q = query(tasksRef, orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        // Firestore timestamps need to be converted to JS Date objects
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : undefined,
        subtasks: data.subtasks || [],
      } as Task);
    });
    callback(tasks);
  }, (error) => {
    console.error("Error fetching tasks: ", error);
  });

  return unsubscribe;
}

export async function updateTaskStatus(projectId: string, taskId: string, newStatus: TaskStatus, order: number) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await updateDoc(taskRef, { status: newStatus, order });
}

export async function updateTaskOrder(projectId: string, taskId: string, order: number) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, { order });
}


export async function updateTask(projectId: string, taskId:string, taskData: Partial<Omit<Task, 'id'>>) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);

    // Create a copy to avoid modifying the original object
    const dataToUpdate = { ...taskData };

    // Sanitize the data: convert undefined to null for Firestore compatibility
    for (const key in dataToUpdate) {
        if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
            delete dataToUpdate[key as keyof typeof dataToUpdate];
        }
    }

    // Subtasks are just arrays of objects, which is fine for Firestore
    if (dataToUpdate.subtasks) {
        dataToUpdate.subtasks = dataToUpdate.subtasks.map(subtask => ({ ...subtask }));
    }

    await updateDoc(taskRef, dataToUpdate);
}

export async function createTask(projectId: string, taskData: Omit<Task, 'id' | 'order'> & {order: number}) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const newDocRef = await addDoc(tasksRef, {
        ...taskData,
        subtasks: [],
    });
    return newDocRef.id;
}

export async function deleteTask(projectId: string, taskId: string) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
}


// --- TEAM ---
export async function inviteTeamMember(projectId: string, email: string) {
  // This is a simplified version. A real app would:
  // 1. Check if the user exists in a main 'users' collection (we assume this for now).
  // 2. For this app, we'll just add a placeholder user if no real user is found.
  
  const owner: TeamMember = {
    id: new Date().getTime().toString(), // Mock ID
    name: email.split('@')[0],
    email: email,
    avatarUrl: generateAvatar(email),
    initials: email.charAt(0).toUpperCase(),
    role: 'Miembro',
    expertise: 'Sin definir',
    currentWorkload: 0,
  };

  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    team: arrayUnion(owner),
    teamIds: arrayUnion(owner.id)
  });

  return owner;
}

export async function removeTeamMember(projectId: string, memberId: string) {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if(projectSnap.exists()){
        const projectData = projectSnap.data();
        const updatedTeam = projectData.team.filter((m: TeamMember) => m.id !== memberId);
        const updatedTeamIds = projectData.teamIds.filter((id: string) => id !== memberId);
        
        await updateDoc(projectRef, {
            team: updatedTeam,
            teamIds: updatedTeamIds
        });
    }
}
