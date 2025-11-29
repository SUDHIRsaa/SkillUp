const math = {
  id: 'math',
  title: 'Mathematics',
  description: 'Arithmetic, algebra, geometry and mensuration — core formulas and practice MCQs.',
  formulas: [
    {
      title: 'Arithmetic & Number Theory',
      latex: null,
      items: [
        { text: 'LCM(a,b) = |a*b| / GCD(a,b)', latex: '\\mathrm{LCM}(a,b)=\\frac{|ab|}{\\gcd(a,b)}' },
        { text: 'Sum of first n natural numbers = n(n+1)/2', latex: '\\sum_{k=1}^n k = \\frac{n(n+1)}{2}' },
        { text: 'Sum of first n odd numbers = n^2', latex: '\\sum_{k=1}^n (2k-1)=n^2' },
        { text: 'Sum of first n even numbers = n(n+1)', latex: '\\sum_{k=1}^n 2k = n(n+1)' },
      ],
    },
    {
      title: 'Algebra',
      latex: null,
      items: [
        { text: 'Quadratic formula: x = (-b ± sqrt(b^2 - 4ac)) / (2a)', latex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}' },
        { text: 'Factorization: a^2 - b^2 = (a-b)(a+b)', latex: 'a^2-b^2=(a-b)(a+b)' },
        { text: 'Arithmetic-Geometric mean relations and basic identities', latex: null },
      ],
    },
    {
      title: 'Geometry',
      items: [
        "Area of circle = πr^2, Circumference = 2πr",
        'Area of triangle = 1/2 * base * height',
        "Pythagoras: a^2 + b^2 = c^2 (right triangle)",
        'Area of trapezoid = (a+b)/2 * h',
      ],
    },
    {
      title: 'Mensuration',
      items: [
        'Volume of cube = a^3',
        'Volume of cuboid = lwh',
        'Volume of sphere = (4/3)πr^3',
        'Volume of cylinder = πr^2h',
      ],
    },
  ],
  importantQuestions: [
    {
      q: 'If the LCM of 12 and 18 is 36, what is their GCD?',
      a: 'GCD = (12*18)/LCM = 216/36 = 6',
    },
    {
      q: 'Find x: 2x^2 - 5x + 2 = 0',
      a: 'Using quadratic formula, x = (5 ± sqrt(25 - 16)) / 4 = (5 ± 3)/4 => x = 2 or x = 0.5',
    },
    {
      q: 'Area of circle with radius 7 cm',
      a: 'Area = π * 7^2 = 49π (≈ 153.94)'
    },
    {
      q: 'A right triangle has legs 3 and 4; find hypotenuse',
      a: 'Hypotenuse = 5 (3-4-5 triangle)'
    }
  ],
  mcqs: [
    {
      q: 'What is the sum of first 10 natural numbers?',
      choices: ['45', '50', '55', '60'],
      answer: 2,
    },
    {
      q: 'If x^2 - 5x + 6 = 0, what are the roots?',
      choices: ['2 and 3', '1 and 6', ' -2 and -3', '3 and 5'],
      answer: 0,
    },
    {
      q: 'Area of triangle with base 10 and height 6 is?',
      choices: ['30', '60', '16', '24'],
      answer: 0,
    },
    {
      q: 'LCM of 8 and 12 is?',
      choices: ['24', '12', '96', '8'],
      answer: 0,
    },
    {
      q: 'If a circle radius doubles, area becomes?',
      choices: ['2x', '4x', '8x', '16x'],
      answer: 1,
    },
  ],
};

export default math;
