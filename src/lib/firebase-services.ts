
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
  limit,
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

// --- USERS ---
export async function checkUserExistsByEmail(email: string): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email.toLowerCase()), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
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
  const imageUrl = '';

  const newProjectRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    ownerId: user.uid,
    team: [owner],
    teamIds: [user.uid],
    createdAt: serverTimestamp(),
    progress: 0,
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
  const projectsMap = new Map<string, Project>();
  let directUnsubscribe: () => void;
  let teamsUnsubscribe: () => void;
  let teamProjectsUnsubscribes: (() => void)[] = [];

  const updateCallback = () => {
    callback(Array.from(projectsMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
  };

  const setupListeners = () => {
    // Listener for projects where the user is a direct member
    const directMembershipQuery = query(collection(db, 'projects'), where('teamIds', 'array-contains', userId));
    directUnsubscribe = onSnapshot(directMembershipQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          projectsMap.delete(change.doc.id);
        } else {
          projectsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Project);
        }
      });
      updateCallback();
    }, console.error);

    // Listener for teams and their associated projects
    const teamsRef = collection(db, 'teams');
    const teamsQuery = query(teamsRef, where('memberIds', 'array-contains', userId));
    
    teamsUnsubscribe = onSnapshot(teamsQuery, (teamsSnapshot) => {
      const userTeamIds = teamsSnapshot.docs.map(doc => doc.id);

      // Unsubscribe from all previous team-based project listeners
      teamProjectsUnsubscribes.forEach(unsub => unsub());
      teamProjectsUnsubscribes = [];
      
      if (userTeamIds.length > 0) {
        const teamMembershipQuery = query(collection(db, 'projects'), where('associatedTeamIds', 'array-contains-any', userTeamIds));
        const teamProjectsUnsubscribe = onSnapshot(teamMembershipQuery, (projectSnapshot) => {
           projectSnapshot.docChanges().forEach((change) => {
            if (change.type === "removed") {
              projectsMap.delete(change.doc.id);
            } else {
              projectsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Project);
            }
          });
          updateCallback();
        }, console.error);
        teamProjectsUnsubscribes.push(teamProjectsUnsubscribe);
      } else {
        updateCallback();
      }
    }, console.error);
  };
  
  setupListeners();

  return () => {
    directUnsubscribe?.();
    teamsUnsubscribe?.();
    teamProjectsUnsubscribes.forEach(unsub => unsub());
  };
}


export function getProjectById(projectId: string, callback: (project: Project | null) => void) {
    const projectRef = doc(db, 'projects', projectId);
    
    const unsubscribe = onSnapshot(projectRef, (projectSnap) => {
        if (projectSnap.exists()) {
            const data = projectSnap.data();
            callback({
                id: projectSnap.id,
                ...data,
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

export function getTasksForTeam(teamId: string, callback: (tasks: (Task & { projectName: string, projectId: string })[]) => void) {
  let taskListeners: (() => void)[] = [];
  let allTasks: (Task & { projectName: string, projectId: string })[] = [];

  const projectsRef = collection(db, 'projects');
  const projectsQuery = query(projectsRef, where('associatedTeamIds', 'array-contains', teamId));

  const projectsUnsubscribe = onSnapshot(projectsQuery, (projectsSnapshot) => {
    // Clear previous task listeners
    taskListeners.forEach(unsub => unsub());
    taskListeners = [];
    allTasks = [];

    if (projectsSnapshot.empty) {
      callback([]);
      return;
    }

    projectsSnapshot.docs.forEach(projectDoc => {
      const project = { id: projectDoc.id, name: projectDoc.data().name };
      const tasksRef = collection(db, 'projects', project.id, 'tasks');
      const tasksQuery = query(tasksRef, where('assignedTeamId', '==', teamId));

      const tasksUnsubscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const projectTasks = tasksSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : undefined,
            comments: (data.comments || []).map((comment: any) => ({
              ...comment,
              createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(),
            })),
            projectName: project.name,
            projectId: project.id,
          } as Task & { projectName: string, projectId: string };
        });

        // Update the full list by replacing tasks for the current project
        allTasks = allTasks.filter(t => t.projectId !== project.id).concat(projectTasks);
        callback(allTasks.sort((a, b) => a.projectName.localeCompare(b.projectName) || a.title.localeCompare(b.title)));
      });

      taskListeners.push(tasksUnsubscribe);
    });
  });

  // Return a cleanup function that unsubscribes from all listeners
  return () => {
    projectsUnsubscribe();
    taskListeners.forEach(unsub => unsub());
  };
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
    
    // Ensure subtasks is an array, even if it's empty
    if ('subtasks' in dataToUpdate && !dataToUpdate.subtasks) {
        dataToUpdate.subtasks = [];
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
    const newComment: any = {
        ...comment,
        id: doc(collection(db, 'dummy')).id, // Generate random ID
        createdAt: new Date(),
    }
    if (comment.authorAvatarUrl === undefined) {
        delete newComment.authorAvatarUrl;
    }

    await updateDoc(taskRef, {
        comments: arrayUnion(newComment)
    });
}

export async function updateCommentInTask(projectId: string, taskId: string, commentId: string, newText: string) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) {
      throw new Error("La tarea no existe.");
    }
    const taskData = taskSnap.data();
    const comments = (taskData.comments || []) as Comment[];
    const updatedComments = comments.map(c => 
      c.id === commentId ? { ...c, text: newText } : c
    );
    transaction.update(taskRef, { comments: updatedComments });
  });
}

