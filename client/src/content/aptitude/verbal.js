const verbal = {
  id: 'verbal',
  title: 'Verbal Ability',
  description: 'Vocabulary, grammar and reading — key rules and practice MCQs.',
  formulas: [
    {
      title: 'Grammar Rules (Quick Reference)',
      items: [
        'Subject-Verb Agreement: Singular subject takes singular verb',
        'Tenses: Simple, continuous, perfect forms and their uses',
        'Common confused words: affect/effect, their/there/they\'re',
      ],
    },
  ],
  importantQuestions: [
    {
      q: 'Choose the correct synonym for "abundant"',
      a: 'Plentiful',
    },
    {
      q: 'Correct the sentence: "She don\'t like apples."',
      a: 'She doesn\'t like apples.'
    },
    {
      q: 'Fill in the blank: "If I ___ you, I would apologize." (were/was)',
      a: 'were (subjunctive mood)'
    },
  ],
  mcqs: [
    { q: 'Choose synonym of "abundant"', choices: ['plentiful','scarce','rare','little'], answer: 0 },
    { q: 'Correct sentence: "He don\'t like it."', choices: ['He doesn\'t like it.','He don\'t like it.','He not like it.','He doesn like it.'], answer: 0 },
    { q: 'Fill: If I ___ you, I would go (were/was)', choices: ['were','was','am','be'], answer: 0 },
    { q: 'Choose antonym of "optimistic"', choices: ['pessimistic','hopeful','positive','cheerful'], answer: 0 },
    { q: 'Identify the noun in: "The quick brown fox"', choices: ['quick','brown','fox','the'], answer: 2 },
  ],
};

export default verbal;
