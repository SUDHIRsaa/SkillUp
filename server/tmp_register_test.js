const http = require('http');
const rand = Math.random().toString(36).slice(2,9);
const payload = {
  name: 'Auto Test',
  username: `auto_${rand}`,
  email: `auto_${rand}@example.com`,
  password: 'TestPass123',
  profile: { college: 'Thakur College of Engineering and Technology', year: '2', major: 'CS' }
};
const data = JSON.stringify(payload);
const options = {
  hostname: '127.0.0.1',
  port: 4000,
  path: '/api/auth/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};
const req = http.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status', res.statusCode);
    try { console.log(JSON.parse(d)); } catch (e) { console.log(d); }
  });
});
req.on('error', e => console.error('ERR', e));
req.write(data);
req.end();
