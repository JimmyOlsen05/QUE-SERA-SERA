import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { ProjectCollaborator } from '../../../types/academic.types';

interface InterviewSectionProps {
  projectId: string;
  acceptedUsers: ProjectCollaborator[];
  onSchedule: (data: {
    projectId: string;
    userId: string;
    date: string;
    time: string;
    duration: number;
  }) => void;
  onCancel?: () => void;
}

export default function InterviewSection({ 
  projectId, 
  acceptedUsers,
  onSchedule,
  onCancel 
}: InterviewSectionProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [isScheduling, setIsScheduling] = useState(false);
  const [platform, setPlatform] = useState<string>('');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !scheduledDate || !scheduledTime) return;

    setIsScheduling(true);
    try {
      await onSchedule({
        projectId,
        userId: selectedUser,
        date: scheduledDate,
        time: scheduledTime,
        duration
      });

      // Reset form
      setSelectedUser(null);
      setScheduledDate('');
      setScheduledTime('');
      setDuration(30);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Schedule Interviews</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select User</label>
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="" key="default-user">Select a user</option>
            {acceptedUsers.map((user) => (
              <option key={`user-${user.user_id}`} value={user.user_id}>
                {user.profile?.username}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <div className="relative mt-1">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="block pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value={15} key="duration-15">15 minutes</option>
            <option value={30} key="duration-30">30 minutes</option>
            <option value={45} key="duration-45">45 minutes</option>
            <option value={60} key="duration-60">1 hour</option>
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="" key="platform-default">Select Platform</option>
              <option value="zoom" key="platform-zoom">Zoom</option>
              <option value="google_meet" key="platform-meet">Google Meet</option>
              <option value="teams" key="platform-teams">Microsoft Teams</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Information</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional meeting details..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isScheduling || !selectedUser || !scheduledDate || !scheduledTime}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </form>
    </div>
  );
}
