import { X } from 'lucide-react';
import { ProjectType } from '../../../types/academic.types';

interface FilterSidebarProps {
  show: boolean;
  onClose: () => void;
  selectedType: ProjectType | 'all';
  onTypeChange: (type: ProjectType | 'all') => void;
}

export default function FilterSidebar({
  show,
  onClose,
  selectedType,
  onTypeChange,
}: FilterSidebarProps) {
  const projectTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'research_paper', label: 'Research Papers' },
    { value: 'academic_project', label: 'Academic Projects' },
    { value: 'study_group', label: 'Study Groups' },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
        show ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              type="button"
              className="text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="overflow-y-auto flex-1 px-4 py-6 space-y-6">
          {/* Project Type */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Project Type</h3>
            <div className="space-y-2">
              {projectTypes.map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="project-type"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => onTypeChange(e.target.value as ProjectType | 'all')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-600">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Status</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-600">Open</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-600">In Progress</span>
              </label>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Skills</h3>
            <input
              type="text"
              placeholder="Search skills..."
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