export async function deleteCommentFromTask(projectId: string, taskId: string, commentId: string) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) {
      throw new Error("La tarea no existe.");
    }
    const taskData = taskSnap.data();
    const comments = (taskData.comments || []) as Comment[];
    const updatedComments = comments.filter(c => c.id !== commentId);
    transaction.update(taskRef, { comments: updatedComments });
  });
}


// --- TEAM MEMBERS (PROJECT) ---
export async function inviteTeamMember(projectId: string, project: Project, email: string, currentUser: User): Promise<{ success: true } | { success: false; inviteLink: string }> {
  const userExists = await checkUserExistsByEmail(email);

  if (!userExists) {
    const inviteLink = `${window.location.origin}/signup?projectInvite=${projectId}`;
    return { success: false, inviteLink };
  }
  
  const isAlreadyMember = project.team.some(member => member.email.toLowerCase() === email.toLowerCase());
  if (isAlreadyMember) {
    throw new Error('Este usuario ya es miembro del proyecto.');
  }

  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, 
    where('recipientEmail', '==', email.toLowerCase()), 
    where('targetId', '==', projectId),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  if (!existingInvites.empty) {
    throw new Error('Ya existe una invitación pendiente para este usuario en este proyecto.');
  }

  await addDoc(invitationsRef, {
    type: 'project',
    targetId: projectId,
    targetName: project.name,
    recipientEmail: email.toLowerCase(),
    status: 'pending',
    inviterId: currentUser.uid,
    inviterName: currentUser.displayName,
    createdAt: serverTimestamp(),
  });

  return { success: true };
}

export async function removeTeamMember(projectId: string, memberId: string) {
    const projectRef = doc(db, 'projects', projectId);
    await runTransaction(db, async (transaction) => {
        const projectSnap = await transaction.get(projectRef);
        if(projectSnap.exists()){
            const projectData = projectSnap.data();
            const updatedTeam = projectData.team.filter((m: TeamMember) => m.id !== memberId);
            const updatedTeamIds = projectData.teamIds.filter((id: string) => id !== memberId);
            
            transaction.update(projectRef, {
                team: updatedTeam,
                teamIds: updatedTeamIds
            });
        }
    });
}

export async function updateTeamMemberRole(projectId: string, memberId: string, role: 'Admin' | 'Miembro') {
    const projectRef = doc(db, 'projects', projectId);
    await runTransaction(db, async (transaction) => {
        const projectSnap = await transaction.get(projectRef);
        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            const updatedTeam = projectData.team.map((member: TeamMember) => 
                member.id === memberId ? { ...member, role } : member
            );
            
            transaction.update(projectRef, {
                team: updatedTeam,
            });
        }
    });
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
    memberIds: [user.uid],
    createdAt: serverTimestamp(),
  };

  const newTeamRef = await addDoc(collection(db, 'teams'), newTeamData);

  // Send invitations for the other members
  for (const email of teamData.memberEmails) {
    if (email.toLowerCase() === user.email?.toLowerCase()) continue;
    await addMemberToTeam(newTeamRef.id, email, user);
  }

  const newTeamDoc = await getDoc(newTeamRef);
  return {
    id: newTeamDoc.id,
    ...newTeamDoc.data()
  } as Team;
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

