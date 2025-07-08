
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: "/lovable-uploads/71d38120-aa29-4182-9d66-78574376020a.png",
    title: "Nosso Delivery Tá ON",
    description: "R. América, 438 - Centro, Corumbá - MS"
  },
  {
    id: 2,
    image: "/lovable-uploads/31dcc8d7-824d-4b9c-ac26-b8d8ee1809d6.png",
    title: "Qual a Sua Metade?",
    description: "Escolha seus dois favoritos"
  },
  {
    id: 3,
    image: "/lovable-uploads/43e0ff55-4309-498f-ad05-5cded51afb5f.png",
    title: "Promoção Dia da Pizza",
    description: "Apenas R$ 39,90"
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
            <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-start justify-end p-4 md:p-8">
              <h2 className="text-white text-xl md:text-3xl font-bold">{banner.title}</h2>
              <p className="text-white text-sm md:text-base">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white z-10 focus:ring-2 focus:ring-pizza focus:ring-offset-2 focus:bg-opacity-70"
        aria-label="Banner anterior"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white z-10 focus:ring-2 focus:ring-pizza focus:ring-offset-2 focus:bg-opacity-70"
        aria-label="Próximo banner"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full focus:ring-2 focus:ring-pizza focus:ring-offset-2 ${
              index === currentBanner ? 'bg-pizza' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => setCurrentBanner(index)}
            aria-label={`Ir para o banner ${index + 1}`}
            aria-current={index === currentBanner ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
