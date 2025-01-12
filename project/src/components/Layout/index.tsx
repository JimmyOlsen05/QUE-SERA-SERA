import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import NotificationsPanel from '../Notifications/NotificationsPanel';

interface LayoutProps {
  children: React.ReactNode;
  onNotificationClick: () => void;
}

export default function Layout({ children, onNotificationClick }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNotificationClick={onNotificationClick}
      />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } p-8`}
      >
        {children}
      </main>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}