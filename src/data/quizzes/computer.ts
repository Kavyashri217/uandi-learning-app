import type { Bank } from '../types';

// Computer Science bank is keyed by the first class of a 2-class band
// (1,3,5,7,9,11) since the concepts broadly span those pairs. The quiz
// picker maps any class to its band key.
export const computer: Bank = {
  1: [
    { q: 'What do we use a computer for?', options: ['Cooking', 'Playing, learning and drawing', 'Sleeping', 'Eating'], answer: 1 },
    { q: 'Which part of the computer shows us pictures?', options: ['Keyboard', 'Monitor', 'Mouse', 'CPU'], answer: 1 },
    { q: 'We type letters using the?', options: ['Mouse', 'Keyboard', 'Screen', 'Speaker'], answer: 1 },
    { q: 'Which one is used to point and click?', options: ['Mouse', 'Monitor', 'Printer', 'CPU'], answer: 0 },
    { q: 'A computer needs ___ to work.', options: ['Water', 'Electricity', 'Food', 'Air'], answer: 1 },
    { q: 'Which machine can print on paper?', options: ['Printer', 'Mouse', 'Keyboard', 'Monitor'], answer: 0 },
    { q: 'A computer is a ___ machine.', options: ['Living', 'Electronic', 'Wooden', 'Paper'], answer: 1 },
    { q: 'Which of these is NOT a part of a computer?', options: ['Monitor', 'Keyboard', 'Banana', 'Mouse'], answer: 2 },
  ],
  3: [
    { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Unit', 'Control Program Unit'], answer: 0 },
    { q: 'Which device is used to hear sound?', options: ['Speaker', 'Keyboard', 'Mouse', 'Scanner'], answer: 0 },
    { q: 'Which key is used to make a space?', options: ['Enter', 'Spacebar', 'Shift', 'Tab'], answer: 1 },
    { q: 'A collection of data stored with a name is a?', options: ['File', 'Mouse', 'Screen', 'Key'], answer: 0 },
    { q: 'Which is an input device?', options: ['Printer', 'Keyboard', 'Monitor', 'Speaker'], answer: 1 },
    { q: 'The brain of the computer is the?', options: ['Monitor', 'CPU', 'Keyboard', 'Mouse'], answer: 1 },
    { q: 'Which software is used to draw pictures?', options: ['Paint', 'Calculator', 'Notepad', 'Clock'], answer: 0 },
    { q: 'What do we call the pictures on the desktop?', options: ['Icons', 'Files', 'Keys', 'Cursors'], answer: 0 },
  ],
  5: [
    { q: 'Which is an output device?', options: ['Keyboard', 'Printer', 'Mouse', 'Scanner'], answer: 1 },
    { q: 'RAM stands for?', options: ['Random Access Memory', 'Read Access Memory', 'Rapid Access Memory', 'Run Access Memory'], answer: 0 },
    { q: 'Which key deletes the character to the left?', options: ['Enter', 'Backspace', 'Shift', 'Caps Lock'], answer: 1 },
    { q: 'A set of instructions given to a computer is a?', options: ['Program', 'File', 'Folder', 'Icon'], answer: 0 },
    { q: 'Which software is used to type letters and documents?', options: ['MS Word', 'MS Paint', 'Calculator', 'Media Player'], answer: 0 },
    { q: 'The permanent memory of a computer is?', options: ['RAM', 'ROM', 'Cache', 'Clipboard'], answer: 1 },
    { q: 'Which of these connects computers around the world?', options: ['Internet', 'Printer', 'Keyboard', 'Speaker'], answer: 0 },
    { q: '1 Kilobyte (KB) is equal to about how many bytes?', options: ['10', '100', '1024', '10000'], answer: 2 },
  ],
  7: [
    { q: 'Which number system does a computer understand?', options: ['Decimal', 'Binary', 'Roman', 'Hexadecimal'], answer: 1 },
    { q: 'HTML is used to create?', options: ['Web pages', 'Songs', 'Videos only', 'Games only'], answer: 0 },
    { q: 'Which is a web browser?', options: ['Chrome', 'Windows', 'MS Word', 'Excel'], answer: 0 },
    { q: 'In binary, the number 2 is written as?', options: ['10', '2', '11', '01'], answer: 0 },
    { q: 'A spreadsheet program is?', options: ['MS Excel', 'MS Paint', 'Notepad', 'Chrome'], answer: 0 },
    { q: 'The full form of WWW is?', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], answer: 0 },
    { q: 'Which symbol starts a formula in Excel?', options: ['+', '=', '@', '#'], answer: 1 },
    { q: 'A harmful program that damages a computer is a?', options: ['Virus', 'Browser', 'File', 'Folder'], answer: 0 },
  ],
  9: [
    { q: 'Which of these is a programming language?', options: ['Python', 'Windows', 'Chrome', 'Excel'], answer: 0 },
    { q: 'What is an algorithm?', options: ['A step-by-step solution to a problem', 'A type of computer', 'A web page', 'A virus'], answer: 0 },
    { q: 'The binary number 1010 equals which decimal number?', options: ['8', '10', '12', '5'], answer: 1 },
    { q: 'ICT stands for?', options: ['Information and Communication Technology', 'Internet Computer Technology', 'Indian Computer Test', 'Input Control Technology'], answer: 0 },
    { q: 'Which of these is an operating system?', options: ['Linux', 'Python', 'HTML', 'Google'], answer: 0 },
    { q: 'A loop in programming is used to?', options: ['Repeat instructions', 'Delete files', 'Print pages', 'Shut down'], answer: 0 },
    { q: 'What does the "cloud" refer to in computing?', options: ['Weather data', 'Storing data on internet servers', 'A type of virus', 'A monitor'], answer: 1 },
    { q: '1 Gigabyte (GB) is approximately how many Megabytes (MB)?', options: ['10', '100', '1024', '10000'], answer: 2 },
  ],
  11: [
    { q: 'In Python, which symbol is used for comments?', options: ['//', '#', '/*', '--'], answer: 1 },
    { q: 'What is the output of print(2 ** 3) in Python?', options: ['6', '8', '9', '5'], answer: 1 },
    { q: 'Which data type stores True or False?', options: ['int', 'bool', 'str', 'float'], answer: 1 },
    { q: 'A named memory location that stores a value is a?', options: ['Variable', 'Loop', 'Function', 'File'], answer: 0 },
    { q: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'define'], answer: 1 },
    { q: 'What does the "for" statement create?', options: ['A condition', 'A loop', 'A variable', 'A comment'], answer: 1 },
    { q: 'Which of these is a valid Python list?', options: ['[1, 2, 3]', '(1; 2; 3)', '{1 2 3}', '<1,2,3>'], answer: 0 },
    { q: 'The process of finding and fixing errors in code is called?', options: ['Compiling', 'Debugging', 'Running', 'Saving'], answer: 1 },
  ],
};
