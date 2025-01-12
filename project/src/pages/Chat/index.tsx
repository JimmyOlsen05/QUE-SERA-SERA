import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface LocationState {
  selectedFriendId?: string;
  selectedFriendName?: string;
}

export default function Chat() {
  const location = useLocation();
  const state = location.state as LocationState;
  const [selectedChat, setSelectedChat] = useState<{
    friendId: string;
    friendName: string;
  } | null>(null);

  useEffect(() => {
    if (state?.selectedFriendId && state?.selectedFriendName) {
      setSelectedChat({
        friendId: state.selectedFriendId,
        friendName: state.selectedFriendName
      });
    }
  }, [state]);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <ChatList selectedFriendId={selectedChat?.friendId} onSelectFriend={(id, name) => setSelectedChat({ friendId: id, friendName: name })} />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
}