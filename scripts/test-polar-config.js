// Test script to validate Polar configuration
// Run with: node scripts/test-polar-config.js

require('dotenv').config({ path: '.env.local' });

const { Polar } = require('@polar-sh/sdk');

async function testPolarConfig() {
  console.log('Testing Polar configuration...\n');
  
  // Check environment variables
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const server = process.env.POLAR_SERVER || 'sandbox';
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  
  console.log('Environment Variables:');
  console.log(`- POLAR_ACCESS_TOKEN: ${accessToken ? '✓ Set' : '✗ Missing'}`);
  console.log(`- POLAR_SERVER: ${server}`);
  console.log(`- POLAR_WEBHOOK_SECRET: ${webhookSecret ? '✓ Set' : '✗ Missing'}`);
  
  if (!accessToken) {
    console.log('\n✗ POLAR_ACCESS_TOKEN is required. Please set it in your .env.local file.');
    process.exit(1);
  }
  
  if (!webhookSecret) {
    console.log('\n⚠ POLAR_WEBHOOK_SECRET is recommended for webhooks.');
  }
  
  // Test API connection
  console.log('\nTesting API connection...');
  try {
    const polarClient = new Polar({
      accessToken: accessToken,
      server: server === 'sandbox' ? 'sandbox' : undefined,
    });
    
    // Test with a simple API call - get products
    const products = await polarClient.products.list();
    console.log(`✓ API connection successful! Found ${products.length} products.`);
    
    // Check if our product IDs exist
    const productIds = [
      '37433757-1f3b-490c-afb9-32c12e2f86f4', // Large
      '3deb32fd-578f-4cc3-8594-3850f92f61b8', // Medium
      '5d518c29-8804-4bca-9b13-2a275c245c73', // Small
    ];
    
    console.log('\nChecking product IDs:');
    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (product) {
        console.log(`✓ ${productId} - ${product.name}`);
      } else {
        console.log(`✗ ${productId} - Not found`);
      }
    }
    
    console.log('\n✅ Polar configuration is valid!');
    
  } catch (error) {
    console.log('\n✗ API connection failed:');
    if (error.message.includes('invalid_token')) {
      console.log('  - The access token is invalid, expired, or revoked');
      console.log('  - Please generate a new token at: https://' + (server === 'sandbox' ? 'sandbox.' : '') + 'polar.sh/settings/developers');
    } else {
      console.log('  - Error:', error.message);
      console.log('  - Full error:', JSON.stringify(error, null, 2));
    }
    process.exit(1);
  }
}

testPolarConfig().catch(console.error);
