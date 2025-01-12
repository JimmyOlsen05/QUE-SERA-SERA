import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from '../../components/Welcome';
import Home from './Home';
import Forum from './Forum';
import Friends from '../Friends';

export default function Dashboard() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Welcome />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </div>
  );
}