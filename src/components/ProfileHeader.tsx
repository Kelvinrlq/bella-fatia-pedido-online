
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDropdown from './UserDropdown';

const ProfileHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md">
      <div className="container-pizza py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
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
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
