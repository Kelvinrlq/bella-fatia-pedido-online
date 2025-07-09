
import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Phone, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <motion.div
      id="mobile-menu"
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
            className="p-2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-pizza focus:ring-offset-2 rounded-md"
            aria-label="Fechar menu"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Auth section for mobile */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.profile_photo_url || undefined} alt="Foto de perfil" />
                  <AvatarFallback className="bg-pizza/10 text-pizza">
                    {profile?.username?.[0]?.toUpperCase() || 
                     user.email?.[0]?.toUpperCase() || 
                     <User className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-pizza-contrast">
                    {profile?.username || 'Usuário'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <Link to="/profile" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-pizza-contrast hover:bg-pizza/10 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                  aria-label="Meu perfil"
                >
                  <Settings size={16} className="mr-2" aria-hidden="true" />
                  Meu Perfil
                </Button>
              </Link>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-pizza-contrast hover:bg-pizza/10 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                aria-label="Sair da conta"
              >
                <LogOut size={16} className="mr-2" aria-hidden="true" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-pizza-contrast hover:bg-pizza/10 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                  aria-label="Fazer login"
                >
                  <User size={16} className="mr-2" aria-hidden="true" />
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro" onClick={onClose}>
                <Button
                  size="sm"
                  className="w-full bg-pizza hover:bg-pizza-dark text-white focus:ring-2 focus:ring-pizza focus:ring-offset-2"
                  aria-label="Criar conta"
                >
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={16} className="mr-2" aria-hidden="true" />
            <span className="text-sm">R. América, 438 - Centro, Corumbá - MS</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-2" aria-hidden="true" />
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
                className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-pizza/10 hover:text-pizza transition-colors focus:ring-2 focus:ring-pizza focus:ring-offset-2"
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
