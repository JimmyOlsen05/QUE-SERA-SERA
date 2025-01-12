import { useState } from 'react';

type AcademicFormData = {
  university: string;
  field_of_study: string;
  sub_field: string;
  year_of_enroll: number;
  year_of_completion: number;
  nationality: string;
};

interface AcademicInfoProps {
  formData: AcademicFormData;
  updateFormData: (data: Partial<AcademicFormData>) => void;
}

const UNIVERSITIES = [
  'Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'California Institute of Technology',
  'University of Oxford',
  'University of Cambridge',
  'ETH Zurich',
  'University of California, Berkeley',
  'Imperial College London',
  'National University of Singapore',
  // Add more universities as needed
];

const FIELDS_OF_STUDY = {
  'Computer Science': [
    'Software Engineering',
    'Artificial Intelligence',
    'Data Science',
    'Cybersecurity',
    'Web Development'
  ],
  'Engineering': [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering'
  ],
  'Business': [
    'Marketing',
    'Finance',
    'Management',
    'Accounting',
    'International Business'
  ],
  'Medicine': [
    'General Medicine',
    'Surgery',
    'Pediatrics',
    'Psychiatry',
    'Neurology'
  ],
  'Arts': [
    'Fine Arts',
    'Graphic Design',
    'Music',
    'Theater',
    'Film Studies'
  ]
};

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
].sort();

export default function AcademicInfo({ formData, updateFormData }: AcademicInfoProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof AcademicFormData, string>>>({});
  const [universitySearch, setUniversitySearch] = useState('');
  const currentYear = new Date().getFullYear();

  const validateField = (name: keyof AcademicFormData, value: any) => {
    if (!value && name !== 'sub_field') { // sub_field is optional
      return `${name.split('_').join(' ').charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    switch (name) {
      case 'year_of_enroll':
        if (value < 1900 || value > currentYear) {
          return 'Invalid enrollment year';
        }
        if (formData.year_of_completion && value > formData.year_of_completion) {
          return 'Enrollment year cannot be after completion year';
        }
        break;
      case 'year_of_completion':
        if (value < formData.year_of_enroll) {
          return 'Completion year cannot be before enrollment year';
        }
        if (value < 1900) {
          return 'Invalid completion year';
        }
        break;
    }
    return '';
  };

  const handleChange = (name: keyof AcademicFormData, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    updateFormData({ [name]: value });

    // Validate related field if it exists
    if (name === 'year_of_enroll' && formData.year_of_completion) {
      const completionError = validateField('year_of_completion', formData.year_of_completion);
      setErrors(prev => ({
        ...prev,
        year_of_completion: completionError
      }));
    }
  };

  const filteredUniversities = UNIVERSITIES.filter(uni => 
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="mb-4 text-sm text-gray-500">
        Fields marked with <span className="text-red-500">*</span> are required
      </div>

      <div>
        <label htmlFor="university" className="block text-sm font-medium text-gray-700">
          University <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            id="university"
            value={formData.university}
            onChange={(e) => {
              setUniversitySearch(e.target.value);
              handleChange('university', e.target.value);
            }}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.university ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Search for your university..."
          />
          {universitySearch && filteredUniversities.length > 0 && (
            <ul className="overflow-auto absolute z-10 py-1 mt-1 w-full max-h-60 text-base bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg focus:outline-none sm:text-sm">
              {filteredUniversities.map((uni) => (
                <li
                  key={uni}
                  className="relative px-3 py-2 cursor-pointer select-none hover:bg-indigo-600 hover:text-white"
                  onClick={() => {
                    handleChange('university', uni);
                    setUniversitySearch('');
                  }}
                >
                  {uni}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.university && (
          <p className="mt-1 text-sm text-red-600">{errors.university}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
          Nationality <span className="text-red-500">*</span>
        </label>
        <select
          id="nationality"
          value={formData.nationality}
          onChange={(e) => handleChange('nationality', e.target.value)}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md ${
            errors.nationality ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select your nationality</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      {errors.nationality && (
        <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
      )}

      <div>
        <label htmlFor="field_of_study" className="block text-sm font-medium text-gray-700">
          Field of Study <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="field_of_study"
            name="field_of_study"
            required
            value={formData.field_of_study}
            onChange={(e) => handleChange('field_of_study', e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              errors.field_of_study ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a field</option>
            {Object.keys(FIELDS_OF_STUDY).map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
        {errors.field_of_study && (
          <p className="mt-1 text-sm text-red-600">{errors.field_of_study}</p>
        )}
      </div>

      <div>
        <label htmlFor="sub_field" className="block text-sm font-medium text-gray-700">
          Specialization
        </label>
        <div className="mt-1">
          <select
            id="sub_field"
            name="sub_field"
            required
            value={formData.sub_field}
            onChange={(e) => handleChange('sub_field', e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              errors.sub_field ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={!formData.field_of_study}
          >
            <option value="">Select a specialization</option>
            {formData.field_of_study && 
              FIELDS_OF_STUDY[formData.field_of_study as keyof typeof FIELDS_OF_STUDY]?.map((subField) => (
                <option key={subField} value={subField}>
                  {subField}
                </option>
              ))
            }
          </select>
        </div>
        {errors.sub_field && (
          <p className="mt-1 text-sm text-red-600">{errors.sub_field}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year_of_enroll" className="block text-sm font-medium text-gray-700">
            Year of Enrollment <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="year_of_enroll"
              min="1900"
              max={currentYear}
              value={formData.year_of_enroll}
              onChange={(e) => handleChange('year_of_enroll', parseInt(e.target.value))}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.year_of_enroll ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.year_of_enroll && (
            <p className="mt-1 text-sm text-red-600">{errors.year_of_enroll}</p>
          )}
        </div>

        <div>
          <label htmlFor="year_of_completion" className="block text-sm font-medium text-gray-700">
            Year of Completion <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="year_of_completion"
              min={formData.year_of_enroll || 1900}
              value={formData.year_of_completion}
              onChange={(e) => handleChange('year_of_completion', parseInt(e.target.value))}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.year_of_completion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.year_of_completion && (
            <p className="mt-1 text-sm text-red-600">{errors.year_of_completion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
