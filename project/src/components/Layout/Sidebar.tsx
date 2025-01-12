import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Group, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  GraduationCap,
  Calendar
} from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';

const navItems = [
  { to: '/dashboard/home', icon: Home, label: 'Home' },
  { to: '/dashboard/forum', icon: FileText, label: 'Forum' },
  { to: '/dashboard/academic', icon: GraduationCap, label: 'Academic Projects' },
  { to: '/dashboard/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/dashboard/friends', icon: Users, label: 'Friends' },
  { to: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/dashboard/groups', icon: Group, label: 'Groups' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNotificationClick: () => void;
}

export function Sidebar({ isCollapsed, onToggle, onNotificationClick }: SidebarProps) {
  const { signOut } = useAuthStore();

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          {!isCollapsed && <h1 className="text-xl font-bold">U-Connect</h1>}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 my-1 text-gray-700 hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-600' : ''
                }`
              }
            >
              <item.icon size={20} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <NotificationBell onClick={onNotificationClick} />
          
          <button
            onClick={signOut}
            className="flex items-center px-4 py-2 mt-2 w-full text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}