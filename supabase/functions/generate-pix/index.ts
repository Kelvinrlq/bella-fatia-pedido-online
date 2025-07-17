
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { orderId, value, customerName, customerEmail } = await req.json();

    if (!orderId || !value || !customerName) {
      return new Response(
        JSON.stringify({ error: "ID do pedido, valor e nome do cliente são obrigatórios" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Gerando PIX via Mercado Pago para pedido ${orderId} no valor de R$ ${value}`);

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
      return new Response(
        JSON.stringify({ error: "Credenciais do Mercado Pago não configuradas" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Preparar dados do pagador
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Criar pagamento PIX no Mercado Pago
    const paymentPayload = {
      transaction_amount: parseFloat(value),
      payment_method_id: "pix",
      payer: {
        email: customerEmail || "cliente@bellafatia.com",
        first_name: firstName,
        last_name: lastName
      },
      description: `Pedido Bella Fatia #${orderId}`,
      external_reference: orderId.toString(),
      date_of_expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
    };

    console.log("Enviando request para Mercado Pago:", JSON.stringify(paymentPayload, null, 2));

    // Fazer request para API do Mercado Pago
    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `bella-fatia-${orderId}-${Date.now()}`
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!mercadoPagoResponse.ok) {
      const errorText = await mercadoPagoResponse.text();
      console.error("Erro na API do Mercado Pago:", mercadoPagoResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Erro ao gerar PIX no Mercado Pago",
          details: errorText
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const paymentData = await mercadoPagoResponse.json();
    console.log("Resposta do Mercado Pago:", JSON.stringify(paymentData, null, 2));

    // Extrair dados do PIX da resposta
    const pointOfInteraction = paymentData.point_of_interaction;
    const transactionData = pointOfInteraction?.transaction_data;

    if (!transactionData || !transactionData.qr_code) {
      console.error("Dados do PIX não encontrados na resposta:", paymentData);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar código PIX" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const qrCodeBase64 = transactionData.qr_code_base64;
    const pixCode = transactionData.qr_code;
    const paymentId = paymentData.id;

    console.log(`PIX gerado com sucesso - Payment ID: ${paymentId}`);

    return new Response(
      JSON.stringify({
        pixCopiaECola: pixCode,
        qrCodeImage: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null,
        orderValue: parseFloat(value),
        paymentId: paymentId,
        expirationDate: paymentData.date_of_expiration || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        status: paymentData.status
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
