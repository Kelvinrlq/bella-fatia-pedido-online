
import React from 'react';
import { MapPin, Phone, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-pizza text-white py-8 mt-16">
      <div className="container-pizza">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Informações de localização */}
          <div className="flex items-center space-x-3">
            <MapPin size={24} />
            <div>
              <p className="font-semibold">Brasil - Corumbá MS</p>
              <p className="text-sm opacity-90">R. América, 428 - Centro</p>
            </div>
          </div>

          {/* Logo central */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-pizza font-bold text-lg">🍕</span>
              </div>
              <h3 className="text-xl font-bold">BELLA FATIA</h3>
            </div>
            <p className="text-xs text-center opacity-75 max-w-xs">
              Imagem meramente ilustrativa. Copyright 2022 © Delivery Bella Fatia - Layout web licenc. Todos os direitos reservados.
            </p>
          </div>

          {/* Contato e redes sociais */}
          <div className="flex flex-col items-center md:items-end space-y-3">
            <div className="flex items-center space-x-2">
              <Phone size={18} />
              <span className="font-semibold">(67) 99224-2681</span>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm mb-2">Compartilhe algo delicioso</p>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  aria-label="Twitter"
                >
                  <span className="font-bold text-sm">𝕏</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
