
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

interface HeaderProps {
  isOpen: boolean;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOpen, toggleCart, toggleMobileMenu, isMobileMenuOpen }) => {
  const { totalItems } = useCart();
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md">
      <div className="container-pizza py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-700"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
          
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/4d863ce3-4852-436b-90e4-9a0516de9889.png" 
              alt="Bella Fatia Logo" 
              className="w-16 h-16 mr-3"
            />
            <h1 className="text-2xl font-bold text-pizza-contrast">
              <span className="text-pizza">Bella </span>
              Fatia
            </h1>
          </div>
        </div>

        <Button 
          onClick={toggleCart}
          variant="ghost" 
          className="relative p-2 text-pizza-contrast hover:bg-pizza/10"
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="cart-bubble absolute -top-2 -right-2 bg-pizza text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
