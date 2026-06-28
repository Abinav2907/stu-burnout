require('dotenv').config({ path: '../backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function test() {
  // Test chat_history
  const chatTest = await supabase.from('chat_history').insert({
    user_id: 'test_user_id_123',
    role: 'user',
    content: 'hello'
  });
  console.log('chat_history response:', chatTest.error ? chatTest.error.message : 'Success');

  // Test burnout_predictions
  const burnoutTest = await supabase.from('burnout_predictions').insert({
    user_id: 'test_user_id_123',
    risk_level: 'LOW',
    risk_score: 10
  });
  console.log('burnout_predictions response:', burnoutTest.error ? burnoutTest.error.message : 'Success');
}

test();
