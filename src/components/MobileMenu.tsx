
import React from 'react';
import { motion } from 'framer-motion';
import { X, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryClick: (categoryId: string) => void;
  categories: { id: string; name: string }[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose,
  onCategoryClick,
  categories
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="absolute top-0 left-0 w-72 h-full bg-white shadow-lg overflow-auto"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ type: 'tween' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 bg-pizza text-white">
          <h2 className="font-semibold text-lg">Bella Fatia</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium mb-2">Categorias</h3>
          <ul className="space-y-1">
            {categories.map(category => (
              <li key={category.id}>
                <button
                  onClick={() => {
                    onCategoryClick(category.id);
                    onClose();
                  }}
                  className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Phone size={18} className="mr-2 text-pizza" />
              <span>(67) 98483-7419</span>
            </div>
            <div className="flex items-start">
              <MapPin size={18} className="mr-2 flex-shrink-0 text-pizza" />
              <span>Av. Exemplo, 1234, Centro, Campo Grande - MS</span>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="mr-2 text-pizza" />
              <span>Seg-Dom: 18h às 23h</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-gray-100 rounded-full">
              <Instagram size={20} className="text-pizza" />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-full">
              <Facebook size={20} className="text-pizza" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileMenu;
