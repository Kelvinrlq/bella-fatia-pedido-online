
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/use-cart';
import { CreditCard, Phone, MapPin } from 'lucide-react';

interface CheckoutFormProps {
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel }) => {
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    number: '',
    neighborhood: '',
    complement: '',
    paymentMethod: 'cash',
    change: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the items for WhatsApp message
    const itemsText = items.map(item => 
      `${item.quantity}x ${item.product.name} - R$ ${(item.quantity * item.product.price).toFixed(2)}`
    ).join('\n');
    
    // Format the total
    const totalText = `\nTotal: R$ ${totalPrice.toFixed(2)}`;
    
    // Format the address
    const addressText = `${formData.address}, ${formData.number}${formData.complement ? `, ${formData.complement}` : ''}\n${formData.neighborhood}`;
    
    // Format payment details
    let paymentText = `Forma de pagamento: ${formData.paymentMethod === 'cash' ? 'Dinheiro' : 
      formData.paymentMethod === 'card' ? 'Cartão' : 'PIX'}`;
    
    if (formData.paymentMethod === 'cash' && formData.change) {
      paymentText += `\nTroco para: R$ ${formData.change}`;
    }
    
    // Build the WhatsApp message
    const message = `
*Novo Pedido da Bella Fatia*
*Nome*: ${formData.name}
*Telefone*: ${formData.phone}
*Endereço*: ${addressText}

*Itens do Pedido*:
${itemsText}
${totalText}

${paymentText}
${formData.notes ? `\n*Observações*: ${formData.notes}` : ''}`;
    
    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5567984837419?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
    
    // Show confirmation toast
    toast({
      title: "Pedido enviado!",
      description: "Seu pedido foi enviado por WhatsApp. Aguarde a confirmação.",
      duration: 5000,
    });
    
    // Clear the cart and go back to products
    clearCart();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Dados para entrega</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input 
          id="name"
          name="name"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <div className="flex relative">
          <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="phone" 
            name="phone"
            className="pl-10"
            placeholder="(99) 99999-9999"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <div className="flex relative">
          <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            id="address" 
            name="address"
            className="pl-10"
            placeholder="Rua, Avenida, etc."
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="number">Número</Label>
          <Input 
            id="number" 
            name="number"
            placeholder="123"
            value={formData.number}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input 
            id="neighborhood" 
            name="neighborhood"
            placeholder="Seu bairro"
            value={formData.neighborhood}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="complement">Complemento (opcional)</Label>
        <Input 
          id="complement" 
          name="complement"
          placeholder="Apto, bloco, referência, etc."
          value={formData.complement}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Forma de Pagamento</Label>
        <RadioGroup 
          value={formData.paymentMethod} 
          onValueChange={handlePaymentChange}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash">Dinheiro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center">
              <CreditCard size={16} className="mr-1" /> Cartão (na entrega)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix">PIX</Label>
          </div>
        </RadioGroup>
      </div>
      
      {formData.paymentMethod === 'cash' && (
        <div className="space-y-2">
          <Label htmlFor="change">Troco para</Label>
          <Input 
            id="change" 
            name="change"
            placeholder="R$ 50,00"
            value={formData.change}
            onChange={handleInputChange}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea 
          id="notes" 
          name="notes"
          placeholder="Instruções especiais para o pedido ou entrega"
          value={formData.notes}
          onChange={handleInputChange}
        />
      </div>
      
      <Button type="submit" className="w-full bg-pizza hover:bg-pizza-dark">
        Enviar pedido pelo WhatsApp
      </Button>
    </form>
  );
};

export default CheckoutForm;
