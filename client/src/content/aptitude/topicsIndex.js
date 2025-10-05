// Enriched topics index: each subtopic includes sample notes, formulas and at least 5 MCQs where appropriate
const topics = [
  {
    id: 'quantitative',
    title: 'Quantitative Aptitude',
    description: 'Numbers, Algebra, Arithmetic, Geometry, Probability and more.',
    subtopics: [
      {
        id: 'numbers',
        title: 'Numbers',
        notes: 'Number system (natural, whole, integers, rational, irrational). Divisibility rules, LCM, HCF, factors, multiples, remainders, modular arithmetic.',
        formulas: [
          { title: 'GCD and LCM relation', items: ['gcd(a,b) * lcm(a,b) = a * b'] },
          { title: 'Euclid Division', items: ['a = bq + r (0 ≤ r < b)'] },
          { title: 'Remainder properties', items: ['(a mod m + b mod m) mod m = (a+b) mod m'] },
          { title: 'Divisibility by 3', items: ['Sum of digits divisible by 3 implies number divisible by 3'] },
          { title: 'Prime basics', items: ['A prime has exactly two distinct positive divisors: 1 and itself'] }
        ],
        mcqs: [
          { q: 'LCM of 12 and 18 is?', choices: ['36','72','6','54'], answer: 0 },
          { q: 'GCD of 48 and 18 is?', choices: ['6','12','3','18'], answer: 0 },
          { q: 'Smallest x>0 such that 15 divides 3x is?', choices: ['5','3','1','15'], answer: 0 },
          { q: 'Remainder when 2^10 divided by 3 is?', choices: ['1','2','0','-1'], answer: 0 },
          { q: 'Which is irrational?', choices: ['π','22/7','3/2','1.5'], answer: 0 }
        ]
      },
      {
        id: 'algebra',
        title: 'Algebra',
        notes: 'Linear and quadratic equations, polynomials, factorization and inequalities. Useful identities and transformation techniques.',
        formulas: [
          { title: 'Quadratic formula', items: [{ latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" }] },
          { title: "Sum & product of roots", items: ['If ax^2+bx+c=0 then sum = -b/a, product = c/a'] },
          { title: 'Factor theorem', items: ['If f(r)=0 then (x-r) is a factor'] },
          { title: 'Completing square', items: ['ax^2+bx+c = a(x + b/(2a))^2 + (c - b^2/(4a))'] },
          { title: 'Inequality scaling', items: ['Multiplying inequality by negative reverses sign'] }
        ],
        mcqs: [
          { q: 'Roots of x^2 -5x + 6 = 0 are?', choices: ['2 and 3','1 and 6','-2 and -3','2 and -3'], answer: 0 },
          { q: 'If (x-2) is factor of polynomial, which x?', choices: ['2','-2','1','0'], answer: 0 },
          { q: 'Discriminant b^2-4ac indicates?', choices: ['Type of roots','Leading coeff','Degree','Sum of roots'], answer: 0 },
          { q: 'If sum of roots=10 and product=21, roots are?', choices: ['3 and 7','1 and 21','-3 and -7','5 and 5'], answer: 0 },
          { q: 'Quadratic x^2-7x+12 roots are?', choices: ['3 and 4','2 and 6','1 and 12','-3 and -4'], answer: 0 }
        ]
      },
      {
        id: 'arithmetic',
        title: 'Arithmetic',
        notes: 'Percentages, ratios, averages, mixtures, profit and loss, interest. Quick manipulations and estimations.',
        aliases: ['Mixtures & Alligations', 'Ratio, Proportion & Averages', 'Percentage, Profit & Loss, Simple & Compound Interest'],
        formulas: [
          { title: 'Simple Interest', items: ['SI = (P * R * T) / 100'] },
          { title: 'Compound Interest', items: ['A = P(1 + r/100)^t'] },
          { title: 'Percentage change', items: ['% change = (new - old)/old × 100'] },
          { title: 'Ratio to fraction', items: ['If a:b = m:n then a/(a+b) = m/(m+n)'] },
          { title: 'Average', items: ['Average = Sum / Count'] }
        ],
        mcqs: [
          { q: 'If P=1000, R=10% p.a., T=1 year, SI is?', choices: ['100','110','10','1000'], answer: 0 },
          { q: 'Profit 20% on cost of 100 => SP is?', choices: ['120','100','80','140'], answer: 0 },
          { q: 'If ratio 2:3 and total 50, first number is?', choices: ['20','30','10','25'], answer: 0 },
          { q: 'Average of 3,5,7 is?', choices: ['5','4','6','7'], answer: 0 },
          { q: '10% increase then 10% decrease => net change?', choices: ['-1%','0%','-2%','+1%'], answer: 2 }
        ]
      },
      {
        id: 'speed-time-distance',
        title: 'Speed, Time & Distance',
        notes: 'Relative speed, boats & streams, trains, races. Unit conversions and effective distances.',
        aliases: ['Time, Speed & Distance, Boats & Streams'],
        formulas: [
          { title: 'Speed = Distance/Time', items: ['v = d / t'] },
          { title: 'Relative speed (same dir)', items: ['v_rel = v1 - v2'] },
          { title: 'Convert km/h to m/s', items: ['multiply by 5/18'] },
          { title: 'Average speed', items: ['Total distance / total time'] },
          { title: 'Effective distance for trains', items: ['train length + platform length'] }
        ],
        mcqs: [
          { q: 'Car covers 150 km in 3 hours, speed is?', choices: ['50 km/h','45 km/h','60 km/h','40 km/h'], answer: 0 },
          { q: 'Convert 90 km/h to m/s?', choices: ['25 m/s','15 m/s','20 m/s','30 m/s'], answer: 0 },
          { q: 'Relative speed of 60 and 40 opposite?', choices: ['100','20','200','80'], answer: 0 },
          { q: 'If v=d/t and d doubles, v?', choices: ['Doubles','Halves','Same','Quadruples'], answer: 0 },
          { q: 'Train crossing platform uses effective distance; true/false?', choices: ['True','False','Sometimes','Cannot tell'], answer: 0 }
        ]
      },
      {
        id: 'work-time',
        title: 'Work & Time',
        notes: 'Work efficiency, pipes & cisterns, combined work. Use rates and conversions for combined tasks.',
        aliases: ['Time & Work, Pipes & Cisterns'],
        formulas: [
          { title: 'Work rate', items: ['Rate = Work / Time'] },
          { title: 'Combined rate', items: ['1/T = 1/T1 + 1/T2 + ...'] },
          { title: 'Inverse relation', items: ['If efficiency doubles, time halves'] },
          { title: 'Effective workers', items: ['Total work = sum of individual rates'] },
          { title: 'Time from rate', items: ['Time = Work / Rate'] }
        ],
        mcqs: [
          { q: 'A=10h, B=20h, together?', choices: ['6.66h','15h','13.33h','10h'], answer: 2 },
          { q: 'If 3 workers do job in 5 days, 6 workers take?', choices: ['2.5 days','10 days','5 days','1 day'], answer: 0 },
          { q: 'Pipe fills 4h, leak empties 12h, net time?', choices: ['6h','3h','-8h','5h'], answer: 0 },
          { q: 'Combined efficiency equals?', choices: ['Sum of rates','Product','Average','Difference'], answer: 0 },
          { q: 'If efficiency doubles, time becomes?', choices: ['Half','Double','Same','Quarter'], answer: 0 }
        ]
      },
      {
        id: 'permutations-combinations',
        title: 'Permutations & Combinations',
        notes: 'Factorials, arrangements, circular permutations, distribution problems.',
        aliases: ['Permutations & Combinations, Probability'],
        formulas: [
          { title: 'nPr', items: ['nPr = n! / (n-r)!'] },
          { title: 'nCr', items: ['nCr = n! / (r!(n-r)!)'] },
          { title: 'Circular perm', items: ['(n-1)! for distinct items around a circle'] },
          { title: 'Repetition allowed', items: ['k^n ways when repetition allowed'] },
          { title: 'Combination relation', items: ['nCr = nPr / r!'] }
        ],
        mcqs: [
          { q: 'Permutations of 3 letters from ABC?', choices: ['6','3','9','1'], answer: 0 },
          { q: 'nCr for n=5 r=2 is?', choices: ['10','20','5','15'], answer: 0 },
          { q: 'Circular perm of 4 distinct =?', choices: ['6','24','12','4'], answer: 0 },
          { q: 'If repetition allowed, sequences of length 3 from 4 items?', choices: ['64','12','24','16'], answer: 3 },
          { q: 'nPr relation', choices: ['nPr = n!/(n-r)!','nPr = n!/r!','nPr = r!','nPr = n!'], answer: 0 }
        ]
      },
      {
        id: 'probability-statistics',
        title: 'Probability & Statistics',
        notes: 'Probability basics, conditional probability, mean, median, mode, variance, SD.',
        formulas: [
          { title: 'Mean', items: ['\\bar{x} = (\\sum x_i)/n'] },
          { title: 'Variance', items: ['\\sigma^2 = (\\sum (x_i - \\bar{x})^2)/n'] },
          { title: 'Conditional probability', items: ['P(A|B) = P(A \\cap B)/P(B)'] },
          { title: 'Bayes (basic)', items: ['P(A|B) = P(B|A)P(A)/P(B)'] },
          { title: 'Independent events', items: ['P(A\\cap B) = P(A)P(B)'] }
        ],
        mcqs: [
          { q: 'Probability of head on fair coin?', choices: ['1/2','1/4','1','0'], answer: 0 },
          { q: 'For independent events P(A\\cap B)=?', choices: ['P(A)P(B)','P(A)+P(B)','P(A)-P(B)','1'], answer: 0 },
          { q: 'Conditional P(A|B)=?', choices: ['P(A\\cap B)/P(B)','P(A)P(B)','P(A)+P(B)','P(A)-P(B)'], answer: 0 },
          { q: 'Mean of 1,2,3,4 is?', choices: ['2.5','3','2','4'], answer: 0 },
          { q: 'Variance of 2,2,2 is?', choices: ['0','1','2','3'], answer: 0 }
        ]
      },
      {
        id: 'geometry-mensuration',
        title: 'Geometry & Mensuration',
        notes: 'Triangles, circles, polygons, area, perimeter, volume and surface area for 3D shapes.',
        formulas: [
          { title: 'Area of circle', items: ['A = \u03C0 r^2'] },
          { title: 'Triangle area (Heron)', items: ['s = (a+b+c)/2 ; Area = sqrt(s(s-a)(s-b)(s-c))'] },
          { title: 'Pythagoras', items: ['a^2 + b^2 = c^2'] },
          { title: 'Volume of cylinder', items: ['V = \u03C0 r^2 h'] },
          { title: 'Area of rectangle', items: ['A = l \u00D7 w'] }
        ],
        mcqs: [
          { q: 'Area of circle r=7 (use \u03C0=22/7) is?', choices: ['154','49','308','77'], answer: 0 },
          { q: 'Pythagoras for 3-4-5 gives c?', choices: ['5','6','7','4'], answer: 0 },
          { q: 'Volume of cylinder r=1 h=2 (\u03C0=3.14)?', choices: ['6.28','3.14','12.56','1.57'], answer: 0 },
          { q: 'Area rectangle 5x4?', choices: ['20','9','10','25'], answer: 0 },
          { q: 'Heron formula needs s =?', choices: ['(a+b+c)/2','a+b+c','a+b','(a-b)/2'], answer: 0 }
        ]
      },
      {
        id: 'trigonometry',
        title: 'Trigonometry (Basic)',
        notes: 'Trigonometric ratios, identities, heights & distances.',
        formulas: [
          { title: 'Sin/Cos/Tan', items: ['sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent'] },
          { title: 'Identities', items: ['sin^2 x + cos^2 x = 1', '1 + tan^2 x = sec^2 x'] },
          { title: 'Angle transformations', items: ['sin(90-x)=cos x'] },
          { title: 'Height & distance', items: ['tan = opposite/adjacent'] },
          { title: 'Basic values', items: ['sin30=1/2, sin45=√2/2, sin60=√3/2'] }
        ],
        mcqs: [
          { q: 'sin(30°) = ?', choices: ['1/2','√2/2','√3/2','0'], answer: 0 },
          { q: 'tan = sin/cos ? True?', choices: ['True','False','Sometimes','Cannot tell'], answer: 0 },
          { q: 'cos^2+sin^2 = ?', choices: ['1','0','2','-1'], answer: 0 },
          { q: 'sin45 value?', choices: ['√2/2','1/2','√3/2','0'], answer: 0 },
          { q: 'tan(45°)=?', choices: ['1','0','√3','-1'], answer: 0 }
        ]
      },
      {
        id: 'logarithms-surd',
        title: 'Logarithms & Surds',
        notes: 'Laws of logarithms, simplifications.',
        formulas: [
          { title: 'Log laws', items: ['log(xy)=log x + log y','log(x^a) = a log x'] },
          { title: 'Change of base', items: ['log_b a = log_c a / log_c b'] },
          { title: 'Surd simplification', items: ['√(a^2 b) = a √b'] },
          { title: 'Approximation', items: ['Use binomial approx for small x'] },
          { title: 'Rationalize', items: ['Multiply numerator and denominator by conjugate'] }
        ],
        mcqs: [
          { q: 'log_a(xy) = ?', choices: ['log_a x + log_a y','log_a x - log_a y','log_a(x^y)','y log_a x'], answer: 0 },
          { q: 'Change base formula true?', choices: ['Yes','No','Sometimes','Impossible'], answer: 0 },
          { q: '√(16)=?', choices: ['4','-4','8','2'], answer: 0 },
          { q: 'Simplify √(a^2 b)', choices: ['a√b','ab','√a b','a+b'], answer: 0 },
          { q: 'Rationalize denominator of 1/(√2)', choices: ['√2/2','1','2','-√2'], answer: 0 }
        ]
      },
      {
        id: 'progressions',
        title: 'Progressions',
        notes: 'AP, GP, HP basics and sums.',
        formulas: [
          { title: 'AP nth term', items: ['a_n = a_1 + (n-1)d'] },
          { title: 'GP nth term', items: ['a_n = a_1 r^{n-1}'] },
          { title: 'Sum AP', items: ['S_n = n/2(2a + (n-1)d)'] },
          { title: 'Sum GP (r≠1)', items: ['S_n = a(1-r^n)/(1-r)'] },
          { title: 'Harmonic relation', items: ['HP is reciprocal of AP'] }
        ],
        mcqs: [
          { q: 'Sum of first 3 natural numbers is?', choices: ['6','3','9','1'], answer: 0 },
          { q: 'AP with a=2 d=3 3rd term?', choices: ['8','5','11','2'], answer: 0 },
          { q: 'GP with a=2 r=3 2nd term?', choices: ['6','2','3','9'], answer: 0 },
          { q: 'Sum GP a=1 r=2 first 3 terms?', choices: ['7','6','5','8'], answer: 0 },
          { q: 'HP relation to AP?', choices: ['Reciprocal','Same','Double','Half'], answer: 0 }
        ]
      }
    ]
  },
  {
    id: 'logical',
    title: 'Logical Reasoning',
    description: 'Series, puzzles, coding-decoding, syllogisms, data sufficiency and non-verbal reasoning.',
    subtopics: [
      { id: 'series', title: 'Series', notes: 'Number, alphabet, mixed series problems.',
        formulas: [
          { title: 'Difference patterns', items: ['Check first/second differences for linear sequences'] },
          { title: 'Ratio patterns', items: ['Geometric sequences use constant ratios'] },
          { title: 'Alternating patterns', items: ['Look for two interleaved sequences'] },
          { title: 'Polynomial sequences', items: ['Differences may indicate quadratic/cubic terms'] },
          { title: 'Index mapping', items: ['Map positions to formula when needed'] }
        ],
        mcqs: [{ q: 'Find next: 2,4,8,16,?', choices: ['32','24','20','18'], answer: 0 }, { q: 'Series 3,6,12,24 next?', choices: ['48','36','30','60'], answer: 0 }, { q: 'Arithmetic series difference?', choices: ['Constant','Multiply','Divide','Varying'], answer: 0 }, { q: 'Geometric series ratio?', choices: ['Constant','Varying','Zero','One'], answer: 0 }, { q: 'Mixed series uses?', choices: ['Both rules','Only arithmetic','Only geometric','None'], answer: 0 }] },
      { id: 'puzzles', title: 'Puzzles', notes: 'Seating arrangements, floor puzzles, blood relations.',
        aliases: ['Puzzles & Seating Arrangements', 'Blood Relations'],
        formulas: [
          { title: 'Seating tips', items: ['Place fixed positions first (e.g., known neighbours)'] },
          { title: 'Relations mapping', items: ['Translate relation words into relative positions'] },
          { title: 'Use elimination', items: ['Eliminate impossible placements to narrow choices'] },
          { title: 'Draw diagrams', items: ['Visual diagrams often simplify complex puzzles'] },
          { title: 'Check extremes', items: ['Test boundary cases to validate options'] }
        ],
        mcqs: [{ q: 'If A is father of B, B is sister of C, who is C to A?', choices: ['Daughter','Son','Mother','Uncle'], answer: 0 }, { q: 'Seating: opposite pairs count?', choices: ['Depends on circle','2','n/2','n-1'], answer: 2 }, { q: 'If A older than B and B older than C, who oldest?', choices: ['A','B','C','Cannot tell'], answer: 0 }, { q: 'Blood relation: nephew is child of?', choices: ['Sibling','Parent','Grandparent','Uncle'], answer: 0 }, { q: 'Puzzles often use diagrams: True?', choices: ['True','False','Sometimes','Never'], answer: 0 }] },
      { id: 'coding', title: 'Coding-Decoding', notes: 'Letter/number/symbol coding problems.',
        formulas: [
          { title: 'Mapping rules', items: ['Identify constant shifts or substitutions'] },
          { title: 'Reverse patterns', items: ['Check if order reversal is applied'] },
          { title: 'Position encoding', items: ['Letters may map to position values'] },
          { title: 'Mixed rules', items: ['Combination of shifts and reversals occurs often'] },
          { title: 'Test sample', items: ['Derive with small examples to confirm rule'] }
        ],
        mcqs: [{ q: 'If ABC->123, then ABC sum?', choices: ['6','5','7','4'], answer: 0 }, { q: 'Reverse code flips order: True?', choices: ['True','False','Sometimes','Never'], answer: 0 }, { q: 'Shift by 2: A->C: what is Z?', choices: ['B','Y','X','A'], answer: 1 }, { q: 'If A=1 B=2 etc, sum of ABC?', choices: ['6','3','4','5'], answer: 0 }, { q: 'Encoding uses patterns: True?', choices: ['True','False','Sometimes','Never'], answer: 0 }] },
      { id: 'direction', title: 'Direction Sense', notes: 'Distance and directions.',
        formulas: [
          { title: 'Vector addition', items: ['Use components for North/South and East/West'] },
          { title: 'Turns', items: ['Right = clockwise, Left = anticlockwise'] },
          { title: 'Distance vs displacement', items: ['Net displacement may be shorter than path length'] },
          { title: 'Compass points', items: ['Remember 8/16 point compass for intermediate directions'] },
          { title: 'Use coordinates', items: ['Map steps to x/y coordinates for clarity'] }
        ],
        mcqs: [{ q: 'If A walks north then east, final direction?', choices: ['NE','NW','SE','SW'], answer: 0 }, { q: 'Right turn is 90 degree clockwise?', choices: ['True','False','Sometimes','Depends'], answer: 0 }, { q: 'Opposite of north?', choices: ['South','East','West','Up'], answer: 0 }, { q: 'If distance 5 north then 5 east net?', choices: ['√50','10','5','25'], answer: 0 }, { q: 'Compass points count?', choices: ['4','8','16','2'], answer: 1 }] },
      { id: 'syllogisms', title: 'Syllogisms', notes: 'Venn diagrams and categorical reasoning.',
        formulas: [
          { title: 'Distribution', items: ['Check distribution of terms in premises'] },
          { title: 'Venn mapping', items: ['Translate statements into Venn overlaps'] },
          { title: 'Existential import', items: ['Be cautious if statements assume existence'] },
          { title: 'Quantifier rules', items: ['All, Some, No follow specific implications'] },
          { title: 'Test examples', items: ['Use sample elements to validate conclusions'] }
        ],
        mcqs: [{ q: 'All A are B, Some B are C =>?', choices: ['Some A may be C','All A are C','No A are C','All C are A'], answer: 0 }, { q: 'Venn diagrams represent sets?', choices: ['True','False','Sometimes','Depends'], answer: 0 }, { q: 'Syllogism conclusion must be?', choices: ['Valid or invalid','Always true','Always false','Sometimes true'], answer: 0 }, { q: 'Categorical statements: types?', choices: ['A E I O','B C D E','X Y Z','1 2 3'], answer: 0 }, { q: 'Syllogism uses logical rules: True?', choices: ['True','False','Sometimes','No'], answer: 0 }] },
      { id: 'data-sufficiency', title: 'Data Sufficiency', notes: 'Evaluate sufficiency of given statements.',
        formulas: [
          { title: 'Statement roles', items: ['Determine whether statement A/B alone suffices'] },
          { title: 'Combine statements', items: ['Sometimes both are needed to solve'] },
          { title: 'Yes/No answers', items: ['Practice mapping answers to sufficiency codes'] },
          { title: 'Avoid calculation trap', items: ['You only need sufficiency, not full value'] },
          { title: 'Inequality cases', items: ['Test boundary conditions when inequalities present'] }
        ],
        mcqs: [{ q: 'Two statements sufficient => answer?', choices: ['Yes','No','Maybe','Sometimes'], answer: 0 }, { q: 'Data sufficiency tests reasoning, not exact value: True?', choices: ['True','False','Sometimes','No'], answer: 0 }, { q: 'If one statement enough?', choices: ['A only','B only','Both','None'], answer: 0 }, { q: 'Sufficiency uses yes/no decisions: True?', choices: ['True','False','Maybe','Depends'], answer: 0 }, { q: 'Often uses inequalities: True?', choices: ['True','False','Sometimes','No'], answer: 0 }] },
      { id: 'analytical', title: 'Analytical Reasoning', notes: 'Cause-effect; statements; assumptions.',
        aliases: ['Statement & Assumption', 'Statement & Conclusion', 'Cause & Effect'],
        formulas: [
          { title: 'Argument mapping', items: ['Separate premises, assumptions and conclusions'] },
          { title: 'Assumption tests', items: ['Check if assumption is necessary for conclusion'] },
          { title: 'Inference vs conclusion', items: ['Inference is implied; conclusion may be drawn'] },
          { title: 'Eliminate distractors', items: ['Ignore irrelevant statements'] },
          { title: 'Use structure', items: ['Diagram complex argument relations'] }
        ],
        mcqs: [{ q: 'Analytical reasoning asks cause/effect?', choices: ['Yes','No','Sometimes','Depends'], answer: 0 }, { q: 'Assumptions must be true?', choices: ['Not necessarily','Always','Never','Sometimes'], answer: 0 }, { q: 'Inference is derived from passage?', choices: ['Yes','No','Sometimes','None'], answer: 0 }, { q: 'Conclusion vs assumption: different?', choices: ['Yes','No','Sometimes','None'], answer: 0 }, { q: 'Analytical problems need careful reading?', choices: ['True','False','Sometimes','Never'], answer: 0 }] },
      { id: 'nonverbal', title: 'Non-Verbal Reasoning', notes: 'Pattern recognition, mirror images, figure series.',
        formulas: [
          { title: 'Symmetry', items: ['Check for axes of symmetry'] },
          { title: 'Rotation rules', items: ['Track relative positions after rotation'] },
          { title: 'Mirror images', items: ['Flip left-right for mirror operations'] },
          { title: 'Shape decomposition', items: ['Break complex figures into known shapes'] },
          { title: 'Transform sequence', items: ['Identify repeated transforms across panels'] }
        ],
        mcqs: [{ q: 'Mirror image flips left-right?', choices: ['True','False','Sometimes','Depends'], answer: 0 }, { q: 'Figure series needs next figure selection?', choices: ['Yes','No','Sometimes','Depends'], answer: 0 }, { q: 'Rotation of shapes preserves size?', choices: ['True','False','Sometimes','Depends'], answer: 0 }, { q: 'Non-verbal uses visual patterns: True?', choices: ['True','False','Sometimes','No'], answer: 0 }, { q: 'Practice improves speed?', choices: ['Yes','No','Maybe','Depends'], answer: 0 }] }
    ]
  },
  {
    id: 'di',
    title: 'Data Interpretation',
    description: 'Tables, bar/line/pie charts, caselets, mixed graphs.',
    subtopics: [ 
      { id: 'tables', title: 'Tables', notes: 'Reading values from tables, totals, subtotals, percentage diff.',
        formulas: [
          { title: 'Totals & subtotals', items: ['Sum rows/columns carefully; watch for subgroups'] },
          { title: 'Percentage change', items: ['(new - old)/old × 100 applied per cell when needed'] },
          { title: 'Averages from tables', items: ['Weighted averages may use counts as weights'] },
          { title: 'Comparisons', items: ['Use differences or ratios to compare categories'] },
          { title: 'Missing values', items: ['Infer missing entries from totals when possible'] }
        ],
        mcqs: [ { q: 'Table value extraction practice', choices: ['Option1','Option2','Option3','Option4'], answer: 0 }, { q: 'Calculate percentage from table', choices: ['A','B','C','D'], answer: 0 }, { q: 'Interpret a mixed graph', choices: ['A','B','C','D'], answer: 0 }, { q: 'Compare rows and columns', choices: ['A','B','C','D'], answer: 0 }, { q: 'Find highest value', choices: ['A','B','C','D'], answer: 0 } ] },
      { id: 'charts', title: 'Charts & Graphs', notes: 'Bar, pie, line charts; reading points and computing ratios.',
        formulas: [
          { title: 'Pie chart percent', items: ['Portion = (value/total) × 100'] },
          { title: 'Bar comparisons', items: ['Compare bar heights directly or via scale'] },
          { title: 'Line trend analysis', items: ['Look at slope of line segments for rate changes'] },
          { title: 'Mixed charts', items: ['Align axes and units before comparing series'] },
          { title: 'Label reading', items: ['Always check axis labels and units'] }
        ],
        mcqs: [ { q: 'Pie chart portion percent', choices: ['25%','20%','30%','15%'], answer: 0 }, { q: 'Bar chart compare data', choices: ['True','False','Sometimes','No'], answer: 0 }, { q: 'Line chart trend up?', choices: ['Increase','Decrease','Flat','No trend'], answer: 0 }, { q: 'Caselet needs careful reading', choices: ['True','False','Sometimes','No'], answer: 0 }, { q: 'Graphs use axes labels', choices: ['True','False','Sometimes','No'], answer: 0 } ] }
    ]
  },
  {
    id: 'verbal',
    title: 'Verbal Ability / English Aptitude',
    description: 'Vocabulary, grammar, RC, cloze tests, error detection and para jumbles.',
    subtopics: [
      { id: 'vocab', title: 'Vocabulary', notes: 'Synonyms, antonyms, one-word substitutions.',
        aliases: ['Synonyms & Antonyms', 'One-word Substitutions', 'Idioms & Phrases'],
        formulas: [
          { title: 'Synonym selection', items: ['Match nuance & register (formal/informal)'] },
          { title: 'Antonym detection', items: ['Look for opposites in context'] },
          { title: 'Word families', items: ['Recognize roots, prefixes, suffixes'] },
          { title: 'Collocations', items: ['Common pairings (make a decision) guide choice'] },
          { title: 'Context clues', items: ['Surrounding words often signal meaning'] }
        ],
        mcqs: [ { q: 'Synonym of happy', choices: ['Joyful','Sad','Angry','None'], answer: 0 }, { q: 'Antonym of cold', choices: ['Hot','Warm','Cool','Mild'], answer: 0 }, { q: 'One-word for many words', choices: ['Concise','Verbose','Long','Short'], answer: 0 }, { q: 'Synonym of big', choices: ['Large','Tiny','Small','Little'], answer: 0 }, { q: 'Opposite of increase', choices: ['Decrease','Grow','Rise','Expand'], answer: 0 } ] },
      { id: 'grammar', title: 'Grammar', notes: 'Tenses, voice, speech, prepositions.',
        formulas: [
          { title: 'Tense mapping', items: ['Past/present/future selection based on time markers'] },
          { title: 'Subject-verb agreement', items: ['Match singular/plural subjects correctly'] },
          { title: 'Preposition use', items: ['Memorize common verb+preposition pairs'] },
          { title: 'Active vs passive', items: ['Passive: object becomes subject with be + past participle'] },
          { title: 'Articles', items: ['Use a/an/the rules with countable/uncountable nouns'] }
        ],
        mcqs: [ { q: 'Choose correct tense', choices: ['Past','Present','Future','All'], answer: 0 }, { q: 'Active to passive: true/false', choices: ['True','False','Sometimes','Never'], answer: 0 }, { q: 'Preposition use question', choices: ['At','In','On','By'], answer: 0 }, { q: 'Which is conjunction?', choices: ['And','Or','But','All'], answer: 3 }, { q: 'Subject verb agreement', choices: ['Agree','Disagree','Sometimes','No'], answer: 0 } ] },
      { id: 'rc', title: 'Reading Comprehension', notes: 'Paragraph level inference and theme finding.',
        formulas: [
          { title: 'Main idea', items: ['Identify central thesis or purpose of paragraph'] },
          { title: 'Supporting details', items: ['Distinguish main vs supporting sentences'] },
          { title: 'Inference', items: ['Read between lines; do not add external facts'] },
          { title: 'Tone and attitude', items: ['Look for words that signal emotion/judgment'] },
          { title: 'Structure clues', items: ['Intro, body, conclusion often follow logical flow'] }
        ],
        mcqs: [ { q: 'Main idea of a passage is?', choices: ['Theme','Detail','Side note','Author'], answer: 0 }, { q: 'Inference requires?', choices: ['Read between lines','Read literally','Guess','Skip'], answer: 0 }, { q: 'Tone detection means?', choices: ['Author mood','Facts','Numbers','None'], answer: 0 }, { q: 'Fact vs opinion', choices: ['Fact is verifiable','Opinion','Both','None'], answer: 0 }, { q: 'Topic sentence located?', choices: ['Start or end','Middle only','Random','Nowhere'], answer: 0 } ] },
      { 
        id: 'sentence', title: 'Sentence Completion & Cloze', notes: 'Fill-in-the-blank, cloze tests.',
        formulas: [
          { title: 'Context clues', items: ['Look for nearby words that limit meaning'] },
          { title: 'Collocations', items: ['Common word pairs help select the right word'] },
          { title: 'Part of speech', items: ['Identify expected POS to narrow choices'] },
          { title: 'Concord & tense', items: ['Check subject-verb agreement and tense consistency'] },
          { title: 'Degree words', items: ['Modifiers (very, slightly) affect answer choice'] }
        ],
        mcqs: [
          { q: 'Choose the best word: He was ____ tired after the run.', choices: ['extremely','exactly','quickly','rarely'], answer: 0 },
          { q: 'Complete: The committee agreed ____ the proposal.', choices: ['on','to','with','by'], answer: 0 },
          { q: 'Fill: She sings ____ than her sister.', choices: ['better','good','best','well'], answer: 0 },
          { q: 'Best fit: The movie was _____ enjoyable.', choices: ['highly','much','more','little'], answer: 0 },
          { q: 'Choose the word: He is ____ a talented writer.', choices: ['undoubtedly','occasionally','rarely','eventually'], answer: 0 }
        ]
      },
      { 
        id: 'error', title: 'Error Detection', notes: 'Spotting grammar errors.',
        formulas: [
          { title: 'Subject-verb', items: ['Ensure singular/plural agreement'] },
          { title: 'Tense consistency', items: ['Maintain same tense unless context requires change'] },
          { title: 'Prepositions', items: ['Common verb+preposition pairs: depend on, consist of'] },
          { title: 'Articles', items: ['Use a/an for consonant/vowel sounds, the for specific nouns'] },
          { title: 'Parallelism', items: ['Maintain structure in lists and comparisons'] }
        ],
        mcqs: [
          { q: 'Identify error: She don\'t like apples.', choices: ['don\'t','apples','She','like'], answer: 0 },
          { q: 'Choose correct: He has gone ___ London.', choices: ['to','in','on','at'], answer: 0 },
          { q: 'Find error: Running, jumping and to swim are fun.', choices: ['Running','jumping','to swim','are'], answer: 2 },
          { q: 'Correct article: I saw ____ elephant at the zoo.', choices: ['an','a','the','no article'], answer: 0 },
          { q: 'Tense error: She will went to market tomorrow.', choices: ['will went','to market','tomorrow','She'], answer: 0 }
        ]
      },
      { 
        id: 'para', title: 'Para Jumbles', notes: 'Rearranging sentences.',
        formulas: [
          { title: 'Connectors', items: ['Look for linking words (however, therefore, meanwhile)'] },
          { title: 'Pronoun references', items: ['Match pronouns to antecedents to set order'] },
          { title: 'Chronology', items: ['Time-sequence clues (then, next, before) help order'] },
          { title: 'Topic sentence', items: ['Identify sentence that introduces main idea'] },
          { title: 'Cohesion', items: ['Sentence flow should be logical and coherent'] }
        ],
        mcqs: [
          { q: 'Which sentence likely starts a paragraph?', choices: ['A sentence stating the main idea','A concluding remark','A specific example','A transitional phrase'], answer: 0 },
          { q: 'Connector that shows contrast?', choices: ['however','therefore','furthermore','similarly'], answer: 0 },
          { q: 'Pronoun needs antecedent: Pick sentence that provides it.', choices: ['The dog chased the cat.', 'It ran fast.','Because it was scared.','Which was loud.'], answer: 0 },
          { q: 'Best ending sentence is one that?', choices: ['Summarizes the point','Introduces new idea','Gives an example','Starts topic'], answer: 0 },
          { q: 'Chronology clue word is?', choices: ['then','despite','although','meanwhile'], answer: 0 }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced / Placement-Specific',
    description: 'Puzzles, set theory, game theory basics, clocks & calendars, cryptarithmetic.',
    subtopics: [ 
      { 
        id: 'puzzles-advanced',
        title: 'Advanced Puzzles',
        notes: 'Advanced puzzle practice and strategies.',
        formulas: [
          { title: 'Constraint first', items: ['List fixed constraints before trying placements'] },
          { title: 'Use symmetry', items: ['Exploit symmetric cases to reduce search space'] },
          { title: 'Work backward', items: ['Start from the goal state to see necessary conditions'] },
          { title: 'Modulo reasoning', items: ['For cyclic puzzles like calendars/clocks use mod arithmetic'] },
          { title: 'Digit patterns', items: ['In cryptarithmetic map carries and place-value constraints'] }
        ],
        mcqs: [ { q: 'Advanced puzzle sample', choices: ['A','B','C','D'], answer: 0 }, { q: 'Time and calendar problem', choices: ['A','B','C','D'], answer: 0 }, { q: 'Cryptarithmetic basic', choices: ['A','B','C','D'], answer: 0 }, { q: 'Clock angle', choices: ['A','B','C','D'], answer: 0 }, { q: 'Calendar weekday', choices: ['A','B','C','D'], answer: 0 } ] 
      }, 
      { 
        id: 'set-theory', title: 'Set Theory', notes: 'Union, intersection, complements.',
        formulas: [
          { title: 'Union', items: ['A \u222A B includes elements in A or B or both'] },
          { title: 'Intersection', items: ['A \u2229 B includes elements common to A and B'] },
          { title: 'Complement', items: ['A\' = Universal \u2212 A'] },
          { title: 'De Morgan', items: ['(A \u222A B)\' = A\' \u2229 B\''] },
          { title: 'Set identities', items: ['A \u222A \u2205 = A ; A \u2229 A = A'] }
        ],
        mcqs: [
          { q: 'If A={1,2} B={2,3} then A \u222A B =?', choices: ['{1,2,3}','{2}','{1}','{3}'], answer: 0 },
          { q: 'A \u2229 B gives elements ?', choices: ['Common to A and B','All elements','None','Complement'], answer: 0 },
          { q: 'Complement of universal set is?', choices: ['Empty set','Universal','A','B'], answer: 0 },
          { q: 'De Morgan transforms union to?', choices: ['Intersection of complements','Union of complements','Same','None'], answer: 0 },
          { q: 'A \u2229 A = ?', choices: ['A','\u2205','U','A\''], answer: 0 }
        ] 
      } 
    ]
  }
];

export default topics;
