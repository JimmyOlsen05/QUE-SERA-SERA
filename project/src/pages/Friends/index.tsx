import FriendRequests from './components/FriendRequests';
import PeopleYouMayKnow from './components/PeopleYouMayKnow';
import FriendsList from './components/FriendsList';
import RecommendedUsers from './components/RecommendedUsers';
import { UserSearch } from './components/UserSearch';

export default function Friends() {
  return (
    <div className="p-6 mx-auto space-y-8 max-w-6xl">
      <h1 className="text-2xl font-bold">Friends</h1>
      
      {/* Friend Requests */}
      <div className="mb-8">
        <FriendRequests />
      </div>

      {/* Your Friends section */}
      <div className="mb-8">
        <FriendsList />
      </div>

      <div className="container px-4 py-8 mx-auto">
        <UserSearch />
      </div>

      {/* Friend Suggestions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PeopleYouMayKnow />
        <RecommendedUsers />
      </div>

      {/* Removed the duplicate Friend Requests */}
    </div>
  );
}