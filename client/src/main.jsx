import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/toast/ToastProvider.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/User/Dashboard.jsx';
import Aptitude from './pages/User/Aptitude.jsx';
import AptitudeTopics from './pages/User/AptitudeTopics.jsx';
import AptitudeTopicDetail from './pages/User/AptitudeTopicDetail.jsx';
import AptitudeTopicView from './pages/User/AptitudeTopicView.jsx';
// Coding editor removed
import Leaderboard from './pages/User/Leaderboard.jsx';
import Profile from './pages/User/Profile.jsx';
import ProfileEdit from './pages/User/ProfileEdit.jsx';
import AptitudeHistory from './pages/User/AptitudeHistory.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import Users from './pages/Admin/Users.jsx';
import QuestionsManager from './pages/Admin/QuestionsManager.jsx';
import CodingManager from './pages/Admin/CodingManager.jsx'; // kept file but route removed
import ContestsManager from './pages/Admin/ContestsManager.jsx';
import Moderation from './pages/Admin/Moderation.jsx';
import SubmissionsInspector from './pages/Admin/SubmissionsInspector.jsx';
import SiteSettings from './pages/Admin/SiteSettings.jsx';
import AptitudeSubtopics from './pages/Admin/AptitudeSubtopics.jsx';


const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/dashboard', element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) },
  { path: '/aptitude', element: (
      <ProtectedRoute>
        <Aptitude />
      </ProtectedRoute>
    ) },
  { path: '/aptitude/topics', element: (
      <ProtectedRoute>
        <AptitudeTopics />
      </ProtectedRoute>
    ) },
  { path: '/aptitude/topics/:main', element: (
      <ProtectedRoute>
        <AptitudeTopicView />
      </ProtectedRoute>
    ) },
  { path: '/aptitude/topics/:main/:sub', element: (
      <ProtectedRoute>
        <AptitudeTopicDetail />
      </ProtectedRoute>
    ) },
  // Flashcards and MCQ generation pages removed
  // '/coding' route removed
  { path: '/leaderboard', element: <Leaderboard /> },
  
  { path: '/profile', element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ) },
  { path: '/aptitude/history', element: (
      <ProtectedRoute>
        <AptitudeHistory />
      </ProtectedRoute>
    ) },
  { path: '/profile/edit', element: (
      <ProtectedRoute>
        <ProfileEdit />
      </ProtectedRoute>
    ) },
  { path: '/admin', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <AdminDashboard />
      </ProtectedRoute>
    ) },
  { path: '/admin/users', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <Users />
      </ProtectedRoute>
    ) },
  { path: '/admin/questions', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <QuestionsManager />
      </ProtectedRoute>
    ) },
  { path: '/admin/subtopics', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <AptitudeSubtopics />
      </ProtectedRoute>
    ) },
  // '/admin/coding' admin route removed
  { path: '/admin/contests', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <ContestsManager />
      </ProtectedRoute>
    ) },
  { path: '/admin/moderation', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <Moderation />
      </ProtectedRoute>
    ) },
  { path: '/admin/submissions', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <SubmissionsInspector />
      </ProtectedRoute>
    ) },
  { path: '/admin/settings', element: (
      <ProtectedRoute roles={['admin','moderator']}>
        <SiteSettings />
      </ProtectedRoute>
    ) },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
