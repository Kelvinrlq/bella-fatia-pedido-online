
import React, { useState } from 'react';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import CategoryMenu from '@/components/CategoryMenu';
import ProductList from '@/components/ProductList';
import Cart from '@/components/Cart';
import MobileMenu from '@/components/MobileMenu';
import Footer from '@/components/Footer';
import ProfileSetup from '@/components/ProfileSetup';
import { CartProvider } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { categories, products } from '@/data/mock-data';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Show loading while checking auth and profile (only if user is logged in)
  if (user && (authLoading || profileLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if user is logged in but doesn't have a complete profile
  if (user && !profileSetupComplete && (!profile?.username || !profile?.username.trim())) {
    return (
      <ProfileSetup 
        onComplete={() => setProfileSetupComplete(true)}
      />
    );
  }
  
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header 
          isOpen={isCartOpen}
          toggleCart={toggleCart}
          toggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <Banner />
        
        <main className="flex-1">
          <div className="container-pizza">
            <CategoryMenu 
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
            
            <ProductList 
              products={products} 
              categoryId={activeCategory} 
            />
          </div>
        </main>
        
        <Footer />
        
        <AnimatePresence>
          {isCartOpen && (
            <Cart isOpen={isCartOpen} onClose={toggleCart} />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <MobileMenu 
              isOpen={isMobileMenuOpen}
              onClose={toggleMobileMenu}
              categories={categories}
              onCategoryClick={setActiveCategory}
            />
          )}
        </AnimatePresence>
      </div>
    </CartProvider>
  );
};

export default Index;
