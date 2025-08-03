
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
import type { Project, TeamMember, Task, TaskStatus, Comment, Team } from './types';
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
  const imageUrl = ''; // Removed image generation

  const newProjectRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    ownerId: user.uid,
    teamIds: [user.uid],
    createdAt: serverTimestamp(),
    progress: 0,
    team: [owner],
    color: projectColor,
    imageUrl: imageUrl,
    associatedTeamIds: [],
  });

  return {
    id: newProjectRef.id,
    ...projectData,
    progress: 0,
    tasks: [],
    team: [owner],
    teamIds: [user.uid],
    color: projectColor,
    imageUrl: imageUrl, 
  };
}

export function getProjectsForUser(
  userId: string,
  callback: (projects: Project[]) => void
) {
  const projectsRef = collection(db, 'projects');
  // First query: projects where the user is a direct member
  const directMembershipQuery = query(projectsRef, where('teamIds', 'array-contains', userId));

  // To query based on team membership, we first need to get the user's teams
  const teamsRef = collection(db, 'teams');
  const userTeamsQuery = query(teamsRef, where('memberIds', 'array-contains', userId));

  let combinedProjects: Record<string, Project> = {};

  const processAndCallback = () => {
    callback(Object.values(combinedProjects));
  };

  const directUnsubscribe = onSnapshot(directMembershipQuery, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      combinedProjects[doc.id] = {
        id: doc.id,
        name: data.name,
        description: data.description,
        progress: data.progress,
        team: data.team,
        teamIds: data.teamIds,
        associatedTeamIds: data.associatedTeamIds || [],
        imageUrl: data.imageUrl,
        color: data.color,
        tasks: [], // Loaded separately
      };
    });
    processAndCallback();
  });
  
  const teamsUnsubscribe = onSnapshot(userTeamsQuery, (teamsSnapshot) => {
      const teamIds = teamsSnapshot.docs.map(doc => doc.id);
      if (teamIds.length > 0) {
          const teamMembershipQuery = query(projectsRef, where('associatedTeamIds', 'array-contains-any', teamIds));
          const teamProjectsUnsubscribe = onSnapshot(teamMembershipQuery, (projectsSnapshot) => {
               projectsSnapshot.forEach((doc) => {
                const data = doc.data();
                combinedProjects[doc.id] = {
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  progress: data.progress,
                  team: data.team, // Note: This team is only direct members, might need merging logic
                  teamIds: data.teamIds,
                  associatedTeamIds: data.associatedTeamIds || [],
                  imageUrl: data.imageUrl,
                  color: data.color,
                  tasks: [],
                };
              });
              processAndCallback();
          });
          // This might need more complex unsubscribe logic
      } else {
        processAndCallback();
      }
  });


  return () => {
    directUnsubscribe();
    teamsUnsubscribe();
  };
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
                teamIds: data.teamIds,
                associatedTeamIds: data.associatedTeamIds || [],
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
        comments: (data.comments || []).map((comment: any) => ({
            ...comment,
            createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(),
        })),
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
    
    if (dataToUpdate.dueDate === undefined) {
      dataToUpdate.dueDate = null;
    }


    // Subtasks are just arrays of objects, which is fine for Firestore
    if (dataToUpdate.subtasks) {
        dataToUpdate.subtasks = dataToUpdate.subtasks.map(subtask => ({ ...subtask }));
    }

    await updateDoc(taskRef, dataToUpdate);
}

export async function createTask(projectId: string, taskData: Omit<Task, 'id' | 'order' | 'comments'> & {order: number}) {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const newDocRef = await addDoc(tasksRef, {
        ...taskData,
        subtasks: [],
        comments: [],
    });
    return newDocRef.id;
}

export async function deleteTask(projectId: string, taskId: string) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
}

export async function addCommentToTask(projectId: string, taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    const newComment = {
        ...comment,
        id: new Date().getTime().toString(),
        createdAt: serverTimestamp(),
    }
    await updateDoc(taskRef, {
        comments: arrayUnion(newComment)
    });
}


// --- TEAM MEMBERS (PROJECT) ---
export async function inviteTeamMember(projectId: string, email: string): Promise<TeamMember> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  let member: TeamMember;

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    member = {
      id: userDoc.id,
      name: userData.displayName,
      email: userData.email,
      avatarUrl: userData.photoURL || generateAvatar(userData.displayName),
      initials: (userData.displayName || 'U').charAt(0).toUpperCase(),
      role: 'Miembro',
      expertise: 'Sin definir',
      currentWorkload: 0,
    };
  } else {
    // If user doesn't exist, create a placeholder.
    // In a real app, you might send an email invite.
    member = {
      id: new Date().getTime().toString(), // Mock ID
      name: email.split('@')[0],
      email: email,
      avatarUrl: generateAvatar(email),
      initials: email.charAt(0).toUpperCase(),
      role: 'Miembro',
      expertise: 'Sin definir',
      currentWorkload: 0,
    };
  }

  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    team: arrayUnion(member),
    teamIds: arrayUnion(member.id)
  });

  return member;
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

