/**
 * Test Script for Hugging Face Gradio API
 * Run this to test the API response format
 */

import { Client } from "@gradio/client";

async function testAPI() {
  try {
    console.log('Connecting to Gradio API...');
    const client = await Client.connect("sathvik1223/Aspect_based_sentiment_analysis");
    
    console.log('Connected! Testing with sample data...\n');
    
    // Test 1: Simple test
    console.log('=== TEST 1: Simple Review ===');
    const result1 = await client.predict("/predict", {
      sentence: "The battery life is terrible but the display is amazing!",
      aspects: "battery life, display"
    });
    console.log('Result 1:', JSON.stringify(result1, null, 2));
    console.log('result.data:', result1.data);
    console.log('Type:', typeof result1.data);
    console.log('\n');
    
    // Test 2: Multiple aspects
    console.log('=== TEST 2: Multiple Aspects ===');
    const result2 = await client.predict("/predict", {
      sentence: "Performance is great for gaming, keyboard feels premium, but speakers are mediocre",
      aspects: "performance, keyboard, speakers"
    });
    console.log('Result 2:', JSON.stringify(result2, null, 2));
    console.log('result.data:', result2.data);
    console.log('\n');
    
    // Test 3: Real product review
    console.log('=== TEST 3: Real Product Review ===');
    const result3 = await client.predict("/predict", {
      sentence: "The performance of this laptop is absolutely amazing for gaming and rendering tasks. The display quality is stunning with vibrant colors and smooth refresh rates.",
      aspects: "performance, display, battery life"
    });
    console.log('Result 3:', JSON.stringify(result3, null, 2));
    console.log('result.data:', result3.data);
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
