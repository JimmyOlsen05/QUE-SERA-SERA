import React, { useState } from 'react';
import { User } from 'lucide-react';

type BasicFormData = {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  full_name: string;
  avatar: File | null;
};

interface BasicInfoProps {
  formData: BasicFormData;
  updateFormData: (data: Partial<BasicFormData>) => void;
}

export default function BasicInfo({ formData, updateFormData }: BasicInfoProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof BasicFormData, string>>>({});

  const validateField = (name: keyof BasicFormData, value: string) => {
    if (!value.trim()) {
      return `${name.split('_').join(' ').charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    
    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        break;
      case 'username':
        if (value.length < 3) {
          return 'Username must be at least 3 characters long';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Username can only contain letters, numbers, and underscores';
        }
        break;
    }
    return '';
  };

  const handleChange = (name: keyof BasicFormData, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    if (name === 'password') {
      // Clear password confirmation if it doesn't match the new password
      if (formData.passwordConfirm && formData.passwordConfirm !== value) {
        updateFormData({ 
          [name]: value,
          passwordConfirm: ''
        });
        setErrors(prev => ({
          ...prev,
          passwordConfirm: ''
        }));
      } else {
        updateFormData({ [name]: value });
      }
    } else if (name === 'passwordConfirm') {
      const passwordError = value !== formData.password ? 'Passwords do not match' : '';
      setErrors(prev => ({
        ...prev,
        passwordConfirm: passwordError
      }));
      updateFormData({ [name]: value });
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateFormData({ avatar: e.target.files[0] });
    }
  };

  const renderInput = (
    name: keyof Omit<BasicFormData, 'avatar'>,
    label: string,
    type: string = 'text',
    autoComplete: string = ''
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          value={formData[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-4 text-sm text-gray-500">
        Fields marked with <span className="text-red-500">*</span> are required
      </div>
      
      {renderInput('email', 'Email address', 'email', 'email')}
      {renderInput('username', 'Username')}
      {renderInput('full_name', 'Full Name')}
      {renderInput('password', 'Password', 'password', 'new-password')}
      {renderInput('passwordConfirm', 'Confirm Password', 'password', 'new-password')}

      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <div className="flex items-center mt-1 space-x-4">
          <div className="flex overflow-hidden justify-center items-center w-12 h-12 bg-gray-200 rounded-full">
            {formData.avatar ? (
              <img
                src={URL.createObjectURL(formData.avatar)}
                alt="Avatar preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
