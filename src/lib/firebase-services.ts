
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
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, TeamMember, Task, TaskStatus, Comment, Team, Invitation } from './types';
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
  
  // Query for projects where user is a direct member
  const q1 = query(projectsRef, where('teamIds', 'array-contains', userId));
  
  // Query for user's teams to then find projects associated with those teams
  const teamsRef = collection(db, 'teams');
  const userTeamsQuery = query(teamsRef, where('memberIds', 'array-contains', userId));

  let combinedProjects: Record<string, Project> = {};
  let teamProjectUnsubscribes: (() => void)[] = [];

  const processAndCallback = () => {
    callback(Object.values(combinedProjects).sort((a,b) => a.name.localeCompare(b.name)));
  };

  const directUnsubscribe = onSnapshot(q1, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      combinedProjects[doc.id] = {
        id: doc.id, ...data, tasks: []
      } as Project;
    });
    processAndCallback();
  });

  const teamsUnsubscribe = onSnapshot(userTeamsQuery, (teamsSnapshot) => {
    // Clean up old team project listeners
    teamProjectUnsubscribes.forEach(unsub => unsub());
    teamProjectUnsubscribes = [];

    const teamIds = teamsSnapshot.docs.map(doc => doc.id);

    if (teamIds.length > 0) {
      const q2 = query(projectsRef, where('associatedTeamIds', 'array-contains-any', teamIds));
      const teamProjectsUnsubscribe = onSnapshot(q2, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!combinedProjects[doc.id]) { // Avoid duplicates
             combinedProjects[doc.id] = {
               id: doc.id, ...data, tasks: []
             } as Project;
          }
        });
        processAndCallback();
      });
      teamProjectUnsubscribes.push(teamProjectsUnsubscribe);
    } else {
        processAndCallback(); // Call even if user has no teams
    }
  });

  return () => {
    directUnsubscribe();
    teamsUnsubscribe();
    teamProjectUnsubscribes.forEach(unsub => unsub());
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

    const dataToUpdate = { ...taskData };

    for (const key in dataToUpdate) {
        if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
            delete dataToUpdate[key as keyof typeof dataToUpdate];
        }
    }
    
    if (dataToUpdate.dueDate === undefined) {
      dataToUpdate.dueDate = null;
    }

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
export async function inviteTeamMember(projectId: string, project: Project, email: string, currentUser: User) {
  // Check if user is already in the project
  const isAlreadyMember = project.team.some(member => member.email === email);
  if (isAlreadyMember) {
    throw new Error('Este usuario ya es miembro del proyecto.');
  }

  // Check for pending invitations
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, 
    where('recipientEmail', '==', email), 
    where('targetId', '==', projectId),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  if (!existingInvites.empty) {
    throw new Error('Ya existe una invitación pendiente para este usuario en este proyecto.');
  }

  // Create new invitation
  await addDoc(invitationsRef, {
    type: 'project',
    targetId: projectId,
    targetName: project.name,
    recipientEmail: email,
    status: 'pending',
    inviterId: currentUser.uid,
    inviterName: currentUser.displayName,
    createdAt: serverTimestamp(),
  });
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

  const newTeamData = {
    name: teamData.name,
    ownerId: user.uid,
    members: [owner],
    memberIds: [owner.id],
    createdAt: serverTimestamp(),
  };

  const newTeamRef = await addDoc(collection(db, 'teams'), newTeamData);

  // Send invitations to other members
  for (const email of teamData.memberEmails) {
    if (email === user.email) continue;
    await addMemberToTeam(newTeamRef.id, email, user);
  }

  return {
    id: newTeamRef.id,
    ...newTeamData,
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
    callback(teams.sort((a,b) => a.name.localeCompare(b.name)));
  }, (error) => {
    console.error("Error fetching teams: ", error);
  });

  return unsubscribe;
}

export async function getTeamById(teamId: string): Promise<Team | null> {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        return { id: teamSnap.id, ...teamSnap.data() } as Team;
    } else {
        return null;
    }
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

export async function addMemberToTeam(teamId: string, email: string, currentUser: User) {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("El equipo no existe.");
  const teamData = teamSnap.data() as Team;

  const isAlreadyMember = teamData.members.some(m => m.email === email);
  if (isAlreadyMember) throw new Error("Este usuario ya es miembro del equipo.");

  // Check for pending invitations
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, 
    where('recipientEmail', '==', email), 
    where('targetId', '==', teamId),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  if (!existingInvites.empty) {
    throw new Error('Ya existe una invitación pendiente para este usuario en este equipo.');
  }

  // Create new invitation
  await addDoc(invitationsRef, {
    type: 'team',
    targetId: teamId,
    targetName: teamData.name,
    recipientEmail: email,
    status: 'pending',
    inviterId: currentUser.uid,
    inviterName: currentUser.displayName,
    createdAt: serverTimestamp(),
  });
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


// --- INVITATIONS ---

export function getInvitationsForUser(email: string, callback: (invitations: Invitation[]) => void) {
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, where('recipientEmail', '==', email), where('status', '==', 'pending'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invitations: Invitation[] = [];
    snapshot.forEach(doc => {
      invitations.push({ id: doc.id, ...doc.data() } as Invitation);
    });
    callback(invitations);
  });
  return unsubscribe;
}

export async function respondToInvitation(invitationId: string, accepted: boolean, user: User) {
  const invitationRef = doc(db, 'invitations', invitationId);

  await runTransaction(db, async (transaction) => {
    const invitationSnap = await transaction.get(invitationRef);
    if (!invitationSnap.exists()) {
      throw "Esta invitación ya no existe.";
    }

    const invitation = invitationSnap.data() as Invitation;
    if (invitation.status !== 'pending') {
      throw "Esta invitación ya ha sido respondida.";
    }

    if (accepted) {
      const newMember: TeamMember = {
        id: user.uid,
        name: user.displayName || 'Usuario sin nombre',
        email: user.email!,
        avatarUrl: user.photoURL || generateAvatar(user.displayName || user.email!),
        initials: (user.displayName || 'U').charAt(0).toUpperCase(),
        role: 'Miembro',
        expertise: 'Sin definir',
        currentWorkload: 0,
      };

      const targetRef = doc(db, invitation.type === 'project' ? 'projects' : 'teams', invitation.targetId);
      transaction.update(targetRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(user.uid),
      });
    }

    transaction.update(invitationRef, {
      status: accepted ? 'accepted' : 'declined'
    });
  });
}
