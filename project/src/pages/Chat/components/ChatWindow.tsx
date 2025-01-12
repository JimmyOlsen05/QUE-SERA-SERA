import { Send } from 'lucide-react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  selectedChat: {
    friendId: string;
    friendName: string;
  } | null;
}

export default function ChatWindow({ selectedChat }: ChatWindowProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when chat is selected
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.friendId}),and(sender_id.eq.${selectedChat.friendId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase.channel(`chat:${selectedChat.friendId}`);
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.friendId}),and(sender_id.eq.${selectedChat.friendId},receiver_id.eq.${user.id}))`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to chat messages');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedChat, user]);

  // Handle sending messages
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !user || !newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Create new message object
      const newMessage: Omit<Message, 'id' | 'created_at'> = {
        sender_id: user.id,
        receiver_id: selectedChat.friendId,
        content: messageContent
      };

      // Add optimistic update
      const optimisticMessage = {
        ...newMessage,
        id: 'temp-' + Date.now(),
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();

      // Send to server
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      if (data) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? data : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      setNewMessage(messageContent); // Restore message content
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {selectedChat ? selectedChat.friendName : 'Select a chat to start messaging'}
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } ${message.id.startsWith('temp-') ? 'opacity-70' : ''}`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}