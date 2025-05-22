import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/use-cart';
import { CreditCard, Phone, MapPin } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface CheckoutFormProps {
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setFormData(prev => ({ ...prev, formaPagamento: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        
        // Criar o pedido no Supabase
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
        
        // Inserir os itens do pedido
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems.map(item => ({
            order_id: orderData.id,
            ...item
          })));
          
        if (itemsError) throw itemsError;
        
        // Chamar a função Edge do Supabase para gerar o Pix
        const { data: pixData, error: pixError } = await supabase.functions.invoke('generate-pix', {
          body: { 
            orderId: orderData.id,
            value: totalPrice,
            customerName: formData.nome
          }
        });
        
        if (pixError) throw pixError;
        
        // Atualizar pedido com código Pix
        await supabase
          .from('orders')
          .update({
            pix_code: pixData.pixCopiaECola,
            pix_expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
          })
          .eq('id', orderData.id);
          
        setPixQrCode(pixData.qrCodeImage);
        setOrderId(orderData.id);
        
      } else {
        // Formato dos itens para o WhatsApp
        const itemsText = items.map(item => 
          `${item.quantity}x ${item.product.name} - R$ ${(item.quantity * item.product.price).toFixed(2)}`
        ).join('\n');
        
        // Formato do total
        const totalText = `\nTotal: R$ ${totalPrice.toFixed(2)}`;
        
        // Formato do endereço
        const addressText = `${formData.endereco}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}\n${formData.bairro}`;
        
        // Formato dos detalhes do pagamento
        let paymentText = `Forma de pagamento: ${formData.formaPagamento === 'dinheiro' ? 'Dinheiro' : 
          formData.formaPagamento === 'cartao' ? 'Cartão' : 'PIX'}`;
        
        if (formData.formaPagamento === 'dinheiro' && formData.troco) {
          paymentText += `\nTroco para: R$ ${formData.troco}`;
        }
        
        // Montar mensagem do WhatsApp
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
        
        // Codificar a mensagem para a URL do WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/5567984837419?text=${encodedMessage}`;
        
        // Abrir WhatsApp em uma nova janela
        window.open(whatsappUrl, '_blank');
        
        // Mostrar toast de confirmação
        toast({
          title: "Pedido enviado!",
          description: "Seu pedido foi enviado por WhatsApp. Aguarde a confirmação.",
          duration: 5000,
        });
        
        // Limpar o carrinho e voltar para produtos
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
  if (pixQrCode) {
    return (
      <div className="p-4 space-y-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-center">Pagamento via PIX</h2>
        <p className="text-center">Escaneie o QR Code abaixo ou copie o código para efetuar o pagamento.</p>
        <div className="border p-4 rounded-lg bg-white">
          <img src={pixQrCode} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
        </div>
        <p className="text-sm text-center text-gray-500">O QR Code expira em 5 minutos</p>
        <p className="text-sm text-center">ID do Pedido: <span className="font-mono">{orderId}</span></p>
        <div className="space-y-2 w-full">
          <Button 
            onClick={() => {
              // Verificar status do pedido
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
        <Input 
          id="nome"
          name="nome"
          placeholder="Seu nome completo"
          value={formData.nome}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <div className="flex relative">
          <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="telefone" 
            name="telefone"
            className="pl-10"
            placeholder="(99) 99999-9999"
            value={formData.telefone}
            onChange={handleInputChange}
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
            placeholder="123"
            value={formData.numero}
            onChange={handleInputChange}
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
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-pizza hover:bg-pizza-dark"
        disabled={loading}
      >
        {formData.formaPagamento === 'pix' 
          ? "Gerar QR Code PIX" 
          : "Enviar pedido pelo WhatsApp"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
