import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users } from 'lucide-react';
import type { Group } from '../../../types/database.types';

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 w-1/4 h-6 bg-gray-200 rounded" />
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.id} className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <p className="mb-4 text-gray-600">{group.description}</p>
          <button className="px-4 py-2 w-full text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Join Group
          </button>
        </div>
      ))}
    </div>
  );
}