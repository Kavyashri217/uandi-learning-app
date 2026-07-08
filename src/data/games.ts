// Content + generators for the four learning games. Difficulty comes in
// three bands mapped from the student's class, so one game serves
// everyone from class 1 to 12.

export type GameBand = 'easy' | 'medium' | 'hard';

export function bandForClass(klass: number): GameBand {
  if (klass <= 3) return 'easy';
  if (klass <= 7) return 'medium';
  return 'hard';
}

// ---------- Math Sprint: generated arithmetic ----------
export interface MathQ {
  q: string;
  answer: number;
  options: number[];
}

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function withOptions(q: string, answer: number): MathQ {
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = ri(1, Math.max(3, Math.round(Math.abs(answer) * 0.3)));
    opts.add(answer + (Math.random() < 0.5 ? -delta : delta));
  }
  return { q, answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function genMathQuestion(klass: number): MathQ {
  const band = bandForClass(klass);
  if (band === 'easy') {
    if (Math.random() < 0.6) {
      const a = ri(1, 10), b = ri(1, 10);
      return withOptions(`${a} + ${b} = ?`, a + b);
    }
    const a = ri(5, 20), b = ri(1, a);
    return withOptions(`${a} − ${b} = ?`, a - b);
  }
  if (band === 'medium') {
    const pick = Math.random();
    if (pick < 0.4) {
      const a = ri(2, 12), b = ri(2, 12);
      return withOptions(`${a} × ${b} = ?`, a * b);
    }
    if (pick < 0.7) {
      const b = ri(2, 12), ans = ri(2, 12);
      return withOptions(`${b * ans} ÷ ${b} = ?`, ans);
    }
    const a = ri(20, 99), b = ri(10, 99);
    return withOptions(`${a} + ${b} = ?`, a + b);
  }
  // hard
  const pick = Math.random();
  if (pick < 0.3) {
    const n = ri(4, 15);
    return withOptions(`${n}² = ?`, n * n);
  }
  if (pick < 0.55) {
    const pcts = [10, 20, 25, 50];
    const p = pcts[ri(0, pcts.length - 1)];
    const base = ri(2, 20) * 20;
    return withOptions(`${p}% of ${base} = ?`, (p * base) / 100);
  }
  if (pick < 0.8) {
    const a = ri(-12, 12), b = ri(-12, 12);
    return withOptions(`(${a}) × (${b}) = ?`, a * b);
  }
  const x = ri(2, 9), m = ri(2, 9), c = ri(-10, 10);
  return withOptions(`If x = ${x}, what is ${m}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)}?`, m * x + c);
}

// ---------- Word Wizard: unscramble ----------
export interface WordEntry { word: string; hint: string }

export const WORDS: Record<GameBand, WordEntry[]> = {
  easy: [
    { word: 'SUN', hint: 'It shines in the sky during the day' },
    { word: 'CAT', hint: 'A pet that says meow' },
    { word: 'DOG', hint: 'A pet that barks' },
    { word: 'TREE', hint: 'It has leaves and branches' },
    { word: 'BOOK', hint: 'You read this' },
    { word: 'FISH', hint: 'It swims in water' },
    { word: 'MOON', hint: 'You see it at night' },
    { word: 'STAR', hint: 'Twinkle twinkle little…' },
    { word: 'RAIN', hint: 'Water falling from clouds' },
    { word: 'MILK', hint: 'A white drink from cows' },
    { word: 'BALL', hint: 'You throw and catch it' },
    { word: 'KITE', hint: 'It flies on a string' },
    { word: 'FROG', hint: 'A green animal that jumps' },
    { word: 'BIRD', hint: 'It has wings and can fly' },
  ],
  medium: [
    { word: 'SCHOOL', hint: 'Where you go to learn' },
    { word: 'PLANET', hint: 'Earth is one of these' },
    { word: 'FLOWER', hint: 'Colourful part of a plant' },
    { word: 'WINDOW', hint: 'You look outside through it' },
    { word: 'PENCIL', hint: 'You write and can erase with it' },
    { word: 'ORANGE', hint: 'A fruit and a colour' },
    { word: 'JUNGLE', hint: 'A thick forest full of animals' },
    { word: 'DOCTOR', hint: 'This person treats sick people' },
    { word: 'FARMER', hint: 'This person grows crops' },
    { word: 'TEMPLE', hint: 'A place of worship' },
    { word: 'ROCKET', hint: 'It flies to space' },
    { word: 'GARDEN', hint: 'A place where plants grow' },
    { word: 'BRIDGE', hint: 'It helps you cross a river' },
    { word: 'MARKET', hint: 'You buy vegetables here' },
  ],
  hard: [
    { word: 'SCIENCE', hint: 'The study of the natural world' },
    { word: 'TRIANGLE', hint: 'A shape with three sides' },
    { word: 'COMPUTER', hint: 'An electronic machine you can program' },
    { word: 'KNOWLEDGE', hint: 'What you gain by learning' },
    { word: 'GEOGRAPHY', hint: 'The study of Earth and places' },
    { word: 'CHEMISTRY', hint: 'The science of substances and reactions' },
    { word: 'EQUATION', hint: 'A maths statement with an equals sign' },
    { word: 'DEMOCRACY', hint: 'Government by the people' },
    { word: 'HOSPITAL', hint: 'Where sick people are treated' },
    { word: 'LANGUAGE', hint: 'Kannada, Hindi and English are these' },
    { word: 'DISCOVERY', hint: 'Finding something new' },
    { word: 'EDUCATION', hint: 'The process of learning and teaching' },
    { word: 'GRAVITY', hint: 'The force that pulls things down' },
    { word: 'MOUNTAIN', hint: 'Everest is the tallest one' },
  ],
};

// ---------- Memory Match: pair themes ----------
export interface PairTheme { id: string; name: string; emoji: string; pairs: [string, string][] }

export const PAIR_THEMES: PairTheme[] = [
  {
    id: 'kannada',
    name: 'Kannada ↔ English',
    emoji: '🌺',
    pairs: [
      ['ನೀರು', 'Water'], ['ಮನೆ', 'House'], ['ಸೂರ್ಯ', 'Sun'], ['ಪುಸ್ತಕ', 'Book'],
      ['ಹೂವು', 'Flower'], ['ನಾಯಿ', 'Dog'], ['ಮರ', 'Tree'], ['ಶಾಲೆ', 'School'],
    ],
  },
  {
    id: 'hindi',
    name: 'Hindi ↔ English',
    emoji: '🪔',
    pairs: [
      ['पानी', 'Water'], ['घर', 'House'], ['सूरज', 'Sun'], ['किताब', 'Book'],
      ['फूल', 'Flower'], ['कुत्ता', 'Dog'], ['पेड़', 'Tree'], ['विद्यालय', 'School'],
    ],
  },
  {
    id: 'opposites',
    name: 'Opposites',
    emoji: '↔️',
    pairs: [
      ['Hot', 'Cold'], ['Big', 'Small'], ['Day', 'Night'], ['Fast', 'Slow'],
      ['Happy', 'Sad'], ['Up', 'Down'], ['Old', 'New'], ['Light', 'Dark'],
    ],
  },
  {
    id: 'elements',
    name: 'Chemical Symbols',
    emoji: '🧪',
    pairs: [
      ['Na', 'Sodium'], ['Fe', 'Iron'], ['Au', 'Gold'], ['O', 'Oxygen'],
      ['H', 'Hydrogen'], ['Ca', 'Calcium'], ['K', 'Potassium'], ['Ag', 'Silver'],
    ],
  },
  {
    id: 'capitals',
    name: 'Countries & Capitals',
    emoji: '🗺️',
    pairs: [
      ['India', 'New Delhi'], ['Japan', 'Tokyo'], ['France', 'Paris'], ['USA', 'Washington DC'],
      ['Nepal', 'Kathmandu'], ['China', 'Beijing'], ['Sri Lanka', 'Colombo'], ['UK', 'London'],
    ],
  },
];

// ---------- Rapid Fire: true/false ----------
export interface TFStatement { s: string; answer: boolean }

export const TRUE_FALSE: Record<GameBand, TFStatement[]> = {
  easy: [
    { s: 'The sun rises in the east.', answer: true },
    { s: 'A cat has six legs.', answer: false },
    { s: '2 + 2 = 5', answer: false },
    { s: 'Fish live in water.', answer: true },
    { s: 'There are 7 days in a week.', answer: true },
    { s: 'Ice is hot.', answer: false },
    { s: 'A triangle has 3 sides.', answer: true },
    { s: 'We see with our ears.', answer: false },
    { s: '10 is more than 8.', answer: true },
    { s: 'Bananas are blue.', answer: false },
    { s: 'The moon comes out at night.', answer: true },
    { s: 'Dogs can fly.', answer: false },
    { s: '5 × 2 = 10', answer: true },
    { s: 'An elephant is bigger than a mouse.', answer: true },
    { s: 'We should wash hands before eating.', answer: true },
    { s: 'A cow says "meow".', answer: false },
  ],
  medium: [
    { s: 'The Earth revolves around the Sun.', answer: true },
    { s: 'Water boils at 50°C.', answer: false },
    { s: 'New Delhi is the capital of India.', answer: true },
    { s: 'A spider has 8 legs.', answer: true },
    { s: 'Photosynthesis happens in the roots.', answer: false },
    { s: '1 km = 1000 m.', answer: true },
    { s: "The plural of 'child' is 'childs'.", answer: false },
    { s: 'Mahatma Gandhi is called the Father of the Nation.', answer: true },
    { s: 'A hexagon has 5 sides.', answer: false },
    { s: 'Sound travels faster than light.', answer: false },
    { s: 'The Ganga is a river in India.', answer: true },
    { s: '7 × 8 = 54', answer: false },
    { s: 'Our heart pumps blood.', answer: true },
    { s: 'Mount Everest is the tallest mountain on Earth.', answer: true },
    { s: 'Plants make food using sunlight.', answer: true },
    { s: 'The freezing point of water is 10°C.', answer: false },
  ],
  hard: [
    { s: 'The chemical symbol of gold is Au.', answer: true },
    { s: 'Light travels at about 3 × 10⁸ m/s.', answer: true },
    { s: 'The square root of 169 is 13.', answer: true },
    { s: 'The French Revolution began in 1789.', answer: true },
    { s: 'The formula of water is CO₂.', answer: false },
    { s: 'The Constitution of India came into force in 1952.', answer: false },
    { s: 'sin 90° = 0.', answer: false },
    { s: 'Python is a programming language.', answer: true },
    { s: 'The currency of Japan is the Won.', answer: false },
    { s: 'The ozone layer protects us from UV rays.', answer: true },
    { s: 'Mitochondria is the powerhouse of the cell.', answer: true },
    { s: 'The binary number system uses digits 0 to 9.', answer: false },
    { s: 'The Pacific is the largest ocean.', answer: true },
    { s: 'Newton gave the three laws of motion.', answer: true },
    { s: 'The pH of a neutral solution is 7.', answer: true },
    { s: 'DNA has a triple-helix structure.', answer: false },
  ],
};

export const GAME_META: Record<string, { name: string; emoji: string; desc: string }> = {
  'math-sprint': { name: 'Math Sprint', emoji: '⚡', desc: '60 seconds. How many can you solve?' },
  'word-wizard': { name: 'Word Wizard', emoji: '🔤', desc: 'Unscramble the letters to make a word' },
  'memory-match': { name: 'Memory Match', emoji: '🃏', desc: 'Flip cards and match the pairs' },
  'rapid-fire': { name: 'Rapid Fire', emoji: '🔥', desc: 'True or false — think fast!' },
};
