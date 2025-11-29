const logic = {
  id: 'logic',
  title: 'Logical Reasoning',
  description: 'Sequences, analogies, arrangements and reasoning puzzles with practice MCQs.',
  formulas: [
    {
      title: 'Common Patterns & Tips',
      items: [
        'For sequences, check differences, ratios, and second differences',
        'For series, try partial sums or look for multiplicative patterns',
        'For arrangements/permutations: n! for n distinct objects',
      ],
    },
  ],
  importantQuestions: [
    {
      q: 'Find the next term: 1, 2, 4, 8, ? ',
      a: 'Each term doubles; next = 16',
    },
    {
      q: 'If all A are B and some B are C, can we conclude all A are C?',
      a: 'No. Only that some B are C doesn\'t imply all A are C.',
    },
    {
      q: 'A says: "I always lie." Is this possible?',
      a: 'No — it is a liar paradox. If he always lies the statement creates contradiction.',
    },
    {
      q: 'Arrange 5 people in a row. How many ways?',
      a: '5! = 120 ways',
    },
  ],
  mcqs: [
    { q: 'Find the next term: 3, 6, 12, 24, ?', choices: ['36','48','30','72'], answer: 1 },
    { q: 'Which of these is an analogy? Dog: Puppy :: Cat: ?', choices: ['Kitten','Cub','Calf','Foal'], answer: 0 },
    { q: 'Arrange A,B,C in a line; how many permutations for 3 people?', choices: ['3','6','9','12'], answer: 1 },
    { q: 'If all X are Y and all Y are Z, then?', choices: ['Some X are Z','No X are Z','All X are Z','Cannot say'], answer: 2 },
    { q: 'Series: 2,5,10,17,26 -> next?', choices: ['37','35','39','47'], answer: 1 },
  ],
};

export default logic;