export function onTeamUpdate(teamId: string, callback: (team: Team | null) => void) {
  const teamRef = doc(db, 'teams', teamId);
  return onSnapshot(teamRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Team);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error fetching team in real-time:", error);
    callback(null);
  });
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

export async function addMemberToTeam(teamId: string, email: string, currentUser: User): Promise<{ success: true } | { success: false; inviteLink: string }> {
  const userExists = await checkUserExistsByEmail(email);
  if (!userExists) {
    const inviteLink = `${window.location.origin}/signup?teamInvite=${teamId}`;
    return { success: false, inviteLink };
  }

  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("El equipo no existe.");
  const teamData = teamSnap.data() as Team;

  const isAlreadyMember = teamData.members.some(m => m.email.toLowerCase() === email.toLowerCase());
  if (isAlreadyMember) throw new Error("Este usuario ya es miembro del equipo.");

  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, 
    where('recipientEmail', '==', email.toLowerCase()), 
    where('targetId', '==', teamId),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  if (!existingInvites.empty) {
    throw new Error('Ya existe una invitación pendiente para este usuario en este equipo.');
  }

  await addDoc(invitationsRef, {
    type: 'team',
    targetId: teamId,
    targetName: teamData.name,
    recipientEmail: email.toLowerCase(),
    status: 'pending',
    inviterId: currentUser.uid,
    inviterName: currentUser.displayName,
    createdAt: serverTimestamp(),
  });

  return { success: true };
}

export async function removeMemberFromTeam(teamId: string, memberId: string) {
  const teamRef = doc(db, 'teams', teamId);
  await runTransaction(db, async (transaction) => {
    const teamSnap = await transaction.get(teamRef);
    if (teamSnap.exists()) {
      const teamData = teamSnap.data();
      const updatedMembers = teamData.members.filter((m: TeamMember) => m.id !== memberId);
      const updatedMemberIds = teamData.memberIds.filter((id: string) => id !== memberId);
      transaction.update(teamRef, {
          members: updatedMembers,
          memberIds: updatedMemberIds,
      });
    }
  });
}

export async function updateTeamMemberRoleInTeam(teamId: string, memberId: string, role: 'Admin' | 'Miembro') {
    const teamRef = doc(db, 'teams', teamId);
    await runTransaction(db, async (transaction) => {
      const teamSnap = await transaction.get(teamRef);
      if (teamSnap.exists()) {
          const teamData = teamSnap.data();
          const updatedMembers = teamData.members.map((member: TeamMember) => 
              member.id === memberId ? { ...member, role } : member
          );
          transaction.update(teamRef, { members: updatedMembers });
      }
    });
}


// --- INVITATIONS ---

export function getInvitationsForUser(email: string, callback: (invitations: Invitation[]) => void) {
  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, where('recipientEmail', '==', email.toLowerCase()), where('status', '==', 'pending'));

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
      throw new Error("Esta invitación ya no existe.");
    }

    const invitation = invitationSnap.data() as Invitation;
    if (invitation.status !== 'pending') {
      throw new Error("Esta invitación ya ha sido respondida.");
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
      
      const targetCollection = invitation.type === 'project' ? 'projects' : 'teams';
      const targetRef = doc(db, targetCollection, invitation.targetId);
      const targetSnap = await transaction.get(targetRef);

      if (targetSnap.exists()) {
        const targetData = targetSnap.data();

        // Use 'teamIds' for projects and 'memberIds' for teams
        const memberIdField = targetCollection === 'projects' ? 'teamIds' : 'memberIds';
        const membersField = targetCollection === 'projects' ? 'team' : 'members';

        const memberIds = targetData[memberIdField] || [];
        
        if (!memberIds.includes(user.uid)) {
          transaction.update(targetRef, {
            [membersField]: arrayUnion(newMember),
            [memberIdField]: arrayUnion(user.uid),
          });
        }
      } else {
        throw new Error("El proyecto o equipo de destino ya no existe.");
      }
    }

    transaction.update(invitationRef, {
      status: accepted ? 'accepted' : 'declined'
    });
  });
}

    
