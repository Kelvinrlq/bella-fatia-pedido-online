
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// Dados do PIX estatico
const PIX_KEY = "kelvinrx00@gmail.com"; // Chave PIX do tipo e-mail
const MERCHANT_NAME = "Bella Fatia Pizzaria";
const MERCHANT_CITY = "Sua Cidade";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log(`Gerando PIX para pedido ${orderId} no valor de R$ ${value}`);

    // Usar QR code estático da imagem fornecida pelo usuário
    const staticQrCodeImage = "/lovable-uploads/4a3fe2c2-e954-4c87-a77c-a2a54f323edd.png";
    
    // Payload PIX simplificado para copia e cola
    const pixPayload = `00020126580014br.gov.bcb.pix0136${PIX_KEY}5204000053039865802BR5925${MERCHANT_NAME}6009Sua Cidade62070503***6304`;

    console.log(`PIX gerado com sucesso`);

    return new Response(
      JSON.stringify({
        pixCopiaECola: pixPayload,
        qrCodeImage: staticQrCodeImage,
        orderValue: value,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
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
