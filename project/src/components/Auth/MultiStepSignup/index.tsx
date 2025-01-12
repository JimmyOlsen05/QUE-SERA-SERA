import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import BasicInfo from './steps/BasicInfo';
import AcademicInfo from './steps/AcademicInfo';
import PersonalInfo from './steps/PersonalInfo';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SignupFormData {
  // Basic Info
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  full_name: string;
  avatar: File | null;
  
  // Academic Info
  university: string;
  field_of_study: string;
  sub_field: string;
  year_of_enroll: number;
  year_of_completion: number;
  nationality: string;
  
  // Personal Info
  interests: string[];
  bio: string;
}

const initialFormData: SignupFormData = {
  email: '',
  password: '',
  passwordConfirm: '',
  username: '',
  full_name: '',
  avatar: null,
  university: '',
  field_of_study: '',
  sub_field: '',
  year_of_enroll: new Date().getFullYear(),
  year_of_completion: new Date().getFullYear() + 4,
  nationality: '',
  interests: [],
  bio: ''
};

export default function MultiStepSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateBasicInfo = () => {
    const { email, password, passwordConfirm, username, full_name } = formData;
    if (!email || !password || !passwordConfirm || !username || !full_name) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !validateBasicInfo()) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // First, validate all fields
      if (!validateAllFields()) {
        setLoading(false);
        return;
      }

      // Start a Supabase transaction
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.full_name
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('No user data returned after signup');
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!existingProfile) {
        // Create profile only if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: formData.username,
            full_name: formData.full_name,
            avatar_url: null,
            university: formData.university,
            field_of_study: formData.field_of_study,
            sub_field: formData.sub_field || null,
            year_of_enroll: formData.year_of_enroll,
            year_of_completion: formData.year_of_completion,
            nationality: formData.nationality,
            interests: formData.interests || [],
            bio: formData.bio || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile. Please try again or contact support.');
        }
      }

      toast.success('Sign up successful! Please check your email to verify your account.');
      navigate('/auth/verify-email');
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
      toast.error(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const validateAllFields = () => {
    const errors: Record<string, string> = {};
    
    // Add validation for required fields
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.university) errors.university = 'University is required';
    if (!formData.field_of_study) errors.field_of_study = 'Field of study is required';
    if (!formData.nationality) errors.nationality = 'Nationality is required';
    
    if (Object.keys(errors).length > 0) {
      setCurrentStep(1); // Go back to first step if there are basic info errors
      toast.error('Please fill in all required fields');
      return false;
    }
    
    return true;
  };

  return (
    <div className="flex flex-col justify-center py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Create your account
        </h2>
        <div className="mt-4">
          <div className="flex justify-center items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === step
                      ? 'bg-indigo-600 text-white'
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-sm text-gray-500">
              {currentStep === 1
                ? 'Basic Information'
                : currentStep === 2
                ? 'Academic Details'
                : 'Personal Information'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="px-4 py-3 mb-4 text-red-600 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {currentStep === 1 && (
              <BasicInfo formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <AcademicInfo formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <PersonalInfo formData={formData} updateFormData={updateFormData} />
            )}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
