
import React from 'react';
import ProductCard, { Product } from './ProductCard';

interface ProductListProps {
  products: Product[];
  categoryId: string;
}

const ProductList: React.FC<ProductListProps> = ({ products, categoryId }) => {
  const filteredProducts = categoryId === 'all' 
    ? products 
    : products.filter(product => product.categoryId === categoryId);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      {filteredProducts.length === 0 && (
        <div className="col-span-full py-8 text-center text-gray-500">
          Nenhum produto encontrado nesta categoria.
        </div>
      )}
    </div>
  );
};

export default ProductList;
