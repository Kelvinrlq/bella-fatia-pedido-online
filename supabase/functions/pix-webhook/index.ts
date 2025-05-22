
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Esta função seria chamada por um webhook do seu PSP (Provedor de Serviços de Pagamento)
 * quando um pagamento PIX for confirmado.
 * Você precisaria configurar esse webhook no seu PSP para chamar esta função.
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

    // Parse do corpo da requisição (isso variaria dependendo do formato do webhook do seu PSP)
    const payload = await req.json();
    
    // Extrair informações relevantes (isso deve ser adaptado para corresponder ao formato do webhook do seu PSP)
    // Em um cenário real, você extrairia o ID do pedido e o status do pagamento
    const { txid, status, transactionId } = payload;
    
    // Extrair o ID do pedido (neste exemplo, assumimos que está no formato "***{orderId}")
    const orderId = txid.startsWith("***") ? txid.substring(3) : txid;
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "ID do pedido não encontrado no payload" }),
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
        provider: 'pix_webhook',
        transaction_id: transactionId || null,
        status: status || 'unknown',
        payload: payload
      });
    
    // Se o pagamento foi aprovado, atualizar o status do pedido
    if (status === 'approved' || status === 'confirmed' || status === 'paid') {
      await supabaseClient
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);
      
      // Aqui você poderia adicionar código para enviar uma notificação ao cliente e à pizzaria
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
