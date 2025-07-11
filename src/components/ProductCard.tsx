
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  description?: string;
  ingredients?: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para adicionar itens ao carrinho",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    toast({
      title: "Item adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-pizza-contrast mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Ingredientes:</p>
            <p className="text-sm text-gray-700 line-clamp-1">
              {product.ingredients.join(', ')}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-pizza">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-pizza hover:bg-pizza-dark text-white transition-colors duration-200 focus:ring-2 focus:ring-pizza focus:ring-offset-2"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={16} className="mr-1" aria-hidden="true" />
            Adicionar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
