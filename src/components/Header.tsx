
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  isOpen: boolean;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOpen, toggleCart, toggleMobileMenu, isMobileMenuOpen }) => {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();

  console.log('Header render - user:', user?.email, 'loading:', loading);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md">
      <div className="container-pizza py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-700 focus:ring-2 focus:ring-pizza focus:ring-offset-2 rounded-md p-1"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
          
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/4d863ce3-4852-436b-90e4-9a0516de9889.png" 
              alt="Bella Fatia Logo" 
              className="w-16 h-16 mr-3"
            />
            <h1 className="text-2xl font-bold text-pizza-contrast">
              <span className="text-pizza">Bella </span>
              Fatia
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auth buttons - Always visible */}
          {!loading && (
            <>
              {user ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <UserDropdown />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pizza-contrast hover:bg-pizza/10 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                      aria-label="Fazer login"
                    >
                      <User size={16} className="mr-1" aria-hidden="true" />
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro">
                    <Button
                      size="sm"
                      className="bg-pizza hover:bg-pizza-dark text-white focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                      aria-label="Criar conta"
                    >
                      Cadastrar
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Cart button */}
          <Button 
            onClick={toggleCart}
            variant="ghost" 
            className="relative p-2 text-pizza-contrast hover:bg-pizza/10 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
            aria-label={`Abrir carrinho com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            <ShoppingCart size={24} aria-hidden="true" />
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="cart-bubble absolute -top-2 -right-2 bg-pizza text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                aria-hidden="true"
              >
                {totalItems}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
