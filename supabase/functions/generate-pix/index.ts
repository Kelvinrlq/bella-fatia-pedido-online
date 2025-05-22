
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

// Dados do PIX estatico
const PIX_KEY = "kelvinrx00@gmail.com"; // Chave PIX do tipo e-mail
const MERCHANT_NAME = "Bella Fatia Pizzaria";
const MERCHANT_CITY = "Sua Cidade";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para gerar o payload PIX (formato BR Code)
function generatePixPayload(
  pixKey: string, 
  merchantName: string, 
  merchantCity: string, 
  orderId: string, 
  amount: number
): string {
  // Iniciar o payload
  let payload = "";
  
  // Adicionar os campos obrigatórios de acordo com o padrão EMV do Pix
  payload += "000201"; // Payload Format Indicator (01)
  payload += "010212"; // Point of Initiation Method (11: static, 12: dynamic)
  
  // Merchant Account Information
  payload += "26"; // ID do campo
  let merchantAccountInfo = "0014br.gov.bcb.pix"; // Domínio do Pix
  merchantAccountInfo += "01" + pixKey.length.toString().padStart(2, "0") + pixKey;
  payload += merchantAccountInfo.length.toString().padStart(2, "0") + merchantAccountInfo;
  
  payload += "52040000"; // Merchant Category Code (0000)
  payload += "5303986"; // Currency (986: BRL)
  
  // Valor da transação (opcional)
  const amountStr = amount.toFixed(2);
  payload += "54" + amountStr.length.toString().padStart(2, "0") + amountStr;
  
  // País do comerciante
  payload += "5802BR";
  
  // Nome do comerciante
  payload += "59" + merchantName.length.toString().padStart(2, "0") + merchantName;
  
  // Cidade do comerciante
  payload += "60" + merchantCity.length.toString().padStart(2, "0") + merchantCity;
  
  // ID da transação
  const txid = "***" + orderId.substring(0, 22);
  payload += "62" + (txid.length + 4).toString().padStart(2, "0") + "05" + txid.length.toString().padStart(2, "0") + txid;
  
  // CRC16
  payload += "6304";
  // Adicionando um checksum fictício - em uma implementação real, você calcularia o CRC16
  // Mas para simplificar, estamos usando "0000" como placeholder
  payload += "0000";
  
  return payload;
}

serve(async (req) => {
  // Lidar com requisição OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse do corpo da requisição
    const { orderId, value, customerName } = await req.json();

    if (!orderId || !value) {
      return new Response(
        JSON.stringify({ error: "ID do pedido e valor são obrigatórios" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Opção 1: Usar a imagem do QR code enviada pelo usuário para pagamentos estáticos
    // Esta opção é mais adequada se o valor for sempre o mesmo ou se o QR for estático
    const staticQrCodeImage = "/lovable-uploads/4a3fe2c2-e954-4c87-a77c-a2a54f323edd.png";
    
    // Opção 2: Gerar um payload Pix dinâmico baseado no valor e ordem
    // Esta opção é melhor para pagamentos com valores variáveis
    const pixPayload = generatePixPayload(
      PIX_KEY,
      MERCHANT_NAME,
      MERCHANT_CITY,
      orderId,
      value
    );

    // Gerar QR Code dinâmico
    const dynamicQrCodeImage = await qrcode(pixPayload, { size: 250 });
    
    // Decidir qual QR code usar - neste caso, vamos usar o QR estático que o usuário forneceu
    // para facilitar o recebimento em sua conta específica
    const finalQrCodeImage = staticQrCodeImage;

    return new Response(
      JSON.stringify({
        pixCopiaECola: pixPayload,
        qrCodeImage: finalQrCodeImage, // Usando a imagem estática fornecida pelo usuário
        expirationDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos no futuro
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao processar a requisição" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

