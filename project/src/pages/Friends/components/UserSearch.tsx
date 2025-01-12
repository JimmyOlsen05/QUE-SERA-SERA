import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Profile } from '../../../types/database.types';
import { Search, UserPlus, X } from 'lucide-react';
import debounce from 'lodash/debounce';

interface SearchFilters {
  university?: string;
  field_of_study?: string;
  sub_field?: string;
  nationality?: string;
  year_range?: {
    start: number;
    end: number;
  };
}

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  // @ts-ignore - isLoading is used in the JSX
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [universities, setUniversities] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [subFields, setSubFields] = useState<string[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFilterOptions = async () => {
    const { data: universityData } = await supabase
      .from('profiles')
      .select('university')
      .not('university', 'is', null);
    
    const { data: fieldData } = await supabase
      .from('profiles')
      .select('field_of_study')
      .not('field_of_study', 'is', null);

    const { data: subFieldData } = await supabase
      .from('profiles')
      .select('sub_field')
      .not('sub_field', 'is', null);

    const { data: nationalityData } = await supabase
      .from('profiles')
      .select('nationality')
      .not('nationality', 'is', null);

    const uniqueUniversities = [...new Set(universityData?.map(d => d.university))];
    const uniqueFields = [...new Set(fieldData?.map(d => d.field_of_study))];
    const uniqueSubFields = [...new Set(subFieldData?.map(d => d.sub_field))];
    const uniqueNationalities = [...new Set(nationalityData?.map(d => d.nationality))];

    setUniversities(uniqueUniversities as string[]);
    setFields(uniqueFields as string[]);
    setSubFields(uniqueSubFields as string[]);
    setNationalities(uniqueNationalities as string[]);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      let supabaseQuery = supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', userId)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);

      // Add filter conditions
      if (filters.university) {
        supabaseQuery = supabaseQuery.eq('university', filters.university);
      }
      if (filters.field_of_study) {
        supabaseQuery = supabaseQuery.eq('field_of_study', filters.field_of_study);
      }
      if (filters.sub_field) {
        supabaseQuery = supabaseQuery.eq('sub_field', filters.sub_field);
      }
      if (filters.nationality) {
        supabaseQuery = supabaseQuery.eq('nationality', filters.nationality);
      }
      if (filters.year_range) {
        supabaseQuery = supabaseQuery
          .gte('year_of_enroll', filters.year_range.start)
          .lte('year_of_completion', filters.year_range.end);
      }

      const { data, error } = await supabaseQuery.limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce(searchUsers, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
    
    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        receiver_id: userId,
        status: 'pending'
      });

      if (error) throw error;
      // You might want to update the UI to show the request was sent
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const clearFilter = (filterType: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterType];
      return newFilters;
    });
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  };

  return (
    <div className="p-4 mx-auto w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <div className="flex overflow-hidden items-center rounded-lg border shadow-sm">
          <Search className="ml-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users by name or username..."
            className="px-4 py-2 w-full outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-2">
          <select
            value={filters.university || ''}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                university: e.target.value || undefined
              }));
              if (searchQuery) debouncedSearch(searchQuery);
            }}
            className="px-3 py-1 text-sm rounded-md border"
          >
            <option value="">All Universities</option>
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>

          <select
            value={filters.field_of_study || ''}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                field_of_study: e.target.value || undefined
              }));
              if (searchQuery) debouncedSearch(searchQuery);
            }}
            className="px-3 py-1 text-sm rounded-md border"
          >
            <option value="">All Fields</option>
            {fields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>

          <select
            value={filters.sub_field || ''}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                sub_field: e.target.value || undefined
              }));
              if (searchQuery) debouncedSearch(searchQuery);
            }}
            className="px-3 py-1 text-sm rounded-md border"
          >
            <option value="">All Sub Fields</option>
            {subFields.map(subField => (
              <option key={subField} value={subField}>{subField}</option>
            ))}
          </select>

          <select
            value={filters.nationality || ''}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                nationality: e.target.value || undefined
              }));
              if (searchQuery) debouncedSearch(searchQuery);
            }}
            className="px-3 py-1 text-sm rounded-md border"
          >
            <option value="">All Nationalities</option>
            {nationalities.map(nationality => (
              <option key={nationality} value={nationality}>{nationality}</option>
            ))}
          </select>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2">
            {filters.university && (
              <span className="inline-flex items-center px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                {filters.university}
                <button
                  onClick={() => clearFilter('university')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.field_of_study && (
              <span className="inline-flex items-center px-2 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                {filters.field_of_study}
                <button
                  onClick={() => clearFilter('field_of_study')}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.sub_field && (
              <span className="inline-flex items-center px-2 py-1 text-sm text-purple-800 bg-purple-100 rounded-full">
                {filters.sub_field}
                <button
                  onClick={() => clearFilter('sub_field')}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.nationality && (
              <span className="inline-flex items-center px-2 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
                {filters.nationality}
                <button
                  onClick={() => clearFilter('nationality')}
                  className="ml-1 hover:text-yellow-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showSuggestions && (searchResults.length > 0 || isLoading) && (
          <div className="absolute z-10 mt-2 w-full bg-white rounded-lg border shadow-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex justify-between items-center p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center min-w-0">
                      <img
                        src={profile.avatar_url || 'https://via.placeholder.com/40'}
                        alt={profile.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 ml-4 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile.username}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.university && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {profile.university}
                            </span>
                          )}
                          {profile.field_of_study && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {profile.field_of_study}
                            </span>
                          )}
                          {profile.sub_field && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {profile.sub_field}
                            </span>
                          )}
                          {profile.nationality && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              {profile.nationality}
                            </span>
                          )}
                        </div>
                        {profile.interests && profile.interests.length > 0 && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            Interests: {profile.interests.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(profile.id)}
                      className="flex justify-center items-center w-10 h-10 text-white bg-blue-500 rounded-full transition-colors hover:bg-blue-600"
                      title="Send friend request"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
