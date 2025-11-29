const timeManagement = {
  id: 'time',
  title: 'Time Management',
  description: 'Speed, distance and exam time allocation techniques with practice MCQs.',
  formulas: [
    {
      title: 'Speed, Distance & Time (quick formulas)',
      items: [
        { text: 'Speed = Distance / Time', latex: 'v=\\frac{d}{t}' },
        { text: 'Time = Distance / Speed', latex: 't=\\frac{d}{v}' },
        { text: 'Distance = Speed * Time', latex: 'd=vt' },
        { text: 'km/hr to m/sec: x km/hr = x * 5/18 m/sec', latex: 'x\\ \text{km/hr} = x\\times\\frac{5}{18}\\ \text{m/s}' },
        { text: 'm/sec to km/hr: x m/sec = x * 18/5 km/hr', latex: 'x\\ \text{m/s} = x\\times\\frac{18}{5}\\ \text{km/hr}' },
        { text: 'If speeds are a:b, times for same distance are 1/a : 1/b (or b : a)', latex: 'a:b\\implies t\\propto\\frac{1}{a}:\\frac{1}{b}' },
        { text: 'Average speed for equal distances x and y = (2xy) / (x + y)', latex: '\\text{Average}\\ speed=\\frac{2xy}{x+y}' },
        { text: 'Relative speed: When two objects move in opposite directions, add their speeds', latex: null },
      ],
    },
  ],
  importantQuestions: [
    {
      q: 'If you have 60 minutes for 30 questions, how much average time should you spend per question?',
      a: '60 / 30 = 2 minutes per question',
    },
    {
      q: 'You can solve easy questions in 1 min and hard in 4 min. If test has 10 easy and 20 hard, estimate total time',
      a: 'Total = 10*1 + 20*4 = 10 + 80 = 90 minutes',
    },
    {
      q: 'If a question takes too long, what is a good strategy?',
      a: 'Skip and come back later after answering easier questions to maximize score',
    },
  ],
  mcqs: [
    { q: 'If 60 minutes for 30 questions, time per question?', choices: ['1','2','3','4'], answer: 1 },
    { q: 'Relative speed when two objects move opposite at 5 and 7 m/s?', choices: ['2','12','35','-2'], answer: 1 },
    { q: 'If easy=1min, hard=4min; 10 easy,20 hard total?', choices: ['60','70','90','80'], answer: 2 },
    { q: 'Best immediate strategy for a long question?', choices: ['Skip and return','Try immediately','Guess randomly','Delete'], answer: 0 },
    { q: 'To reduce time per question, you should?', choices: ['Practice timed sets','Read slowly','Avoid shortcuts','None'], answer: 0 },
  ],
};

export default timeManagement;
