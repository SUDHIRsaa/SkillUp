require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CodingChallenge = require('../models/CodingChallenge');

async function run() {
  await connectDB();

  const samples = [
    {
      statement: 'Print Hello World',
      constraints: 'Print exactly: Hello\n',
      difficulty: 'easy',
      tags: ['intro'],
      testCases: [
        { input: '', output: 'Hello\n' }
      ],
    },
    {
      statement: 'Sum Two Integers',
      constraints: 'Read two integers from stdin, print their sum followed by a newline.',
      difficulty: 'easy',
      tags: ['math','io'],
      testCases: [
        { input: '2 3', output: '5\n' },
        { input: '10 -3', output: '7\n' }
      ],
    },
  ];

  await CodingChallenge.deleteMany({});
  const created = await CodingChallenge.insertMany(samples);
  console.log(`Seeded ${created.length} coding challenges.`);
  await mongoose.connection.close();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
