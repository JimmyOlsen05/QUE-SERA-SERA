import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProjectType } from '../../types/academic.types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    collaboratorRequirements: '',
    abstract: '',
    project_type: 'academic_project' as ProjectType,
    max_collaborators: 5,
    deadline: '',
    university: '',
    department: '',
    paper_title: '',
    paper_abstract: '',
    paper_link: '',
    skills: [] as string[],
    resources: [
      { type: 'github', url: '' },
      { type: 'overleaf', url: '' },
      { type: 'other', url: '', label: '' }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting project creation...');
    
    if (!user?.id) {
      console.error('No user ID found:', user);
      toast.error('You must be logged in to create a project');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (!formData.abstract.trim()) {
      toast.error('Project abstract is required');
      return;
    }

    if (!formData.collaboratorRequirements.trim()) {
      toast.error('Collaborator requirements are required');
      return;
    }

    setLoading(true);

    try {
      // Format resources to match database schema
      const validResources = formData.resources
        .filter(r => r.url.trim() !== '')
        .map(r => ({
          type: r.type,
          url: r.url.trim(),
          label: r.type === 'other' ? r.label?.trim() : undefined
        }));

      // Prepare project data to match database schema exactly
      const projectData = {
        title: formData.title.trim(),
        description: formData.collaboratorRequirements.trim(),
        abstract: formData.abstract.trim(),
        project_type: formData.project_type,
        status: 'open',
        creator_id: user.id,
        university: formData.university?.trim() || null,
        department: formData.department?.trim() || null,
        max_collaborators: formData.max_collaborators,
        deadline: formData.deadline || null,
        paper_title: formData.paper_title?.trim() || null,
        paper_abstract: formData.paper_abstract?.trim() || null,
        paper_link: formData.paper_link?.trim() || null,
        is_verified: false,
        resources: validResources,
        collaborators: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting database insert with data:', projectData);

      // Insert the project
      const { data, error } = await supabase
        .from('academic_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Project creation error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      console.log('Project created successfully:', data);

      // Handle skills if needed
      if (formData.skills?.length > 0) {
        const { error: skillsError } = await supabase
          .from('project_skills')
          .insert(
            formData.skills.map(skill => ({
              project_id: data.id,
              skill_id: skill
            }))
          );

        if (skillsError) {
          console.warn('Failed to insert skills:', skillsError);
        }
      }

      toast.success('Project created successfully!');
      navigate(`/dashboard/academic/project/${data.id}`);
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceChange = (index: number, field: 'url' | 'label', value: string) => {
    const newResources = [...formData.resources];
    newResources[index] = { ...newResources[index], [field]: value };
    setFormData({ ...formData, resources: newResources });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="px-4 mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <button
            type="button"
            onClick={() => navigate('/dashboard/academic')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Projects
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Type</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                    className="block py-3 pr-10 pl-4 mt-1 w-full text-base rounded-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="academic_project">Academic Project</option>
                    <option value="research_paper">Research Paper</option>
                    <option value="study_group">Study Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    name="title"
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    placeholder="Enter a descriptive title for your project"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="collaboratorRequirements" className="block text-sm font-medium text-gray-700">
                    Collaborator Requirements & Expectations
                  </label>
                  <textarea
                    id="collaboratorRequirements"
                    name="collaboratorRequirements"
                    rows={3}
                    value={formData.collaboratorRequirements}
                    onChange={handleChange}
                    className="block p-3 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Describe what you're looking for in collaborators: required skills, expected time commitment, responsibilities, etc."
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                    Abstract
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    rows={4}
                    value={formData.abstract}
                    onChange={handleChange}
                    className="block p-3 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Provide an academic abstract for your project"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your university name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Collaborators</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_collaborators}
                    onChange={(e) => setFormData({ ...formData, max_collaborators: parseInt(e.target.value) })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Maximum number of people who can join this project</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Resources */}
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Project Resources</h2>
              <p className="mt-1 text-sm text-gray-500">Add links to your project's resources</p>
            </div>
            
            <div className="p-6 space-y-4">
              {formData.resources.map((resource, index) => (
                <div key={resource.type} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {resource.type === 'other' ? 'Other Resource' : `${resource.type} Repository`}
                  </label>
                  <div className="flex gap-3">
                    {resource.type === 'other' && (
                      <input
                        type="text"
                        value={resource.label}
                        onChange={(e) => handleResourceChange(index, 'label', e.target.value)}
                        placeholder="Resource name"
                        className="block p-3 mt-1 w-1/3 text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                      placeholder={`Enter ${resource.type} URL`}
                      className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Paper Details (conditional) */}
          {formData.project_type === 'research_paper' && (
            <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Research Paper Details</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paper Title</label>
                  <input
                    type="text"
                    value={formData.paper_title}
                    onChange={(e) => setFormData({ ...formData, paper_title: e.target.value })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the title of your research paper"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Abstract</label>
                  <textarea
                    value={formData.paper_abstract}
                    onChange={(e) => setFormData({ ...formData, paper_abstract: e.target.value })}
                    rows={4}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Provide a brief abstract of your research paper"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Paper Link</label>
                  <input
                    type="url"
                    value={formData.paper_link}
                    onChange={(e) => setFormData({ ...formData, paper_link: e.target.value })}
                    className="block p-3 mt-1 w-full text-base rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Link to your paper (if available)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/academic')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
