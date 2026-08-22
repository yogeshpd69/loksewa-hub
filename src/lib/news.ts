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

  // 2. If not found or stale (and we're asking for today), fetch RSS
  try {
    const rssUrl = 'https://english.onlinekhabar.com/feed';
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    
    if (!response.ok) throw new Error("Failed to fetch news feed");
    
    const json = await response.json();
    
    if (json.status !== 'ok' || !json.items) {
      throw new Error("Invalid RSS format");
    }

    // Group items by date
    const articlesByDate: Record<string, NewsArticle[]> = {};

    json.items.forEach((item: any) => {
      // PubDate is usually like "2023-10-15 14:00:00"
      let itemDateStr = todayStr;
      if (item.pubDate) {
        try {
          itemDateStr = new Date(item.pubDate.replace(' ', 'T')).toISOString().split('T')[0];
        } catch(e) {
          itemDateStr = todayStr;
        }
      }

      const summary = item.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...';
      const article = {
        id: item.link,
        title: item.title,
        summary: summary,
        topic: 'National News',
        source: 'OnlineKhabar',
        url: item.link
      };

      if (!articlesByDate[itemDateStr]) {
        articlesByDate[itemDateStr] = [];
      }
      articlesByDate[itemDateStr].push(article);
    });
    
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
    
    // If we asked for today and got nothing for today (rare, but possible late at night or feed delays)
    // we just return whatever is the latest we got.
    if (dateStr === todayStr && Object.keys(articlesByDate).length > 0) {
      const latestDateStr = Object.keys(articlesByDate).sort().reverse()[0];
      return articlesByDate[latestDateStr];
    }
    
    throw new Error("No articles found for this date.");
  } catch (err) {
    console.error("News fetch failed:", err);
    throw err;
  }
}