export async function updateTeamMemberRole(projectId: string, memberId: string, role: 'Admin' | 'Miembro') {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        const updatedTeam = projectData.team.map((member: TeamMember) => 
            member.id === memberId ? { ...member, role } : member
        );
        
        await updateDoc(projectRef, {
            team: updatedTeam,
        });
    }
}

// --- TEAMS ---

// This is a simplified user lookup. In a real app, this would query a dedicated 'users' collection.
async function findUserByEmail(email: string): Promise<TeamMember | null> {
    // For now, we don't have a central user directory, so this is a placeholder.
    // It simulates finding a user and creating a TeamMember object.
    return null;
}

export async function createTeam(teamData: { name: string; memberEmails: string[] }, user: User): Promise<Team> {
  const owner: TeamMember = {
    id: user.uid,
    name: user.displayName || 'Usuario sin nombre',
    email: user.email!,
    avatarUrl: user.photoURL || generateAvatar(user.displayName || user.email!),
    initials: (user.displayName || 'U').charAt(0).toUpperCase(),
    role: 'Admin',
    expertise: 'Sin definir',
    currentWorkload: 0,
  };

  const members: TeamMember[] = [owner];
  const memberIds: string[] = [owner.id];
  
  for (const email of teamData.memberEmails) {
      if (email === user.email) continue; // Skip owner, already added

      const existingUser = await findUserByEmail(email); // Placeholder lookup
      const memberId = existingUser ? existingUser.id : new Date().getTime().toString() + email;
      
      if (!memberIds.includes(memberId)) {
        members.push({
          id: memberId,
          name: existingUser ? existingUser.name : email.split('@')[0],
          email: email,
          avatarUrl: existingUser?.avatarUrl || generateAvatar(email),
          initials: (existingUser?.name || email).charAt(0).toUpperCase(),
          role: 'Miembro',
          expertise: 'Sin definir',
          currentWorkload: 0,
        });
        memberIds.push(memberId);
      }
  }

  const newTeamRef = await addDoc(collection(db, 'teams'), {
    name: teamData.name,
    ownerId: user.uid,
    members: members.map(m => ({ ...m })), // Convert to plain objects for Firestore
    memberIds: memberIds,
    createdAt: serverTimestamp(),
  });

  return {
    id: newTeamRef.id,
    name: teamData.name,
    ownerId: user.uid,
    members: members,
    memberIds: memberIds,
    createdAt: new Date(),
  };
}


export function getTeamsForUser(userId: string, callback: (teams: Team[]) => void) {
  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, where('memberIds', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });
    callback(teams);
  }, (error) => {
    console.error("Error fetching teams: ", error);
  });

  return unsubscribe;
}

export function getTeamById(teamId: string, callback: (team: Team | null) => void) {
    const teamRef = doc(db, 'teams', teamId);
    const unsubscribe = onSnapshot(teamRef, (teamSnap) => {
        if (teamSnap.exists()) {
            callback({ id: teamSnap.id, ...teamSnap.data() } as Team);
        } else {
            callback(null);
        }
    });
    return unsubscribe;
}

export async function addTeamToProject(projectId: string, teamId: string) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        associatedTeamIds: arrayUnion(teamId)
    });
}

export async function removeTeamFromProject(projectId: string, teamId: string) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        associatedTeamIds: arrayRemove(teamId)
    });
}

export async function addMemberToTeam(teamId: string, email: string) {
  const member: TeamMember = {
      id: new Date().getTime().toString(),
      name: email.split('@')[0],
      email,
      avatarUrl: generateAvatar(email),
      initials: email.charAt(0).toUpperCase(),
      role: 'Miembro',
      expertise: 'Sin definir',
      currentWorkload: 0,
  };

  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
      members: arrayUnion(member),
      memberIds: arrayUnion(member.id),
  });
  return member;
}

export async function removeMemberFromTeam(teamId: string, memberId: string) {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (teamSnap.exists()) {
      const teamData = teamSnap.data();
      const updatedMembers = teamData.members.filter((m: TeamMember) => m.id !== memberId);
      const updatedMemberIds = teamData.memberIds.filter((id: string) => id !== memberId);
      await updateDoc(teamRef, {
          members: updatedMembers,
          memberIds: updatedMemberIds,
      });
  }
}

export async function updateTeamMemberRoleInTeam(teamId: string, memberId: string, role: 'Admin' | 'Miembro') {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        const teamData = teamSnap.data();
        const updatedMembers = teamData.members.map((member: TeamMember) => 
            member.id === memberId ? { ...member, role } : member
        );
        
        await updateDoc(teamRef, {
            members: updatedMembers,
        });
    }
}
