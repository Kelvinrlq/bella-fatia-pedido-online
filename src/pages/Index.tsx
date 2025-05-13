
import React, { useState } from 'react';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import CategoryMenu from '@/components/CategoryMenu';
import ProductList from '@/components/ProductList';
import Cart from '@/components/Cart';
import MobileMenu from '@/components/MobileMenu';
import { CartProvider } from '@/hooks/use-cart';
import { categories, products } from '@/data/mock-data';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
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
