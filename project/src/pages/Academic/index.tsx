import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, BookOpen, Users, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AcademicProject, ProjectType } from '../../types/academic.types';
import ProjectCard from './components/ProjectCard';
import FilterSidebar from './components/FilterSidebar';
import { useAuthStore } from '../../store/authStore';

export default function AcademicProjects() {
  const [projects, setProjects] = useState<AcademicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'my-projects' | 'rooms'>('all');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProjects();
  }, [selectedType, searchQuery, activeView]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('academic_projects')
        .select(`
          *,
          creator:creator_id(username, avatar_url),
          project_skills(skill:skills(*))
        `);

      // Filter by project type if not 'all'
      if (selectedType !== 'all') {
        query = query.eq('project_type', selectedType);
      }

      // Filter by search query if present
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Filter by user's projects if in my-projects view
      if (activeView === 'my-projects' && user) {
        query = query.eq('creator_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match AcademicProject type
      const transformedData = data?.map(project => ({
        ...project,
        skills: project.project_skills?.map((ps: any) => ps.skill) || []
      }));

      setProjects(transformedData || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Filters Sidebar */}
      <FilterSidebar
        show={showFilters}
        onClose={() => setShowFilters(false)}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Academic Projects & Research</h1>
              <button
                onClick={() => navigate('/dashboard/academic/create')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700"
              >
                <Plus className="mr-2 w-5 h-5" />
                Create Project
              </button>
            </div>

            {/* View Selector */}
            <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => setActiveView('all')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === 'all'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="mr-2 w-4 h-4" />
                All Projects
              </button>
              <button
                onClick={() => setActiveView('my-projects')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === 'my-projects'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="mr-2 w-4 h-4" />
                My Projects
              </button>
              <button
                onClick={() => setActiveView('rooms')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === 'rooms'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="mr-2 w-4 h-4" />
                Project Rooms
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="block py-2 pr-3 pl-10 w-full leading-5 placeholder-gray-500 bg-white rounded-md border border-gray-300 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              <Filter className="mr-2 w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 animate-pulse sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/dashboard/academic/project/${project.id}`)}
                />
              ))}
              {projects.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No projects found</h3>
                  <p className="text-gray-500">
                    {activeView === 'my-projects'
                      ? "You haven't created any projects yet"
                      : activeView === 'rooms'
                      ? "You're not participating in any projects"
                      : 'No projects match your search criteria'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
