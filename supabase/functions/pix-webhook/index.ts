
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Esta função processa webhooks do Mercado Pago quando um pagamento PIX for confirmado.
 */
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

    // Parse do corpo da requisição do Mercado Pago
    const payload = await req.json();
    
    console.log("Webhook recebido do Mercado Pago:", JSON.stringify(payload, null, 2));
    
    // Verificar se é uma notificação de pagamento do Mercado Pago
    if (payload.type === 'payment' && payload.data && payload.data.id) {
      const paymentId = payload.data.id;
      
      console.log("Processando notificação de pagamento ID:", paymentId);
      
      // Buscar detalhes do pagamento no Mercado Pago
      const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      
      if (!accessToken) {
        console.error("MERCADO_PAGO_ACCESS_TOKEN não encontrado");
        return new Response(
          JSON.stringify({ error: "Token de acesso não configurado" }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Buscar informações do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!paymentResponse.ok) {
        console.error("Erro ao buscar pagamento:", paymentResponse.status);
        return new Response(
          JSON.stringify({ error: "Erro ao buscar dados do pagamento" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const paymentData = await paymentResponse.json();
      console.log("Dados do pagamento:", JSON.stringify(paymentData, null, 2));
      
      // Extrair o ID do pedido do external_reference
      const orderId = paymentData.external_reference;
      
      if (!orderId) {
        console.error("ID do pedido não encontrado no external_reference");
        return new Response(
          JSON.stringify({ error: "ID do pedido não encontrado" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Registrar o webhook recebido para fins de debug
      await supabaseClient
        .from('payment_logs')
        .insert({
          order_id: orderId,
          provider: 'mercado_pago',
          transaction_id: paymentId.toString(),
          status: paymentData.status || 'unknown',
          payload: paymentData
        });
      
      console.log(`Status do pagamento: ${paymentData.status} para pedido ${orderId}`);
      
      // Se o pagamento foi aprovado, atualizar o status do pedido
      if (paymentData.status === 'approved') {
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', orderId);
          
        if (updateError) {
          console.error("Erro ao atualizar status do pedido:", updateError);
        } else {
          console.log(`Pedido ${orderId} marcado como pago!`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao processar a requisição" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
