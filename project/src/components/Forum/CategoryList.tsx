import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
}
  
interface Category {
  id: string;
  name: string;
  description: string;
  programs: Program[];
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories.map(category => ({
      ...category,
      programs: category.programs.filter(program =>
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.programs.length > 0);
  }, [categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg divide-y shadow">
        {filteredCategories.map(category => (
          <div key={category.id} className="p-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex justify-between items-center w-full text-left group hover:text-indigo-600"
            >
              <div className="flex items-center space-x-3">
                {expandedCategories.includes(category.id) 
                  ? <ChevronDown className="w-5 h-5" />
                  : <ChevronRight className="w-5 h-5" />
                }
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="mt-3 ml-8 space-y-2">
                {category.programs.map(program => (
                  <div
                    key={program.id}
                    className={`p-2 rounded-md group cursor-pointer transition-colors ${
                      selectedCategory === program.name 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectCategory(program.name)}
                  >
                    <h4 className="font-medium group-hover:text-indigo-600">
                      {program.name}
                    </h4>
                    <p className="text-sm text-gray-500">{program.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 