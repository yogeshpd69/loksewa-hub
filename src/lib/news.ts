import { supabase } from './supabase';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  topic: string;
  source: string;
  url?: string;
}

export async function fetchDailyNews(targetDate: Date = new Date()): Promise<NewsArticle[]> {
  const dateStr = targetDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check database cache
  const { data } = await supabase
    .from('daily_news')
    .select('articles, created_at')
    .eq('news_date', dateStr)
    .single();

  if (data && data.articles) {
    // Optional 2-hour refresh check (only refresh if asking for today's news)
    if (data.created_at && dateStr === todayStr) {
      const cacheTime = new Date(data.created_at).getTime();
      const now = Date.now();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
      if (hoursDiff < 2) {
        return data.articles as NewsArticle[];
      }
      // If older than 2 hours, we'll re-fetch below
    } else {
      // For past dates, if we have it, we return it
      return data.articles as NewsArticle[];
    }
  }

  // 2. If not found or stale (and we're asking for today), fetch from Kchakhabar API directly
  try {
    const response = await fetch('https://kchakhabar.com/api/v1/today.json?limit=50');
    
    if (!response.ok) throw new Error("Failed to fetch Kchakhabar API");
    
    const apiData = await response.json();
    const items = apiData.stories || [];

    const articlesByDate: Record<string, NewsArticle[]> = {};

    for (const item of items) {
      // Find actual publication date
      let itemDateStr = todayStr;
      if (item.first_reported) {
        itemDateStr = item.first_reported.split('T')[0];
      }

      const title = item.topic_en || item.topic_ne || '';
      const summary = item.summary_en || item.summary_ne || '';
      const link = (item.sources && item.sources.length > 0) ? item.sources[0].url : '';
      const publisher = (item.sources && item.sources.length > 0) ? item.sources[0].publisher : 'Kcha Khabar API';

      if (title && link) {
        if (!articlesByDate[itemDateStr]) {
          articlesByDate[itemDateStr] = [];
        }
        articlesByDate[itemDateStr].push({
          id: item.id || link,
          title,
          summary,
          topic: publisher,
          source: publisher,
          url: link
        });
      }
    }
    
    if (Object.keys(articlesByDate).length > 0) {
      // Upsert all fetched dates into DB (fire and forget)
      Object.entries(articlesByDate).forEach(([dStr, arts]) => {
        if (arts.length > 0) {
          supabase.from('daily_news').upsert({
            news_date: dStr,
            articles: arts
          }, { onConflict: 'news_date' }).then(({ error }) => {
            if (error) console.error("Failed to cache daily news:", error);
          });
        }
      });

      if (articlesByDate[dateStr]) {
        return articlesByDate[dateStr];
      }
      
      // If we asked for today and got nothing for today, we just return whatever is the latest we got.
      if (dateStr === todayStr) {
        const latestDateStr = Object.keys(articlesByDate).sort().reverse()[0];
        return articlesByDate[latestDateStr];
      }
    }
    
    throw new Error("No articles found for this date.");
  } catch (err) {
    console.error("News fetch failed:", err);
    throw err;
  }
}
