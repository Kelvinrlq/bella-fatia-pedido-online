import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userSession, setUserSession] = useState<string | null>(null);
  
  useEffect(() => {
    // Monitor auth state changes to clear cart on logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUserId = session?.user?.id || null;
      
      if (event === 'SIGNED_OUT' || (!session && userSession)) {
        // User logged out - clear cart
        console.log('User logged out, clearing cart');
        setItems([]);
        localStorage.removeItem('bella-fatia-cart');
        toast.info('Carrinho esvaziado após logout', { duration: 2000 });
      } else if (event === 'SIGNED_IN' && currentUserId) {
        // User logged in - load cart if exists
        const savedCart = localStorage.getItem('bella-fatia-cart');
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse saved cart', error);
          }
        }
      }
      
      setUserSession(currentUserId);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUserId = session?.user?.id || null;
      setUserSession(currentUserId);
      
      // Only load cart if user is authenticated
      if (currentUserId) {
        const savedCart = localStorage.getItem('bella-fatia-cart');
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse saved cart', error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [userSession]);
  
  useEffect(() => {
    // Save cart to localStorage whenever it changes (only if user is authenticated)
    if (userSession) {
      localStorage.setItem('bella-fatia-cart', JSON.stringify(items));
    }
  }, [items, userSession]);
  
  const addItem = (product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        toast.success('Item adicionado ao carrinho', {
          duration: 2000, // 2 seconds
        });
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      toast.success('Item adicionado ao carrinho', {
        duration: 2000, // 2 seconds
      });
      return [...prevItems, { product, quantity: 1 }];
    });
  };
  
  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      setItems(prevItems => 
        prevItems.map(item => 
          item.product.id === productId 
            ? { ...item, quantity } 
            : item
        )
      );
    } else {
      removeItem(productId);
    }
  };
  
  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    toast.info('Item removido do carrinho', {
      duration: 2000, // 2 seconds
    });
  };
  
  const clearCart = () => {
    setItems([]);
    toast.info('Carrinho esvaziado', {
      duration: 2000, // 2 seconds
    });
  };
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );
  
  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      updateItemQuantity, 
      removeItem, 
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
