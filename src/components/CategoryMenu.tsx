
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface CategoryMenuProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  categories,
  activeCategory,
  setActiveCategory
}) => {
  return (
    <div className="bg-white sticky top-16 z-30 border-b">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex space-x-2 p-4 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0",
                activeCategory === category.id
                  ? "bg-pizza text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
