
import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutForm from './CheckoutForm';
import { Product } from './ProductCard';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const { items, updateItemQuantity, removeItem, clearCart, totalPrice } = useCart();
  const isMobile = useIsMobile();

  const toggleCheckout = () => {
    setIsCheckout(!isCheckout);
  };

  const cartVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

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
        className="absolute top-0 right-0 w-full md:w-96 h-full bg-white shadow-lg"
        variants={cartVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ type: 'tween', duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do Carrinho */}
          <div className="flex items-center justify-between p-4 border-b">
            {isCheckout ? (
              <button onClick={toggleCheckout} className="text-pizza">
                <X size={24} className="mr-2" /> Voltar ao carrinho
              </button>
            ) : (
              <div className="flex items-center">
                <ShoppingCart size={20} className="text-pizza mr-2" />
                <h2 className="text-lg font-semibold">Seu pedido</h2>
              </div>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          {/* Conteúdo do Carrinho ou Formulário de Checkout */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {isCheckout ? (
                <CheckoutForm onCancel={toggleCheckout} />
              ) : (
                <motion.div
                  key="cart-items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <ShoppingCart size={64} className="text-gray-300 mb-4" />
                      <p className="text-gray-500 text-center">
                        Seu carrinho está vazio. Adicione alguns itens deliciosos!
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 px-2">
                      {items.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex py-2 px-2 rounded-lg mb-2"
                        >
                          <div className="w-16 h-16 rounded overflow-hidden mr-2 flex-shrink-0">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-sm">{item.product.name}</h3>
                              <button 
                                onClick={() => removeItem(item.product.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex items-center border rounded">
                                <button
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="px-2 py-1 text-gray-500 disabled:text-gray-300"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="px-2 text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                                  className="px-2 py-1 text-gray-500"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="text-sm font-semibold">
                                {new Intl.NumberFormat('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                }).format(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Rodapé do Carrinho com Totais e Botão de Checkout */}
          {!isCheckout && items.length > 0 && (
            <div className="p-4 border-t">
              <div className="space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxa de entrega</span>
                  <span>Grátis</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={toggleCheckout}
                  className="w-full bg-pizza hover:bg-pizza-dark"
                >
                  Finalizar pedido
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full border-gray-200 text-gray-500"
                >
                  Limpar carrinho
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Cart;
