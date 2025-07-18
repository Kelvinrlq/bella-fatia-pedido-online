
import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentStatusBannerProps {
  status: 'pending' | 'paid' | 'expired';
  isChecking: boolean;
  paymentConfirmed: boolean;
}

const PaymentStatusBanner: React.FC<PaymentStatusBannerProps> = ({ 
  status, 
  isChecking, 
  paymentConfirmed 
}) => {
  if (status === 'paid' || paymentConfirmed) {
    return (
      <Alert className="border-green-500 bg-green-50 animate-scale-in mb-6">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <AlertTitle className="text-green-800 text-lg font-bold">
          🎉 Pagamento Confirmado!
        </AlertTitle>
        <AlertDescription className="text-green-700 text-base">
          Seu pagamento PIX foi aprovado com sucesso! Agora você pode enviar o pedido pelo WhatsApp.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'expired') {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-6 w-6" />
        <AlertTitle className="text-lg font-bold">
          ⏰ PIX Expirado
        </AlertTitle>
        <AlertDescription className="text-base">
          O tempo para pagamento expirou. Por favor, faça um novo pedido.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'pending') {
    return (
      <Alert className="border-amber-500 bg-amber-50 mb-6">
        <Clock className="h-6 w-6 text-amber-600" />
        <AlertTitle className="text-amber-800 text-lg font-bold">
          ⏳ Aguardando Pagamento
        </AlertTitle>
        <AlertDescription className="text-amber-700 text-base">
          Escaneie o QR Code ou use o código PIX para efetuar o pagamento.
          {isChecking && (
            <span className="block mt-2 text-sm">
              <span className="inline-block animate-pulse mr-2">🔄</span>
              Verificando pagamento automaticamente...
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentStatusBanner;
