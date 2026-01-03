
import { AppConfig, GeneratedPuzzle, Point, MazeShape, Difficulty, GeneratorType } from '../types';
import { isInsideShape, generateMaze } from './mazeLogic';

export const generatePuzzle = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  switch (config.generatorType) {
    case 'bingo': return generateBingo(config);
    case 'sudoku': return generateSudoku(config);
    case 'wordsearch': return generateWordSearch(config);
    case 'wordscramble': return generateWordScramble(config);
    case 'magicsquare': return generateMagicSquare(config);
    case 'tartan': return generateTartan(config);
    case 'crossword': return generateCrossword(config);
    case 'kenken': return generateKenKen(config);
    case 'starbattle': return generateStarBattle(config);
    case 'bridges': return generateBridges(config);
    case 'bauhaus': return generateBauhaus(config);
    case 'kakuro': return generateKakuro(config);
    case 'cryptogram': return generateCryptogram(config);
    case 'twistedword': return generateTwistedWordSearch(config);
    case 'maze':
    case 'maze2': return generateMazePuzzle(config);
    default: return generateMazePuzzle(config);
  }
};

const generateBingo = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.bingoGridSize || 5;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  const maxVal = size * 15;
  const used = new Set();
  
  for (let c = 0; c < size; c++) {
    const min = c * 15 + 1;
    const max = (c + 1) * 15;
    for (let r = 0; r < size; r++) {
      let n;
      do { n = Math.floor(Math.random() * (max - min + 1)) + min; } while (used.has(n));
      used.add(n);
      grid[r][c] = n;
    }
  }
  if (size === 5) grid[2][2] = 'FREE';
  return { type: config.generatorType, grid, config };
};

const generateSudoku = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.sudokuSize || 9;
  const base9 = [
    [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
  ];
  let grid = size === 4 ? [[1,2,3,4],[3,4,1,2],[2,3,4,1],[4,1,2,3]] : JSON.parse(JSON.stringify(base9));
  const removeCount = config.difficulty === 'easy' ? 0.3 : config.difficulty === 'medium' ? 0.5 : 0.7;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (Math.random() < removeCount) grid[r][c] = '';
    }
  }
  return { type: config.generatorType, grid, solution: size === 4 ? [[1,2,3,4],[3,4,1,2],[2,3,4,1],[4,1,2,3]] : base9, config };
};

const generateWordSearch = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.gridSize || 12;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const words = config.words.length > 0 ? config.words : ['MAZE', 'PUZZLE', 'LOGIC'];
  
  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 50) {
      attempts++;
      const dir = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[1,-1],[-1,1],[-1,-1]][Math.floor(Math.random()*8)];
      const r = Math.floor(Math.random()*size);
      const c = Math.floor(Math.random()*size);
      if (r + dir[0]*(word.length-1) < size && r + dir[0]*(word.length-1) >= 0 && 
          c + dir[1]*(word.length-1) < size && c + dir[1]*(word.length-1) >= 0) {
        let fits = true;
        for (let i=0; i<word.length; i++) {
          const char = grid[r + dir[0]*i][c + dir[1]*i];
          if (char !== '' && char !== word[i].toUpperCase()) { fits = false; break; }
        }
        if (fits) {
          for (let i=0; i<word.length; i++) grid[r + dir[0]*i][c + dir[1]*i] = word[i].toUpperCase();
          placed = true;
        }
      }
    }
  });
  const solution = grid.map(row => [...row]);
  for (let r=0; r<size; r++) {
    for (let c=0; c<size; c++) {
      if (grid[r][c] === '') grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random()*26));
    }
  }
  return { type: config.generatorType, grid, solution, config };
};

const generateWordScramble = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const words = config.words.length > 0 ? config.words.slice(0, config.wordScrambleCount) : ['LABYRINTH', 'ARCHITECT', 'COMPLEXITY'];
  const grid = words.map(w => {
    const arr = w.toUpperCase().split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return { scrambled: arr.join(''), original: w.toUpperCase() };
  });
  return { type: config.generatorType, grid, config };
};

