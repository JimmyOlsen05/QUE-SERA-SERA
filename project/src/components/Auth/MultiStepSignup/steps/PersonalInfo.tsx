import { useState } from 'react';
import { X } from 'lucide-react';

interface PersonalInfoProps {
  formData: {
    interests: string[];
    bio: string;
  };
  updateFormData: (data: Partial<PersonalInfoProps['formData']>) => void;
}

export default function PersonalInfo({ formData, updateFormData }: PersonalInfoProps) {
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      const interestsArray = newInterest
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);
      
      updateFormData({
        interests: [...formData.interests, ...interestsArray]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    updateFormData({
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
          Interests
        </label>
        <div className="mt-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add interests (separate by commas)"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center py-1 pr-2 pl-3 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="inline-flex flex-shrink-0 justify-center items-center ml-1 w-4 h-4 text-indigo-400 rounded-full hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );
}
