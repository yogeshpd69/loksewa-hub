import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

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

    const baseUrl = 'https://gorkhapatraonline.com';
    const listRes = await fetch(`${baseUrl}/categories/loksewa`);
    
    if (!listRes.ok) throw new Error('Failed to fetch Gorkhapatra list');
    
    const listHtml = await listRes.text();
    const $ = cheerio.load(listHtml);
    
    const newArticles: any[] = [];
    
    // Find all links to news articles inside the Loksewa category
    const articleLinks: string[] = [];
    $('a[href^="https://gorkhapatraonline.com/news/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) articleLinks.push(href);
    });

    // We only need to check the first few to see if they're new
    // as it's sorted by latest.
    const recentLinks = [...new Set(articleLinks)].slice(0, 5);

    for (const url of recentLinks) {
      // Check if this article already exists in our DB
      const { data: existing } = await supabase
        .from('loksewa_bishesh')
        .select('id')
        .eq('source_url', url)
        .single();
        
      if (existing) continue; // Already processed this one

      // Fetch the full article page
      const articleRes = await fetch(url);
      if (!articleRes.ok) continue;
      
      const articleHtml = await articleRes.text();
      const $a = cheerio.load(articleHtml);
      
      const title = $a('h1').first().text().trim() || $a('title').text().replace('- Gorkhapatra', '').trim();
      
      // Usually article content is inside an element with class "item-content" or similar.
      // Easiest is to grab paragraphs from main article block.
      // In gorkhapatra, content is typically in a div with some specific class, but we can target paragraphs inside the main container.
      // Extract content robustly by targeting common classes, then falling back to all substantive <p> tags
      let content = $a('.item-content p').map((i, el) => $a(el).text().trim()).get().join('\n\n');
      
      if (!content || content.length < 100) {
          content = $a('.blog-details-content p, .post-content p, article p').map((i, el) => $a(el).text().trim()).get().join('\n\n');
      }
      
      if (!content || content.length < 100) {
          // Ultimate fallback: grab all <p> tags that have significant text (ignoring nav/footer fluff)
          content = $a('p').filter((i, el) => {
              const text = $a(el).text().trim();
              return text.length > 50; 
          }).map((i, el) => $a(el).text().trim()).get().join('\n\n');
      }
      
      // Determine type based on title
      let type = 'subjective';
      if (title.includes('वस्तुगत')) {
        type = 'objective';
      }

      if (title && content && content.length > 100) {
        newArticles.push({
          title,
          content,
          article_type: type,
          source_url: url,
          published_date: new Date().toISOString().split('T')[0]
        });
      }
    }

    // Insert new articles
    if (newArticles.length > 0) {
      await supabase.from('loksewa_bishesh').insert(newArticles);
    }

    return new Response(
      JSON.stringify({ message: `Fetched ${newArticles.length} new articles.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
