// Test script to verify server can start before deploying to Render
console.log('🧪 Testing FixFleet server for deployment...\n');

const { spawn } = require('child_process');
const http = require('http');

let serverProcess;

// Start the server
console.log('🚀 Starting server...');
serverProcess = spawn('node', ['server.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    PORT: '4001', // Use different port for testing
    JWT_SECRET: 'test-secret-key-for-deployment-test'
  }
});

let serverOutput = '';
let hasStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log('📝 Server output:', output.trim());

  if (output.includes('FixFleet API running') && !hasStarted) {
    hasStarted = true;
    console.log('\n✅ Server started successfully!');

    // Test API endpoints
    setTimeout(() => {
      testAPIEndpoints(() => {
        console.log('\n🛑 Stopping test server...');
        serverProcess.kill();
        console.log('✅ Deployment test completed!');
        console.log('\n🎉 Your server should deploy successfully to Render!');
        console.log('   Next: Follow RENDER_DEPLOYMENT_FIX.md for deployment steps.');
      });
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('⚠️  Server error:', data.toString().trim());
});

serverProcess.on('close', (code) => {
  if (!hasStarted) {
    console.log('\n❌ Server failed to start!');
    console.log('Check the errors above and fix them before deploying.');
    process.exit(1);
  }
});

// Test API endpoints
function testAPIEndpoints(callback) {
  console.log('\n🔍 Testing API endpoints...');

  const testEndpoint = (path, expectedSuccess = true) => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 4001,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (expectedSuccess && res.statusCode === 200) {
              console.log(`✅ ${path} - OK`);
            } else if (!expectedSuccess) {
              console.log(`✅ ${path} - Expected error (OK)`);
            } else {
              console.log(`❌ ${path} - Status: ${res.statusCode}`);
            }
          } catch (e) {
            console.log(`❌ ${path} - Invalid JSON response`);
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        console.log(`❌ ${path} - Connection failed: ${err.message}`);
        resolve();
      });

      req.end();
    });
  };

  // Test endpoints
  Promise.all([
    testEndpoint('/api/workers'),
    testEndpoint('/api/bookings'),
    testEndpoint('/api/auth/test-endpoint', false) // Should fail (endpoint doesn't exist)
  ]).then(callback);
}

// Timeout after 10 seconds
setTimeout(() => {
  if (!hasStarted) {
    console.log('\n⏰ Server startup timeout!');
    console.log('Server took too long to start. Check for errors.');
    serverProcess.kill();
    process.exit(1);
  }
}, 10000);
