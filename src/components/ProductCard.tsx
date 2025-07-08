
import React from 'react';
import { useCart } from '@/hooks/use-cart';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{product.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-lg text-pizza">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          
          <Button
            onClick={() => addItem(product)}
            size="sm"
            className="bg-pizza hover:bg-pizza-dark text-white focus:ring-2 focus:ring-pizza focus:ring-offset-2"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={16} className="mr-1" aria-hidden="true" /> Adicionar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
