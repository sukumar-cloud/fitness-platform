// Quick test script to verify Google API key works
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env file manually
let API_KEY = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const match = envContent.match(/GOOGLE_API_KEY=(.+)/);
  if (match) {
    API_KEY = match[1].trim();
  }
} catch (e) {
  console.error('Could not read .env file');
}

console.log('\n🔍 Testing Google Gemini API Key...\n');

if (!API_KEY) {
  console.error('❌ GOOGLE_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('✅ API Key found:', API_KEY.substring(0, 10) + '...');
console.log('📝 Testing available models...\n');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'models/gemini-pro',
    'models/gemini-1.0-pro',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Trying: ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
        },
      });

      const result = await model.generateContent('Say "API test successful"');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! Model "${modelName}" works!`);
      console.log('📥 Response:', text.substring(0, 100) + '...\n');
      console.log(`\n💡 Use this model in your app: ${modelName}\n`);
      return;
    } catch (error) {
      console.log(`   ❌ ${modelName}: ${error.message.split('\n')[0]}`);
      continue;
    }
  }
  
  console.error('\n❌ None of the models worked with this API key.');
  console.error('\n💡 Possible solutions:');
  console.error('   1. Check if API key is valid: https://makersuite.google.com/app/apikey');
  console.error('   2. Make sure API key has access to Gemini API');
  console.error('   3. Try generating a new API key');
  console.error('   4. Check if there are quota limits\n');
  process.exit(1);
}

testAPI();

