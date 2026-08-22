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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
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
    
    // Parse RSS XML using basic string splitting/regex
    const items = xml.split('<item>').slice(1); // skip the channel header
    const articles = [];

    for (const item of items) {
      if (articles.length >= 6) break; // only top 6
      
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);
      
      const title = titleMatch ? titleMatch[1].trim() : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
      let summary = descMatch ? descMatch[1].trim() : '';
      
      // Strip HTML from summary
      summary = summary.replace(/<[^>]*>?/gm, '');
      if (summary.length > 200) {
        summary = summary.substring(0, 200) + '...';
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
