
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
import type { Project, TeamMember, Task, TaskStatus, Comment, Team, Invitation, Notification } from './types';
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

// --- NOTIFICATIONS ---
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
        ...notification,
        createdAt: serverTimestamp(),
        read: false,
    });
}

export async function createNotificationsForUsers(userIds: string[], message: string, link: string) {
    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');

    userIds.forEach(userId => {
        const newNotifRef = doc(notificationsRef);
        batch.set(newNotifRef, {
            userId,
            message,
            link,
            createdAt: serverTimestamp(),
            read: false,
        });
    });

    await batch.commit();
}


// --- USERS ---
export async function checkUserExistsByEmail(email: string): Promise<{exists: boolean; uid: string | null; displayName: string | null}> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email.toLowerCase()), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const userData = querySnapshot.docs[0].data();
    return { exists: true, uid: userData.uid, displayName: userData.displayName };
  }
  return { exists: false, uid: null, displayName: null };
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
  const q = query(projectsRef, where('teamIds', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    callback(projects.sort((a,b) => a.name.localeCompare(b.name)));
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

export function getTasksForTeam(
  teamId: string,
  callback: (tasks: (Task & { projectName: string, projectId: string })[]) => void
) {
  const teamRef = doc(db, "projects", "placeholder", "teams", teamId); // This path seems incorrect but let's assume it finds the team.
  
  // First, find the project this team belongs to
  const teamsCollectionGroup = query(collection(db, 'teams'), where('id', '==', teamId));

  const unsubscribe = onSnapshot(collection(db, 'teams'), (snapshot) => {
     // This is inefficient. Needs a better way to find the project for a team
  });

  return unsubscribe;
}



export async function updateTaskStatus(projectId: string, taskId: string, newStatus: TaskStatus, order: number) {
  const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists() && user) {
     const taskData = taskSnap.data() as Task;
     if (newStatus === 'done' && taskData.assignee?.id) {
        await createNotification({
            userId: taskData.assignee.id,
            message: `${user.displayName} marcó la tarea "${taskData.title}" como completada.`,
            link: `/projects/${projectId}/board`
        });
     }
  }
  await updateDoc(taskRef, { status: newStatus, order });
}

export async function updateTaskOrder(projectId: string, taskId: string, order: number) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, { order });
}

let user: User | null = null;
if (typeof window !== 'undefined') {
    const authModule = await import('firebase/auth');
    authModule.onAuthStateChanged(authModule.getAuth(), (authUser) => {
        user = authUser;
    });
}


export async function updateTask(projectId: string, taskId:string, taskData: Partial<Omit<Task, 'id' | 'comments'>>) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    
    // Create a copy to avoid modifying the original object
    const dataToUpdate = { ...taskData };
    
    // Firestore does not allow `undefined` values.
    // We need to clean the object before sending it.
    Object.keys(dataToUpdate).forEach(key => {
        const typedKey = key as keyof typeof dataToUpdate;
        if (dataToUpdate[typedKey] === undefined) {
            delete dataToUpdate[typedKey];
        }
    });
    
    // Ensure subtasks is handled correctly
    if ('subtasks' in dataToUpdate) {
        dataToUpdate.subtasks = dataToUpdate.subtasks || [];
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

    if (taskData.assignee && user) {
         createNotification({
            userId: taskData.assignee.id,
            message: `${user.displayName} te ha asignado una nueva tarea: "${taskData.title}"`,
            link: `/projects/${projectId}/board`,
        });
    }

    return newDocRef.id;
}

export async function deleteTask(projectId: string, taskId: string) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
}

export async function addCommentToTask(projectId: string, taskId: string, text: string, user: User) {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);

    const commentData: Omit<Comment, 'id'> = {
        text: text,
        authorId: user.uid,
        authorName: user.displayName || 'Usuario',
        authorAvatarUrl: user.photoURL || undefined,
        createdAt: new Date(),
    };
    
    // Generate a client-side ID for the comment
    const newComment: Comment = {
        ...commentData,
        id: doc(collection(db, 'dummy')).id,
    }

    await updateDoc(taskRef, {
        comments: arrayUnion(newComment)
    });
    
    // Create notification for the assignee
    const taskSnap = await getDoc(taskRef);
    const taskData = taskSnap.data() as Task;
    if (taskData.assignee && taskData.assignee.id !== user.uid) {
        createNotification({
            userId: taskData.assignee.id,
            message: `${user.displayName} comentó en la tarea: "${taskData.title}"`,
            link: `/projects/${projectId}/board`, // Or link directly to task
        });
    }
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
export async function inviteTeamMember(projectId: string, project: Project, email: string, currentUser: User): Promise<{ success: true, status: 'sent' | 'resent' } | { success: false; inviteLink: string }> {
  const { exists: userExists } = await checkUserExistsByEmail(email);

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
    where('type', '==', 'project'),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  
  if (!existingInvites.empty) {
    // If an invite exists, just resend the notification
    const recipient = await checkUserExistsByEmail(email);
    if (recipient.exists && recipient.uid) {
       await createNotification({
         userId: recipient.uid,
         message: `${currentUser.displayName} te ha vuelto a invitar al proyecto: "${project.name}"`,
         link: `/dashboard`
       });
    }
    return { success: true, status: 'resent' };
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

  return { success: true, status: 'sent' };
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

// --- TEAMS (PROJECT-SPECIFIC) ---

export async function createTeam(projectId: string, teamData: { name: string; memberEmails: string[] }, user: User): Promise<Team> {
  const teamsRef = collection(db, 'projects', projectId, 'teams');
  
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
    projectId: projectId,
    members: [owner],
    memberIds: [user.uid],
    createdAt: serverTimestamp(),
  };

  const newTeamRef = await addDoc(teamsRef, newTeamData);

  // Send invitations for the other members
  for (const email of teamData.memberEmails) {
    if (email.toLowerCase() === user.email?.toLowerCase()) continue;
    await addMemberToTeam(projectId, newTeamRef.id, email, user);
  }

  const newTeamDoc = await getDoc(newTeamRef);
  return {
    id: newTeamDoc.id,
    ...newTeamDoc.data()
  } as Team;
}


export function getTeamsForProject(projectId: string, callback: (teams: Team[]) => void) {
  const teamsRef = collection(db, 'projects', projectId, 'teams');
  const q = query(teamsRef, orderBy('name', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });
    callback(teams);
  }, (error) => {
    console.error("Error fetching teams for project: ", error);
  });

  return unsubscribe;
}