const generateMagicSquare = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const n = config.magicSquareSize || 3;
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  let i = Math.floor(n / 2), j = n - 1;
  for (let num = 1; num <= n * n; ) {
    if (i === -1 && j === n) { j = n - 2; i = 0; }
    else { if (j === n) j = 0; if (i < 0) i = n - 1; }
    if (grid[i][j]) { j -= 2; i++; continue; }
    else grid[i][j] = num++;
    j++; i--;
  }
  const displayGrid = grid.map(row => row.map(cell => Math.random() > 0.4 ? '' : cell));
  return { type: config.generatorType, grid: displayGrid, solution: grid, config };
};

const generateCrossword = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.gridSize || 13;
  const grid = Array.from({ length: size }, () => Array(size).fill('#'));
  for (let i = 1; i < size - 1; i++) {
    for (let j = 1; j < size - 1; j++) {
      if (Math.random() > config.crosswordDensity) grid[i][j] = '';
    }
  }
  return { type: config.generatorType, grid, config, clues: ['1. ACROSS: Hidden Path', '2. DOWN: Deep Mystery'] };
};

const generateTartan = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000', '#ffffff'];
  const stripes = Array.from({ length: config.tartanStripeCount || 8 }, () => ({
    color: colors[Math.floor(Math.random() * colors.length)],
    width: Math.floor(Math.random() * 20) + 5
  }));
  return { type: config.generatorType, renderData: stripes, config };
};

const generateKenKen = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.kenKenSize || 4;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  for(let r=0; r<size; r++) for(let c=0; c<size; c++) grid[r][c] = ((r+c)%size)+1;
  const cages = [
    { cells: [[0,0], [0,1]], target: 3, op: '+' },
    { cells: [[1,0], [2,0]], target: 2, op: '/' },
    { cells: [[0,2], [1,2], [1,1]], target: 6, op: '*' },
    { cells: [[2,1], [2,2]], target: 1, op: '-' },
  ];
  return { type: config.generatorType, grid, renderData: cages, config };
};

const generateStarBattle = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.starBattleSize || 8;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const regions = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => Math.floor((x+y)/3) % 5));
  return { type: config.generatorType, grid, renderData: regions, config };
};

const generateBridges = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const count = config.bridgesIslandCount || 8;
  const islands = Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 8),
    y: Math.floor(Math.random() * 8),
    val: Math.floor(Math.random() * config.bridgesMaxBridges) + 1
  }));
  return { type: config.generatorType, renderData: islands, config };
};

const generateBauhaus = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const shapes = Array.from({ length: config.bauhausShapeCount || 15 }, () => ({
    type: ['circle', 'rect', 'poly'][Math.floor(Math.random()*3)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 40 + 10,
    color: ['#e11d48', '#2563eb', '#f59e0b', '#000000'][Math.floor(Math.random()*4)]
  }));
  return { type: config.generatorType, renderData: shapes, config };
};

const generateKakuro = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.gridSize || 8;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  for(let r=0; r<size; r++) {
    for(let c=0; c<size; c++) {
      if (Math.random() < config.kakuroDensity) grid[r][c] = { down: 12, across: 15 };
      else if (Math.random() > 0.5) grid[r][c] = Math.floor(Math.random()*9)+1;
    }
  }
  return { type: config.generatorType, grid, config };
};

const generateCryptogram = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const quote = config.cryptogramSource || "THE ONLY WAY OUT IS THROUGH THE LABYRINTH";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
  const map: Record<string, string> = {};
  alphabet.forEach((l, i) => map[l] = shuffled[i]);
  const encoded = quote.toUpperCase().split("").map(c => map[c] || c).join("");
  return { type: config.generatorType, grid: { encoded, original: quote.toUpperCase() }, config };
};

const generateTwistedWordSearch = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  return { ...generateWordSearch(config), type: 'twistedword' };
};

const generateMazePuzzle = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const result = generateMaze(config);
  return { type: config.generatorType, grid: result.grid, start: result.start, end: result.end, solution: result.solution, config };
};
