const http = require('http');
const options = { hostname: '127.0.0.1', port: 4000, path: '/api/leaderboard?scope=global', method: 'GET' };
const req = http.request(options, res => { let d=''; res.on('data', c => d += c); res.on('end', ()=>{ console.log('Status', res.statusCode); try { console.log(JSON.parse(d)); } catch(e) { console.log(d); } }); });
req.on('error', e => console.error('ERR', e)); req.end();
