import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

export interface PaymentStatusHook {
  paymentStatus: 'pending' | 'paid' | 'expired';
  isChecking: boolean;
  checkPaymentStatus: (orderId: string) => Promise<void>;
}

export const usePaymentStatus = (): PaymentStatusHook => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkPaymentStatus = async (orderId: string) => {
    if (!orderId) return;
    
    setIsChecking(true);
    
    try {
      // Primeiro, verificar diretamente no banco de dados
      const { data: order, error } = await supabase
        .from('orders')
        .select('status, pix_expiration')
        .eq('id', orderId)
        .single();
        
      if (error) {
        console.error('Erro ao verificar status do pedido:', error);
        return;
      }
      
      // Verificar se expirou
      if (order.status === 'pending' && order.pix_expiration) {
        const now = new Date();
        const expiration = new Date(order.pix_expiration);
        
        if (now > expiration) {
          // Chamar função para atualizar status
          await supabase.functions.invoke('check-pix-status', {
            body: { orderId }
          });
          
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
      
      if (order.status === 'paid') {
        setPaymentStatus('paid');
        toast({
          title: "🎉 Pagamento Confirmado!",
          description: "Seu pagamento PIX foi aprovado com sucesso! Agora você pode enviar o pedido.",
          duration: 6000,
        });
      } else if (order.status === 'expired') {
        setPaymentStatus('expired');
        toast({
          title: "⏰ PIX Expirado",
          description: "O tempo para pagamento expirou. Faça um novo pedido.",
          variant: "destructive",
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    paymentStatus,
    isChecking,
    checkPaymentStatus
  };
};