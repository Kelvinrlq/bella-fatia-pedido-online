
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import ProfileEdit from '@/components/ProfileEdit';

const Profile: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isOpen={false} 
        toggleCart={() => {}} 
        toggleMobileMenu={() => {}} 
        isMobileMenuOpen={false} 
      />
      <main className="container-pizza py-8">
        <ProfileEdit />
      </main>
    </div>
  );
};

export default Profile;
