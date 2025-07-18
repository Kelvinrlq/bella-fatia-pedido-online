
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

export interface PaymentStatusHook {
  paymentStatus: 'pending' | 'paid' | 'expired';
  isChecking: boolean;
  paymentConfirmed: boolean;
  lastCheck: Date | null;
  checkPaymentStatus: (orderId: string) => Promise<void>;
  resetPaymentConfirmed: () => void;
}

export const usePaymentStatus = (): PaymentStatusHook => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkPaymentStatus = async (orderId: string) => {
    if (!orderId) {
      console.log('❌ checkPaymentStatus: orderId não fornecido');
      return;
    }
    
    console.log(`🔍 Verificando status do pagamento para pedido: ${orderId}`);
    setIsChecking(true);
    setLastCheck(new Date());
    
    try {
      // Verificar diretamente no banco de dados
      const { data: order, error } = await supabase
        .from('orders')
        .select('status, pix_expiration')
        .eq('id', orderId)
        .single();
        
      if (error) {
        console.error('❌ Erro ao verificar status do pedido:', error);
        return;
      }

      console.log(`📊 Status atual do pedido ${orderId}:`, {
        status: order.status,
        pix_expiration: order.pix_expiration,
        currentTime: new Date().toISOString()
      });
      
      // Verificar se expirou
      if (order.status === 'pending' && order.pix_expiration) {
        const now = new Date();
        const expiration = new Date(order.pix_expiration);
        
        console.log(`⏰ Verificando expiração: agora=${now.toISOString()}, expira=${expiration.toISOString()}`);
        
        if (now > expiration) {
          console.log('⏰ PIX expirou, atualizando status...');
          
          // Chamar função para atualizar status
          const { error: updateError } = await supabase.functions.invoke('check-pix-status', {
            body: { orderId }
          });
          
          if (updateError) {
            console.error('❌ Erro ao atualizar status expirado:', updateError);
          }
          
          setPaymentStatus('expired');
          toast({
            title: "⏰ PIX Expirado",
            description: "O tempo para pagamento expirou. Faça um novo pedido.",
            variant: "destructive",
            duration: 6000,
          });
          return;
        }
      }
      
      // Verificar se foi pago
      if (order.status === 'paid') {
        console.log('🎉 Pagamento confirmado!');
        
        if (paymentStatus !== 'paid') {
          setPaymentStatus('paid');
          setPaymentConfirmed(true);
          toast({
            title: "🎉 Pagamento Confirmado!",
            description: "Seu pagamento PIX foi aprovado com sucesso!",
            duration: 8000,
          });
        }
      } else if (order.status === 'expired') {
        console.log('⏰ Status expirado encontrado no banco');
        setPaymentStatus('expired');
        toast({
          title: "⏰ PIX Expirado",
          description: "O tempo para pagamento expirou. Faça um novo pedido.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        console.log('⏳ Pagamento ainda pendente');
        setPaymentStatus('pending');
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const resetPaymentConfirmed = () => {
    console.log('🔄 Resetando status de pagamento confirmado');
    setPaymentConfirmed(false);
    setPaymentStatus('pending');
  };

  return {
    paymentStatus,
    isChecking,
    paymentConfirmed,
    lastCheck,
    checkPaymentStatus,
    resetPaymentConfirmed
  };
};
