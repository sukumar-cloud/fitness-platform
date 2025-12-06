// Quick script to verify environment variables are loaded
console.log('🔍 Checking Environment Variables...\n');

const required = ['GOOGLE_API_KEY'];
const optional = ['ELEVENLABS_API_KEY', 'REPLICATE_API_TOKEN', 'STABILITY_API_KEY', 'UNSPLASH_ACCESS_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('✅ Required Variables:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✓ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
  } else {
    console.log(`  ✗ ${key}: NOT SET`);
  }
});

console.log('\n📋 Optional Variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✓ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
  } else {
    console.log(`  - ${key}: Not set (will use fallback)`);
  }
});

console.log('\n✨ Environment check complete!');

