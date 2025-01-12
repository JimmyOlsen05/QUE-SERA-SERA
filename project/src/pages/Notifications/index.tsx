import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Bell, Check } from 'lucide-react';
import type { Notification } from '../../types/database.types';

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow">
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
              <div className="mt-2 w-1/2 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
      
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white p-4 rounded-lg shadow flex items-center justify-between ${
              !notification.read ? 'border-l-4 border-indigo-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className={`w-5 h-5 ${!notification.read ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div>
                <p className="text-gray-800">{notification.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-50"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}