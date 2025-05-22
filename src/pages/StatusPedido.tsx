
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface OrderStatus {
  id: string;
  status: string;
  created_at: string;
  total_price: number;
}

const StatusPedido = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, created_at, total_price')
          .eq('id', orderId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) {
          setError('Pedido não encontrado. Verifique o ID informado.');
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error('Erro ao carregar status do pedido:', err);
        setError('Erro ao carregar os dados do pedido. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    // Buscar status inicial
    fetchOrderStatus();
    
    // Configurar polling a cada 30 segundos para atualizar status
    const interval = setInterval(fetchOrderStatus, 30000);
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  const getStatusIcon = () => {
    if (!order) return <Clock className="w-12 h-12 text-gray-400" />;
    
    switch (order.status) {
      case 'paid':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      default:
        return <Clock className="w-12 h-12 text-yellow-500" />;
    }
  };
  
  const getStatusText = () => {
    if (!order) return 'Carregando...';
    
    switch (order.status) {
      case 'pending':
        return 'Aguardando pagamento';
      case 'paid':
        return 'Pagamento confirmado';
      case 'expired':
        return 'Pagamento expirado';
      case 'completed':
        return 'Pedido entregue';
      case 'cancelled':
        return 'Pedido cancelado';
      default:
        return order.status;
    }
  };
  
  const getStatusMessage = () => {
    if (!order) return '';
    
    switch (order.status) {
      case 'pending':
        return 'Seu pagamento ainda não foi identificado. Por favor, complete o pagamento com o QR Code fornecido.';
      case 'paid':
        return 'Seu pagamento foi confirmado! Estamos preparando seu pedido para entrega.';
      case 'expired':
        return 'O tempo para pagamento expirou. Por favor, faça um novo pedido.';
      case 'completed':
        return 'Seu pedido foi entregue. Agradecemos a preferência!';
      case 'cancelled':
        return 'Este pedido foi cancelado.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center p-8">
            <Clock className="w-16 h-16 text-gray-400 animate-pulse" />
            <h2 className="mt-4 text-xl font-semibold">Carregando status do pedido...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Erro</h2>
            <p className="mt-2 text-gray-600 text-center">{error}</p>
            <Link to="/">
              <Button className="mt-6 bg-pizza hover:bg-pizza-dark">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm">
          {getStatusIcon()}
          <h2 className="mt-4 text-xl font-semibold">Status do Pedido</h2>
          <div className="mt-4 w-full">
            <div className="flex justify-between text-sm text-gray-500">
              <span>ID do Pedido</span>
              <span className="font-mono">{order?.id}</span>
            </div>
            <div className="flex justify-between mt-2 font-semibold">
              <span>Status</span>
              <span>{getStatusText()}</span>
            </div>
            {order && (
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Data</span>
                <span>{new Date(order.created_at).toLocaleString('pt-BR')}</span>
              </div>
            )}
            {order && (
              <div className="flex justify-between mt-2 text-sm">
                <span>Valor</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}
                </span>
              </div>
            )}
          </div>
          <p className="mt-6 text-center text-sm">{getStatusMessage()}</p>
          <Link to="/">
            <Button className="mt-6 bg-pizza hover:bg-pizza-dark">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar para a página inicial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatusPedido;
