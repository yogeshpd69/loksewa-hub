import { createClient } from '@supabase/supabase-js';
import { allQuestions } from '../src/data/questions';

// Re-using the credentials from our src/lib/supabase.ts
const supabaseUrl = 'https://jznvcvcrtsksaigijorf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bnZjdmNydHNrc2FpZ2lqb3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjM5MTEsImV4cCI6MjEwMjg5OTkxMX0.kVF3g48Q6BPnx3H4Puajz_-sxnQp4HgM6ttVIGvHY4Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
  console.log(`Preparing to migrate ${allQuestions.length} questions...`);

  // To avoid timeouts or hitting limits with a huge single insert, we'll chunk it
  const chunkSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const chunk = allQuestions.slice(i, i + chunkSize);
    
    // Transform to match DB schema
    const dbRows = chunk.map(q => ({
      // DB handles generating a UUID for id, so we skip 'id' or we could map local id if it's a UUID format.
      // But currently local ids are things like 'geo1', so let's let DB gen random UUIDs.
      paper: (q.category === 'GK' || q.category === 'IQ') ? 'paper1' : 'paper2',
      category: q.category,
      subcategory: q.subcategory,
      organization: q.organization,
      question_text: q.questionText,
      options: q.options,
      correct_answer_index: q.correctAnswerIndex,
      explanation: q.explanation,
      difficulty: 'medium',
      source: 'Initial Data Seed',
      times_served: 0,
      times_correct: 0,
    }));

    const { error } = await supabase.from('questions').insert(dbRows);

    if (error) {
      console.error(`Error migrating chunk ${i / chunkSize + 1}:`, error.message, error.details);
      errorCount += chunk.length;
    } else {
      console.log(`Successfully migrated chunk ${i / chunkSize + 1} (${chunk.length} questions)`);
      successCount += chunk.length;
    }
  }

  console.log('\nMigration Complete!');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

migrate();
