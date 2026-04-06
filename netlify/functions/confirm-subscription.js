const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const email = event.queryStringParameters?.email?.toLowerCase().trim();
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing email parameter' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_status, plan')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('confirm-subscription error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }

  // Active if: direct SoloMarket subscription OR Ketorah AI Hub (founder plan)
  const isActive =
    profile?.subscription_status === 'active' ||
    profile?.plan === 'founder';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      active: !!isActive,
      isPro: !!isActive,
      plan: profile?.plan || null,
    }),
  };
};
