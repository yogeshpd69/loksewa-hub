import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if we already have news for today in daily_news table
    const { data: existingNews } = await supabase
      .from('daily_news')
      .select('articles')
      .eq('date', todayStr)
      .single();

    if (existingNews && existingNews.articles.length > 0) {
      return new Response(
        JSON.stringify(existingNews.articles),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch news from Kcha Khabar API
    const response = await fetch('https://kchakhabar.com/api/v1/today.json?limit=10');
    if (!response.ok) {
      throw new Error(`Failed to fetch Kchakhabar API: ${response.status}`);
    }
    
    const apiData = await response.json();
    const items = apiData.stories || [];
    const articles = [];

    for (const item of items) {
      if (articles.length >= 6) break; // keep top 6
      
      const title = item.topic_en || item.topic_ne || '';
      const summary = item.summary_en || item.summary_ne || '';
      const link = (item.sources && item.sources.length > 0) ? item.sources[0].url : '';
      const publisher = (item.sources && item.sources.length > 0) ? item.sources[0].publisher : 'Kcha Khabar API';

      if (title && link) {
        articles.push({
          id: item.id || link,
          title,
          summary,
          category: publisher, // Storing publisher in category field for UI display flexibility
          importance: 'high',
          url: link
        });
      }
    }

    // Save to DB
    if (articles.length > 0) {
      await supabase
        .from('daily_news')
        .insert({ date: todayStr, articles });
    }

    return new Response(
      JSON.stringify(articles),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