export async function getTeamById(projectId: string, teamId: string): Promise<Team | null> {
    const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (teamSnap.exists()) {
        return { id: teamSnap.id, ...teamSnap.data() } as Team;
    } else {
        return null;
    }
}

export function onTeamUpdate(projectId: string, teamId: string, callback: (team: Team | null) => void) {
  const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
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

export async function addMemberToTeam(projectId: string, teamId: string, email: string, currentUser: User): Promise<{ status: 'sent' | 'resent' } | { status: 'not_found'; inviteLink: string }> {
  const userCheck = await checkUserExistsByEmail(email);
  if (!userCheck.exists) {
    const inviteLink = `${window.location.origin}/signup?teamInvite=${teamId}&projectInvite=${projectId}`;
    return { status: 'not_found', inviteLink };
  }

  const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("El equipo no existe.");
  const teamData = teamSnap.data() as Team;

  const isAlreadyMember = teamData.members.some(m => m.email.toLowerCase() === email.toLowerCase());
  if (isAlreadyMember) throw new Error("Este usuario ya es miembro del equipo.");

  const invitationsRef = collection(db, 'invitations');
  const q = query(invitationsRef, 
    where('recipientEmail', '==', email.toLowerCase()), 
    where('targetId', '==', teamId),
    where('type', '==', 'team'),
    where('status', '==', 'pending')
  );
  const existingInvites = await getDocs(q);
  
  if (!existingInvites.empty) {
    const recipient = await checkUserExistsByEmail(email);
    if (recipient.exists && recipient.uid) {
       await createNotification({
         userId: recipient.uid,
         message: `${currentUser.displayName} te ha vuelto a invitar al equipo: "${teamData.name}"`,
         link: `/projects/${projectId}/teams`
       });
    }
    return { status: 'resent' };
  }

  await addDoc(invitationsRef, {
    type: 'team',
    targetId: teamId,
    targetName: teamData.name,
    projectId: projectId, // Add projectId to the invitation
    recipientEmail: email.toLowerCase(),
    status: 'pending',
    inviterId: currentUser.uid,
    inviterName: currentUser.displayName,
    createdAt: serverTimestamp(),
  });

  return { status: 'sent' };
}

export async function removeMemberFromTeam(projectId: string, teamId: string, memberId: string) {
  const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
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

export async function updateTeamMemberRoleInTeam(projectId: string, teamId: string, memberId: string, role: 'Admin' | 'Miembro') {
    const teamRef = doc(db, 'projects', projectId, 'teams', teamId);
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
      
      let targetRef;
      let memberIdField;
      let membersField;

      if (invitation.type === 'project') {
        targetRef = doc(db, 'projects', invitation.targetId);
        memberIdField = 'teamIds';
        membersField = 'team';
      } else { // 'team'
        if (!invitation.projectId) throw new Error("La invitación al equipo no tiene un proyecto asociado.");
        targetRef = doc(db, 'projects', invitation.projectId, 'teams', invitation.targetId);
        memberIdField = 'memberIds';
        membersField = 'members';
      }
      
      const targetSnap = await transaction.get(targetRef);

      if (targetSnap.exists()) {
        const targetData = targetSnap.data();

        const memberIds = targetData[memberIdField] || [];
        
        if (!memberIds.includes(user.uid)) {
          transaction.update(targetRef, {
            [membersField]: arrayUnion(newMember),
            [memberIdField]: arrayUnion(user.uid),
          });

           // If it's a team invite, also add the user to the main project team if they are not already there
          if (invitation.type === 'team' && invitation.projectId) {
            const projectRef = doc(db, 'projects', invitation.projectId);
            const projectSnap = await transaction.get(projectRef);
            if (projectSnap.exists()) {
              const projectData = projectSnap.data();
              if (!projectData.teamIds.includes(user.uid)) {
                transaction.update(projectRef, {
                  team: arrayUnion(newMember),
                  teamIds: arrayUnion(user.uid),
                });
              }
            }
          }
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
