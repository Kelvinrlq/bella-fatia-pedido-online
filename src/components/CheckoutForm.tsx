import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/use-cart';
import { CreditCard, Phone, MapPin, User, Link } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface CheckoutFormProps {
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{qrCodeImage: string, pixCopiaECola: string, orderValue: number} | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    complemento: '',
    formaPagamento: 'dinheiro',
    troco: '',
    observacoes: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    nome: false,
    telefone: false,
    numero: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validação para o campo nome - não permitir números
    if (name === 'nome') {
      const hasNumbers = /\d/.test(value);
      
      if (hasNumbers) {
        setValidationErrors(prev => ({ ...prev, nome: true }));
        toast({
          title: "Erro de validação",
          description: "O nome não pode conter números",
          variant: "destructive",
          duration: 3000,
        });
        return;
      } else {
        setValidationErrors(prev => ({ ...prev, nome: false }));
      }
    }
    
    // Validação para campos que devem conter apenas números
    if (name === 'telefone' || name === 'numero') {
      const onlyNumbers = /^[0-9\s\(\)\-]*$/;
      
      if (value && !onlyNumbers.test(value)) {
        setValidationErrors(prev => ({ ...prev, [name]: true }));
        toast({
          title: "Erro de validação",
          description: `O campo ${name === 'telefone' ? 'telefone' : 'número'} deve conter apenas números`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      } else {
        setValidationErrors(prev => ({ ...prev, [name]: false }));
      }
      
      // Validação específica para telefone - limite de 11 dígitos
      if (name === 'telefone') {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        if (numbersOnly.length > 11) {
          setValidationErrors(prev => ({ ...prev, telefone: true }));
          toast({
            title: "Erro de validação",
            description: "O telefone deve ter no máximo 11 dígitos",
            variant: "destructive",
            duration: 3000,
          });
          return;
        } else {
          setValidationErrors(prev => ({ ...prev, telefone: false }));
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setFormData(prev => ({ ...prev, formaPagamento: value }));
  };

  const isFormValid = () => {
    return !validationErrors.nome &&
           !validationErrors.telefone && 
           !validationErrors.numero && 
           formData.nome && 
           formData.telefone && 
           formData.endereco && 
           formData.numero && 
           formData.bairro;
  };

  const triggerWebhook = async (orderData: any) => {
    if (!webhookUrl) return;

    try {
      console.log('Enviando webhook para:', webhookUrl);
      
      const webhookPayload = {
        orderId: orderData.id,
        customerName: formData.nome,
        customerPhone: formData.telefone,
        customerAddress: `${formData.endereco}, ${formData.numero}, ${formData.bairro}${formData.complemento ? ', ' + formData.complemento : ''}`,
        totalPrice: totalPrice,
        paymentMethod: formData.formaPagamento,
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.quantity * item.product.price
        })),
        status: 'pending',
        timestamp: new Date().toISOString(),
        observations: formData.observacoes || null
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(webhookPayload),
      });

      console.log('Webhook enviado com sucesso');
      toast({
        title: "Webhook enviado",
        description: "Notificação enviada para o sistema configurado",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast({
        title: "Erro no webhook",
        description: "Falha ao enviar notificação, mas o pedido foi processado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, preencha todos os campos obrigatórios corretamente",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (formData.formaPagamento === 'pix') {
        // Preparar os items para o pedido
        const orderItems = items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.quantity * item.product.price
        }));
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_name: formData.nome,
            customer_phone: formData.telefone,
            customer_address: `${formData.endereco}, ${formData.numero}, ${formData.bairro}${formData.complemento ? ', ' + formData.complemento : ''}`,
            total_price: totalPrice,
            payment_method: 'pix',
            status: 'pending'
          })
          .select()
          .single();
          
        if (orderError) throw orderError;
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems.map(item => ({
            order_id: orderData.id,
            ...item
          })));
          
        if (itemsError) throw itemsError;
        
        console.log('Gerando PIX com valor total:', totalPrice);
        
        const { data: pixResponse, error: pixError } = await supabase.functions.invoke('generate-pix', {
          body: { 
            orderId: orderData.id,
            value: totalPrice,
            customerName: formData.nome
          }
        });
        
        if (pixError) {
          console.error('Erro na função PIX:', pixError);
          throw pixError;
        }
        
        console.log('PIX gerado com sucesso:', pixResponse);
        
        await supabase
          .from('orders')
          .update({
            pix_code: pixResponse.pixCopiaECola,
            pix_expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          })
          .eq('id', orderData.id);

        // Enviar webhook após criar o pedido PIX
        await triggerWebhook(orderData);
          
        setPixData({
          qrCodeImage: pixResponse.qrCodeImage,
          pixCopiaECola: pixResponse.pixCopiaECola,
          orderValue: pixResponse.orderValue || totalPrice
        });
        setOrderId(orderData.id);
        
      } else {
        // Criar pedido para outros métodos de pagamento
        const orderItems = items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.quantity * item.product.price
        }));
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_name: formData.nome,
            customer_phone: formData.telefone,
            customer_address: `${formData.endereco}, ${formData.numero}, ${formData.bairro}${formData.complemento ? ', ' + formData.complemento : ''}`,
            total_price: totalPrice,
            payment_method: formData.formaPagamento,
            status: 'pending'
          })
          .select()
          .single();
          
        if (orderError) throw orderError;
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems.map(item => ({
            order_id: orderData.id,
            ...item
          })));
          
        if (itemsError) throw itemsError;

        // Enviar webhook após criar o pedido
        await triggerWebhook(orderData);
        
        // Formato dos itens para o WhatsApp
        const itemsText = items.map(item => 
          `${item.quantity}x ${item.product.name} - R$ ${(item.quantity * item.product.price).toFixed(2)}`
        ).join('\n');
        
        const totalText = `\nTotal: R$ ${totalPrice.toFixed(2)}`;
        const addressText = `${formData.endereco}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}\n${formData.bairro}`;
        
        let paymentText = `Forma de pagamento: ${formData.formaPagamento === 'dinheiro' ? 'Dinheiro' : 
          formData.formaPagamento === 'cartao' ? 'Cartão' : 'PIX'}`;
        
        if (formData.formaPagamento === 'dinheiro' && formData.troco) {
          paymentText += `\nTroco para: R$ ${formData.troco}`;
        }
        
        const message = `
*Novo Pedido da Bella Fatia*
*Nome*: ${formData.nome}
*Telefone*: ${formData.telefone}
*Endereço*: ${addressText}

*Itens do Pedido*:
${itemsText}
${totalText}

${paymentText}
${formData.observacoes ? `\n*Observações*: ${formData.observacoes}` : ''}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/5567984837419?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "Pedido enviado!",
          description: "Seu pedido foi enviado por WhatsApp. Aguarde a confirmação.",
          duration: 5000,
        });
        
        clearCart();
        onCancel();
      }
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      toast({
        title: "Erro ao processar o pagamento",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Se temos um QR code Pix para mostrar
  if (pixData) {
    return (
      <div className="p-4 space-y-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-center">Pagamento via PIX</h2>
        <p className="text-center">Escaneie o QR Code abaixo para efetuar o pagamento de <strong>R$ {pixData.orderValue.toFixed(2)}</strong></p>
        <div className="border p-4 rounded-lg bg-white">
          <img src={pixData.qrCodeImage} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
        </div>
        <div className="w-full max-w-md">
          <Label htmlFor="pix-code" className="text-sm font-medium">Código PIX (Copia e Cola):</Label>
          <div className="flex gap-2 mt-1">
            <Input 
              id="pix-code"
              value={pixData.pixCopiaECola} 
              readOnly 
              className="text-xs"
            />
            <Button 
              onClick={() => navigator.clipboard.writeText(pixData.pixCopiaECola)}
              variant="outline"
              size="sm"
            >
              Copiar
            </Button>
          </div>
        </div>
        <p className="text-sm text-center text-gray-500">O QR Code expira em 15 minutos</p>
        <p className="text-sm text-center">ID do Pedido: <span className="font-mono">{orderId}</span></p>
        <div className="space-y-2 w-full">
          <Button 
            onClick={() => {
              window.location.href = `/status-pedido/${orderId}`;
            }}
            className="w-full bg-pizza hover:bg-pizza-dark"
          >
            Verificar Status do Pedido
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full border-gray-200 text-gray-500"
          >
            Voltar para a Loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Dados para entrega</h2>
      
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <div className="flex relative">
          <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="nome"
            name="nome"
            className={`pl-10 ${validationErrors.nome ? 'border-red-500' : ''}`}
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleInputChange}
            maxLength={100}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <div className="flex relative">
          <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="telefone" 
            name="telefone"
            className={`pl-10 ${validationErrors.telefone ? 'border-red-500' : ''}`}
            placeholder="(99) 99999-9999"
            value={formData.telefone}
            onChange={handleInputChange}
            maxLength={15}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <div className="flex relative">
          <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="endereco" 
            name="endereco"
            className="pl-10"
            placeholder="Rua, Avenida, etc."
            value={formData.endereco}
            onChange={handleInputChange}
            maxLength={200}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input 
            id="numero" 
            name="numero"
            className={validationErrors.numero ? 'border-red-500' : ''}
            placeholder="123"
            value={formData.numero}
            onChange={handleInputChange}
            maxLength={10}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input 
            id="bairro" 
            name="bairro"
            placeholder="Seu bairro"
            value={formData.bairro}
            onChange={handleInputChange}
            maxLength={50}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="complemento">Complemento (opcional)</Label>
        <Input 
          id="complemento" 
          name="complemento"
          placeholder="Apto, bloco, referência, etc."
          value={formData.complemento}
          onChange={handleInputChange}
          maxLength={100}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Forma de Pagamento</Label>
        <RadioGroup 
          value={formData.formaPagamento} 
          onValueChange={handlePaymentChange}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dinheiro" id="dinheiro" />
            <Label htmlFor="dinheiro">Dinheiro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cartao" id="cartao" />
            <Label htmlFor="cartao" className="flex items-center">
              <CreditCard size={16} className="mr-1" /> Cartão (na entrega)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix">PIX</Label>
          </div>
        </RadioGroup>
      </div>
      
      {formData.formaPagamento === 'dinheiro' && (
        <div className="space-y-2">
          <Label htmlFor="troco">Troco para</Label>
          <Input 
            id="troco" 
            name="troco"
            placeholder="R$ 50,00"
            value={formData.troco}
            onChange={handleInputChange}
            maxLength={10}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea 
          id="observacoes" 
          name="observacoes"
          placeholder="Instruções especiais para o pedido ou entrega"
          value={formData.observacoes}
          onChange={handleInputChange}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook">URL do Webhook (opcional)</Label>
        <div className="flex relative">
          <Link size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="webhook" 
            name="webhook"
            className="pl-10"
            placeholder="https://seu-sistema.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            maxLength={500}
          />
        </div>
        <p className="text-xs text-gray-500">
          Configure uma URL para receber notificações automáticas quando o pedido for finalizado
        </p>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total do Pedido:</span>
          <span className="text-pizza">R$ {totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-pizza hover:bg-pizza-dark"
        disabled={loading || !isFormValid()}
      >
        {loading ? "Processando..." : (
          formData.formaPagamento === 'pix' 
            ? `Gerar PIX - R$ ${totalPrice.toFixed(2)}` 
            : "Enviar pedido pelo WhatsApp"
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;
