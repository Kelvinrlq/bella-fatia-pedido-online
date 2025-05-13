
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: "https://img.freepik.com/free-photo/top-view-pepperoni-pizza-with-mushroom-sausages-bell-pepper-olive-corn-black-wooden_141793-2158.jpg",
    title: "Pizza Tradicional",
    description: "Experimente nossas pizzas tradicionais"
  },
  {
    id: 2,
    image: "https://img.freepik.com/free-photo/mixed-pizza-with-various-ingridients_140725-3790.jpg",
    title: "Especial do Dia",
    description: "30% off em todas as pizzas especiais"
  },
  {
    id: 3,
    image: "https://img.freepik.com/free-photo/delicious-italian-food_1147-165.jpg",
    title: "Combo Família",
    description: "2 pizzas grandes + refrigerante 2L"
  }
];

const Banner: React.FC = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  
  const nextSlide = () => {
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-40 md:h-64 overflow-hidden">
      <div 
        className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="min-w-full h-full relative"
          >
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-start justify-end p-4 md:p-8">
              <h2 className="text-white text-xl md:text-3xl font-bold">{banner.title}</h2>
              <p className="text-white text-sm md:text-base">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white z-10"
        aria-label="Banner anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white z-10"
        aria-label="Próximo banner"
      >
        <ChevronRight size={20} />
      </button>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentBanner ? 'bg-pizza' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => setCurrentBanner(index)}
            aria-label={`Ir para o banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
