import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { articleId, articleType, content } = await req.json();

    if (!articleId || !articleType || !content) {
      throw new Error('Missing required arguments: articleId, articleType, content');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication required for AI features. Please sign in.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, 
      });
    }

    // Check if we already have this cached
    const { data: existingData } = await supabase
      .from('ai_generated_content')
      .select('content_payload')
      .eq('user_id', user.id)
      .eq('loksewa_id', articleId)
      .eq('content_type', articleType === 'objective' ? 'mcq' : 'summary')
      .single();

    if (existingData) {
      return new Response(JSON.stringify({ data: existingData.content_payload, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Construct Groq prompt based on article type
    let systemPrompt = '';
    
    if (articleType === 'objective') {
      systemPrompt = `You are a Loksewa exam prep assistant. The user will provide a raw text of questions/answers. 
Your exact task is to extract or invent 4-option MCQs derived from the text.
Output MUST be raw valid JSON array ONLY, no markdown formatting.
Schema: [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": integers 0-3, "explanation": "..." } ]`;
    } else {
      systemPrompt = `You are a Loksewa exam prep assistant. The user will provide an essay or reading material.
Your task is to generate a highly focused, 5-10 line summary of the key facts suitable for exams. 
Output MUST be raw valid JSON object ONLY, no markdown formatting.
Schema: { "summary": "Full summary text here..." }`;
    }

    const maxChars = 3000;
    const truncatedContent = content.length > maxChars ? content.substring(0, maxChars) + '...' : content;

    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) {
      throw new Error('Server misconfiguration: Groq API key is missing.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: truncatedContent }
        ],
        temperature: 0.2,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq Error:', errText);
      return new Response(JSON.stringify({ error: 'AI limit reached or service unavailable.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const groqData = await response.json();
    let aiText = groqData.choices[0].message.content.trim();
    
    // Clean potential markdown wrap
    if (aiText.startsWith('\`\`\`json')) aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (aiText.startsWith('\`\`\`')) aiText = aiText.replace(/\`\`\`/g, '').trim();
    
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(aiText);
    } catch (e) {
      console.error("Failed to parse JSON:", aiText);
      return new Response(JSON.stringify({ error: 'AI returned malformed data. Please try again.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Persist bypassing RLS via Service Role if possible, or user RLS if policy allows insert
    // Need Service role to guarantee insert if user policy on insert is restrictive, but user policy doesn't exist yet, so we assume anon user insert is fine or we should use service role.
    // Wait, the migration earlier set insert to nobody because we only made a SELECT policy for user!
    // Let's use service_role to insert it!
    const _supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (_supabaseServiceRoleKey) {
       const supabaseAdmin = createClient(supabaseUrl, _supabaseServiceRoleKey);
       await supabaseAdmin.from('ai_generated_content').insert({
          user_id: user.id,
          loksewa_id: articleId,
          content_type: articleType === 'objective' ? 'mcq' : 'summary',
          content_payload: parsedPayload,
       });
    }

    return new Response(JSON.stringify({ data: parsedPayload, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
