import { useState } from 'react';
import GroupList from '../components/Groups/GroupList';
import CreateGroup from '../components/Groups/CreateGroup';
import GroupChat from '../components/Groups/GroupChat';

interface GroupsProps {
  onGroupSelect?: (groupId: string | undefined) => void;
}

interface Group {
  id: string;
}

export default function Groups({ onGroupSelect }: GroupsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Update selected group and notify parent component
  const handleGroupSelect = (group: Group) => {
    setSelectedGroupId(group.id);
    onGroupSelect?.(group.id);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <div className="overflow-y-auto space-y-6 w-1/3">
        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="px-4 py-2 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Create New Group
        </button>
        {isCreateGroupOpen && (
          <CreateGroup 
            onClose={() => setIsCreateGroupOpen(false)} 
            onSuccess={(group) => {
              handleGroupSelect(group);
              setIsCreateGroupOpen(false);
            }} 
          />
        )}
        <GroupList 
          onSelectGroup={handleGroupSelect} 
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