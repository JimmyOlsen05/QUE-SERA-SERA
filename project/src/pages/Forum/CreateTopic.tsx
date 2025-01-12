import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Upload, ChevronDown } from 'lucide-react';

type CategoryMap = {
  [key: string]: string[];
};

const CATEGORIES: CategoryMap = {
  "General discussions": [],
  "Assignments and academic help": [],
  "School of Engineering and Technology": [
    "Aerospace Engineering",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Software Engineering",
    "Robotics and Automation",
    "Data Science and Artificial Intelligence"
  ],
  "School of Business and Management": [
    "Business Administration",
    "Accounting and Finance",
    "Marketing",
    "Supply Chain Management",
    "International Business",
    "Entrepreneurship",
    "Human Resources Management"
  ],
  "School of Arts and Humanities": [
    "English Literature",
    "History",
    "Philosophy",
    "Modern Languages",
    "Linguistics",
    "Theater Arts",
    "Music",
    "Visual Arts",
    "Creative Writing",
    "Cultural Studies"
  ],
  "School of Sciences": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Environmental Science",
    "Astronomy",
    "Geology",
    "Statistics",
    "Biotechnology",
    "Marine Science"
  ],
  "School of Social Sciences": [
    "Psychology",
    "Sociology",
    "Economics",
    "Political Science",
    "Anthropology",
    "International Relations",
    "Development Studies",
    "Geography",
    "Social Work",
    "Public Policy"
  ],
  "School of Education": [
    "Early Childhood Education",
    "Primary Education",
    "Secondary Education",
    "Special Education",
    "Educational Leadership",
    "Curriculum Development",
    "Educational Psychology",
    "Educational Technology",
    "Adult Education",
    "STEM Education"
  ],
  "School of Law": [
    "Civil Law",
    "Criminal Law",
    "Constitutional Law",
    "International Law",
    "Business Law",
    "Human Rights Law",
    "Environmental Law",
    "Intellectual Property Law",
    "Family Law",
    "Labor Law"
  ],
  "School of Health Sciences": [
    "Nursing",
    "Pharmacy",
    "Physiotherapy",
    "Public Health",
    "Nutrition and Dietetics",
    "Medical Laboratory Science",
    "Occupational Therapy",
    "Speech Therapy",
    "Mental Health",
    "Health Informatics"
  ],
  "School of Communication and Media Studies": [
    "Journalism",
    "Digital Media",
    "Public Relations",
    "Advertising",
    "Broadcasting",
    "Film and Television",
    "Media Production",
    "Strategic Communication",
    "Social Media Management",
    "Corporate Communication"
  ],
  "School of Agriculture": [
    "Crop Science",
    "Animal Science",
    "Agricultural Economics",
    "Soil Science",
    "Food Technology",
    "Agricultural Engineering",
    "Horticulture",
    "Fisheries",
    "Agribusiness",
    "Sustainable Agriculture"
  ],
  "School of Hospitality and Tourism Management": [
    "Hotel Management",
    "Tourism Management",
    "Event Management",
    "Culinary Arts",
    "Restaurant Management",
    "Travel and Tourism",
    "Hospitality Marketing",
    "Food and Beverage Management",
    "Resort Management",
    "Aviation Management"
  ]
};

interface PostData {
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  attachment_url?: string;
}

export default function CreateTopic() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mainCategory, setMainCategory] = useState(Object.keys(CATEGORIES)[0]);
  const [subCategory, setSubCategory] = useState('');
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subCategoryRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const isGeneralCategory = (category: string) => {
    return category === "General discussions" || category === "Assignments and academic help";
  };

  const handleMainCategoryChange = (category: string) => {
    setMainCategory(category);
    setSubCategory('');
  };

  const handleSubCategorySelect = (sub: string) => {
    setSubCategory(sub);
    setShowSubCategories(false);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const uploadAttachment = async (file: File) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      setErrorMessage(''); // Clear any previous errors
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      // First, check if we can connect to Supabase
      const { data: _, error: testError } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (testError) {
        throw new Error('Cannot connect to database. Please check your internet connection.');
      }

      // Proceed with upload
      const { error: uploadError } = await supabase.storage
        .from('forum_attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Add content type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data, error: urlError } = await supabase.storage
        .from('forum_attachments')
        .createSignedUrl(fileName, 31536000); // URL valid for 1 year

      if (urlError || !data?.signedUrl) {
        throw new Error('Failed to generate attachment URL');
      }

      return data.signedUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in uploadAttachment:', errorMsg);
      setErrorMessage(errorMsg);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous errors

    try {
      let attachmentUrl = null;
      if (attachment) {
        try {
          attachmentUrl = await uploadAttachment(attachment);
        } catch (uploadError) {
          setErrorMessage(`Attachment upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          return;
        }
      }

      const finalCategory = subCategory 
        ? `${mainCategory} - ${subCategory}`
        : mainCategory;

      const postData: PostData = {
        user_id: user.id,
        title,
        content,
        category: finalCategory,
        created_at: new Date().toISOString(),
      };

      if (attachmentUrl) {
        postData['attachment_url'] = attachmentUrl;
      }

      const { error: insertError } = await supabase
        .from('forum_posts')
        .insert([postData]);

      if (insertError) {
        throw new Error(`Failed to create post: ${insertError.message}`);
      }

      // Reset form and redirect
      setTitle('');
      setContent('');
      setMainCategory(Object.keys(CATEGORIES)[0]);
      setSubCategory('');
      setAttachment(null);
      setErrorMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      window.location.href = '/dashboard/forum';
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create forum post';
      console.error('Error creating forum post:', errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 mx-auto mb-6 max-w-4xl bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Create New Topic</h2>
      
      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-4 mb-4 bg-red-50 rounded-md border border-red-200">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
          Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a descriptive title"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Category <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={mainCategory}
            onChange={(e) => handleMainCategoryChange(e.target.value)}
            required
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(CATEGORIES).map((cat) => (
              <option 
                key={cat} 
                value={cat}
                className={isGeneralCategory(cat) ? 
                  "font-semibold text-blue-700 bg-blue-50" : 
                  "text-gray-700 bg-white"
                }
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        {CATEGORIES[mainCategory]?.length > 0 && (
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setShowSubCategories(!showSubCategories)}
              className="flex justify-between items-center px-3 py-2 w-full text-left rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subCategory || 'Select sub-category'}
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {showSubCategories && (
              <div 
                ref={subCategoryRef}
                className="overflow-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-md border border-gray-300 shadow-lg"
              >
                {CATEGORIES[mainCategory].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategorySelect(sub)}
                    className="px-4 py-2 w-full text-left hover:bg-gray-100 focus:outline-none"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700">
          Content <span className="text-red-600">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your post content here"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Attachment
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttachmentChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.ppt,.pptx"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center px-4 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50"
          >
            <Upload className="mr-2 w-5 h-5" />
            {attachment ? attachment.name : 'Choose file'}
          </label>
          {attachment && (
            <button
              type="button"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Supported formats: PDF, Word (.doc, .docx), Text (.txt, .rtf), Images (.png, .jpg, .jpeg, .gif), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
}
