// Simple test to validate Polar access token
// Run with: node scripts/test-polar-token.js

require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testPolarToken() {
  console.log('Testing Polar access token...\n');
  
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const server = process.env.POLAR_SERVER || 'sandbox';
  
  console.log(`- POLAR_ACCESS_TOKEN: ${accessToken ? '✓ Set' : '✗ Missing'}`);
  console.log(`- POLAR_SERVER: ${server}`);
  
  if (!accessToken) {
    console.log('\n✗ POLAR_ACCESS_TOKEN is required.');
    process.exit(1);
  }
  
  // Test with a simple HTTP request to Polar API
  const baseUrl = 'api.polar.sh';
  
  try {
    console.log(`\nTesting API connection to ${baseUrl}...`);
    
    const options = {
      hostname: baseUrl,
      port: 443,
      path: '/api/v1/products',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    if (response.statusCode === 200) {
      console.log('Raw response:', response.body.substring(0, 200));
      try {
        const products = JSON.parse(response.body);
        console.log(`✓ API connection successful! Found ${products.length} products.`);
      } catch (e) {
        console.log('✗ Failed to parse JSON response');
        process.exit(1);
      }
      
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
      
      console.log('\n✅ Polar access token is valid!');
      
    } else if (response.statusCode === 401) {
      const error = JSON.parse(response.body);
      console.log('\n✗ Authentication failed:');
      console.log(`  - Status: ${response.statusCode}`);
      console.log(`  - Error: ${error.error_description || error.error}`);
      console.log(`  - Please generate a new token at: https://${server === 'sandbox' ? 'sandbox.' : ''}polar.sh/settings/developers`);
      process.exit(1);
    } else {
      console.log(`\n✗ API request failed with status ${response.statusCode}`);
      console.log(`  - Response: ${response.body}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.log('\n✗ Connection failed:');
    console.log(`  - Error: ${error.message}`);
    process.exit(1);
  }
}

testPolarToken().catch(console.error);
