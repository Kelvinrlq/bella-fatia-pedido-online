
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

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
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "ID do pedido é obrigatório" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verificar status atual do pedido
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, status, pix_expiration')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Pedido não encontrado" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verificar se o PIX expirou
    const now = new Date();
    const expirationDate = order.pix_expiration ? new Date(order.pix_expiration) : null;

    if (order.status === 'pending' && expirationDate && now > expirationDate) {
      // Atualizar status para expirado
      await supabaseClient
        .from('orders')
        .update({ status: 'expired' })
        .eq('id', orderId);
      
      order.status = 'expired';
    }

    return new Response(
      JSON.stringify({
        status: order.status,
        orderId: order.id,
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
