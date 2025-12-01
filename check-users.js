// Simple script to check current users and workers in FixFleet
console.log('🔍 Checking FixFleet Database...\n');

// Simulate the users array from server.js (starts empty)
let users = [];

// Demo workers (service providers)
let demoWorkers = [
  { id: 1, name: 'Ravi Sharma', skill: 'electrician' },
  { id: 2, name: 'Anita Verma', skill: 'plumber' },
  { id: 3, name: 'Imran Khan', skill: 'carpenter' }
];

console.log('📊 FixFleet Database Status:');
console.log('=============================');

console.log('\n👥 USER ACCOUNTS (customers who signed up):');
if (users.length === 0) {
    console.log('📝 No user accounts found.');
    console.log('💡 Users are created when customers sign up through the website.');
} else {
    console.log('Found', users.length, 'users:');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Unknown'} - ${user.email || user.phone || 'No contact'}`);
    });
}

console.log('\n🔧 SERVICE WORKERS (demo data):');
console.log('Found', demoWorkers.length, 'demo service workers:');
demoWorkers.forEach((worker, index) => {
    console.log(`${index + 1}. ${worker.name} - ${worker.skill}`);
});

console.log('\n🚀 To create user accounts:');
console.log('1. Run: npm start');
console.log('2. Visit: http://localhost:3000');
console.log('3. Click "Sign Up" and try:');
console.log('   - Email signup');
console.log('   - Mobile OTP signup');
console.log('   - Google OAuth (if configured)');
console.log('   - Facebook OAuth (if configured)');
console.log('\n📝 Note: This is an in-memory database that resets when server restarts.');
