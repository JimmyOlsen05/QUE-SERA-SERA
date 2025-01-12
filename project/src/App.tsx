import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import MultiStepSignup from './components/Auth/MultiStepSignup';
import Friends from './pages/Friends/index';
import Chat from './pages/Chat';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Dashboard/Home';
import Forum from './pages/Forum';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import GroupChatWrapper from './components/Groups/GroupChatWrapper';
import NotificationSidePanel from './components/Notifications/NotificationSidePanel';
import CreateTopic from './pages/Forum/CreateTopic';
import UserPosts from './pages/Forum/UserPosts';
import ViewPost from './pages/Forum/ViewPost';
import Profile from './pages/Profile';
import ViewProfile from './pages/ViewProfile';
import Interviews from './pages/Interviews';
import AcademicProjects from './pages/Academic';
import CreateProject from './pages/Academic/CreateProject';
import ProjectDetails from './pages/Academic/ProjectDetails';

function App() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>();

  return (
    <Router>
      <div className="relative">
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<MultiStepSignup />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forum" element={<Forum />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Layout onNotificationClick={() => setIsNotificationPanelOpen(true)}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/create" element={<CreateTopic />} />
                    <Route path="/forum/user/:userId" element={<UserPosts />} />
                    <Route path="/forum/post/:postId" element={<ViewPost />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/groups" element={<Groups onGroupSelect={setCurrentGroupId} />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/view/:userId" element={<ViewProfile />} />
                    <Route path="/interviews" element={<Interviews />} />
                    <Route path="/group-chat/:groupId" element={<GroupChatWrapper />} />
                    <Route path="/academic" element={<AcademicProjects />} />
                    <Route path="/academic/create" element={<CreateProject />} />
                    <Route path="/academic/project/:projectId" element={<ProjectDetails />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
        
        <NotificationSidePanel 
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
          groupId={currentGroupId}
        />
      </div>
    </Router>
  );
}

export default App;