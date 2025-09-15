const axios = require('axios');

const LOCAL_BASE = 'http://localhost:3001';
const PROD_BASE = 'https://auto-trade-yellow-network.netlify.app';

const routes = [
  '/health',
  '/api/vendors',
  '/api/buyers',
  '/api/requests',
  '/api/quotes',
  '/api/orders'
];

async function testRoutes(baseUrl, env) {
  console.log(`\n🧪 Testing ${env} routes at ${baseUrl}`);

  for (const route of routes) {
    try {
      const response = await axios.get(`${baseUrl}${route}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
      });

      const status = response.status;
      const emoji = status < 400 ? '✅' : '⚠️ ';
      console.log(`${emoji} ${route} - ${status}`);

    } catch (error) {
      console.log(`❌ ${route} - ${error.message}`);
    }
  }
}

async function main() {
  console.log('Route Consistency Test');
  console.log('=====================');

  // Test local development
  await testRoutes(LOCAL_BASE, 'Development');

  // Test production
  await testRoutes(PROD_BASE, 'Production');

  console.log('\n✨ Test complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRoutes };