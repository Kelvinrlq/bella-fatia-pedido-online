
import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoryClick
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-pizza-contrast">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">R. América, 438 - Centro, Corumbá - MS</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-2" />
            <span className="text-sm">(67) 3231-1234</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-pizza-contrast">Categorias</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-pizza/10 hover:text-pizza transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
