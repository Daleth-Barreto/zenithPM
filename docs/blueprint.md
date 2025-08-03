# **App Name**: ZenithPM

## Core Features:

- User Authentication: User authentication with login and signup pages, including Google authentication. Following authentication, users are directed to the main dashboard.
- Project Portfolio Dashboard: Dashboard displaying a portfolio of projects in a grid of ProjectCards. Each card shows a header image, project name, description, progress bar, team member avatars, and a button to view the project. Includes empty state.
- New Project Creation: Modal dialog for creating new projects, accessible from the dashboard.
- Project Details Page: Project page displaying project name, description, and a tab system for navigation (Board, Tasks, Brainstorm, Settings).
- Kanban Board: Kanban board view for managing tasks, with columns representing project stages (Backlog, In Progress, Done). Each task is displayed as a TicketCard. Allows dragging and dropping tasks between stages.
- Task Card (TicketCard): TicketCard component displaying task title, colored tags, priority icon, and assigned team member avatar. Clicking opens a side panel (Sheet) with detailed information. Includes CRUD operations.
- Application Layout and Navigation: Main layout with a collapsible AppSidebar for navigation (Dashboard, Projects, Profile) and an AppHeader with search, notifications, and user menu.
- User Profile: User profile system to view and edit personal information.
- Team Invitation: Invite team members via email, even if they are not yet registered in the app.
- Due Date Alerts: Display alerts when a task is approaching its due date. Configurable alert thresholds.
- Brainstorming Area: Area for brainstorming within each project, allowing for quick note-taking and idea capture. Supports rich text formatting.
- Google Meet Integration: Integration with Google Meet to schedule meetings and send invites to team members or selected project members.
- Google Calendar Integration: Integration with Google Calendar to schedule events and send invites to team members or selected project members. Synchronization with user calendars.
- Project Team Management: Team management features within each project to divide tasks and assign roles.
- Task Responsibility and Collaboration: Each ticket can have one responsible person and multiple collaborators, clearly defining roles and responsibilities.
- Comprehensive Task Management: Comprehensive task management with CRUD operations (Create, Read, Update, Delete), ensuring full control over tasks.
- Mobile-First Design: Mobile-first design approach to ensure the application is fully responsive and functions seamlessly on mobile devices.
- Firebase Integration: Backend integration with Firebase for authentication, data storage (Firestore), and real-time updates.
- Task List View: In addition to Kanban board, a List view for tasks is also available.
- AI-Powered Task Assignment Suggestions: Smart suggestions for assigning responsible people to tickets, based on their expertise and workload. This is a tool that uses AI to suggest the most appropriate team member.
- Meeting Summary: Summarize discussion and meeting notes

## Style Guidelines:

- Primary color: Desaturated teal (#408080) to convey a professional, calming atmosphere. It reflects the teal/cyan accent color specified by the user.
- Background color: Dark gray (#222222) for a modern, dark theme, providing contrast to make elements stand out, as per the user's design preference.
- Accent color: A brighter analogous cyan (#40B080) will highlight key interactive elements, to ensure visibility without disrupting the dark aesthetic.
- Body and headline font: 'Inter', a sans-serif font that maintains a modern, legible appearance throughout the application. Note: currently only Google Fonts are supported.
- Responsive layout to ensure the application functions well on both desktop and mobile devices.
- lucide-react icons should be used throughout the application.
- Use subtle animations for transitions.