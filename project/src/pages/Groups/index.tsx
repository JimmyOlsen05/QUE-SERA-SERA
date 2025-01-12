import { useState } from 'react';
import GroupList from '../../components/Groups/GroupList';
import CreateGroup from '../../components/Groups/CreateGroup';
import GroupChat from '../../components/Groups/GroupChat';
import { Plus } from 'lucide-react';

export default function Groups() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);

  const handleCreateSuccess = (group: any) => {
    setSelectedGroupId(group.id);
    setIsCreateGroupOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <div className="overflow-y-auto space-y-6 w-1/3">
        <div className="p-4 bg-white rounded-lg shadow">
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex gap-2 justify-center items-center px-4 py-2 w-full text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {isCreateGroupOpen && (
          <CreateGroup
            onClose={() => setIsCreateGroupOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        <GroupList
          onSelectGroup={(group) => setSelectedGroupId(group.id)}
          selectedGroupId={selectedGroupId}
        />
      </div>

      <div className="flex-1 bg-white rounded-lg shadow">
        {selectedGroupId ? (
          <GroupChat groupId={selectedGroupId} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a group to view messages
          </div>
        )}
      </div>
    </div>
  );
}