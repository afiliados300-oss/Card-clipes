import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({ product, onClose }) => {
  const { addToCart } = useApp();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] w-full rounded-t-3xl p-6 pb-8 min-h-[50vh] flex flex-col gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
        
        <div className="flex gap-4">
            <img src={product.image} alt={product.name} className="w-24 h-24 rounded-xl object-cover bg-gray-800" />
            <div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                    {'★'.repeat(Math.round(product.rating))}
                    <span className="text-gray-400 ml-1">({product.reviews} avaliações)</span>
                </div>
                <p className="text-2xl font-bold text-neon-blue mt-2">R$ {product.price.toFixed(2)}</p>
            </div>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-sm text-gray-300">{product.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
             <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Frete</span>
                <span className="text-green-400">Grátis com ClipCart Prime</span>
             </div>
            <button 
                onClick={() => {
                    addToCart(product);
                    onClose();
                }}
                className="w-full bg-neon-pink hover:bg-pink-600 text-white font-bold py-4 rounded-full shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all active:scale-95"
            >
                Adicionar ao Carrinho
            </button>
        </div>
      </div>
    </div>
  );
};