import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { XMLParser } from "npm:fast-xml-parser@4.3.5";

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

    // Fetch RSS
    const response = await fetch('https://english.onlinekhabar.com/feed');
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Parse RSS XML robustly using fast-xml-parser
    const parser = new XMLParser();
    const result = parser.parse(xml);
    const items = result?.rss?.channel?.item || [];
    const itemArray = Array.isArray(items) ? items : [items];
    const articles = [];

    for (const item of itemArray) {
      if (!item) continue;
      if (articles.length >= 6) break; // only top 6
      
      const title = item.title || '';
      const link = item.link || '';
      let summary = item.description || '';
      
      // Strip HTML from summary
      if (typeof summary === 'string') {
        summary = summary.replace(/<[^>]*>?/gm, '');
        if (summary.length > 200) {
          summary = summary.substring(0, 200) + '...';
        }
      }

      if (title && link) {
        articles.push({
          id: link,
          title,
          summary,
          category: 'National News',
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
