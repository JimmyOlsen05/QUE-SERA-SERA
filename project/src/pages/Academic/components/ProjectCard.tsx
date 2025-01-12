import { Users, BookOpen, FileText, Clock, Building, GraduationCap } from 'lucide-react';
import { AcademicProject } from '../../../types/academic.types';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../../store/authStore';

interface ProjectCardProps {
  project: AcademicProject;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { user } = useAuthStore();
  const getProjectTypeIcon = () => {
    switch (project.project_type) {
      case 'research_paper':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'academic_project':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'study_group':
        return <Users className="w-5 h-5 text-green-500" />;
    }
  };

  const getProjectTypeColor = () => {
    switch (project.project_type) {
      case 'research_paper':
        return 'bg-purple-100 text-purple-800';
      case 'academic_project':
        return 'bg-blue-100 text-blue-800';
      case 'study_group':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div
      onClick={onClick}
      className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer group hover:shadow-md hover:border-indigo-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectTypeColor()}`}>
            {getProjectTypeIcon()}
            <span className="ml-1 capitalize">{project.project_type.replace('_', ' ')}</span>
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            project.status === 'open' ? 'bg-green-100 text-green-800' : 
            project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
          {project.title}
        </h3>
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">
          {project.description}
        </p>

        {/* Project Details */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Creator Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {project.creator?.avatar_url ? (
                <img
                  src={project.creator.avatar_url}
                  alt={project.creator.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="flex justify-center items-center w-6 h-6 bg-gray-200 rounded-full">
                  <span className="text-xs text-gray-500">
                    {project.creator?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-2">
              <span className="font-medium text-gray-900">{project.creator?.username}</span>
              {user && project.creator_id === user.id && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                  Created by you
                </span>
              )}
            </div>
          </div>

          {/* University and Department */}
          {(project.university || project.department) && (
            <div className="flex items-center space-x-4">
              {project.university && (
                <div className="flex items-center">
                  <Building className="mr-1 w-4 h-4" />
                  <span>{project.university}</span>
                </div>
              )}
              {project.department && (
                <div className="flex items-center">
                  <GraduationCap className="mr-1 w-4 h-4" />
                  <span>{project.department}</span>
                </div>
              )}
            </div>
          )}

          {/* Collaborators and Deadline */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <Users className="mr-1 w-4 h-4" />
              <span>
                {project.collaborators?.length || 0}/{project.max_collaborators} members
              </span>
            </div>
            {project.deadline && (
              <div className="flex items-center text-xs">
                <Clock className="mr-1 w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
