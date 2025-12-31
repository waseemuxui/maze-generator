
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
  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  const columns = [
    { start: 1, end: 15 }, { start: 16, end: 30 }, { start: 31, end: 45 }, 
    { start: 46, end: 60 }, { start: 61, end: 75 }
  ];
  for (let c = 0; c < 5; c++) {
    const nums: number[] = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * (columns[c].end - columns[c].start + 1)) + columns[c].start;
      if (!nums.includes(n)) nums.push(n);
    }
    nums.sort((a, b) => a - b);
    for (let r = 0; r < 5; r++) grid[r][c] = nums[r];
  }
  grid[2][2] = 'FREE';
  return { type: config.generatorType, grid, config };
};

const generateSudoku = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const base = [
    [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
  ];
  const grid = JSON.parse(JSON.stringify(base));
  const removeCount = config.difficulty === 'easy' ? 30 : config.difficulty === 'medium' ? 45 : 55;
  for (let i = 0; i < removeCount; i++) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    grid[r][c] = null;
  }
  return { type: config.generatorType, grid, solution: base, config };
};

const generateWordSearch = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = config.size || 15;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const words = config.words.length > 0 ? config.words : ['MAZE', 'PUZZLE', 'LOGIC', 'QUEST', 'BOOK', 'GENIUS', 'QUEST', 'SOLVE'];
  
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
  const words = config.words.length > 0 ? config.words : ['labyrinth', 'architect', 'complexity', 'solution', 'adventure'];
  const grid = words.map(w => {
    const arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return { scrambled: arr.join('').toUpperCase(), original: w.toUpperCase() };
  });
  return { type: config.generatorType, grid, config };
};

const generateMagicSquare = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const n = 3;
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  let i = Math.floor(n / 2), j = n - 1;
  for (let num = 1; num <= n * n; ) {
    if (i === -1 && j === n) { j = n - 2; i = 0; }
    else { if (j === n) j = 0; if (i < 0) i = n - 1; }
    if (grid[i][j]) { j -= 2; i++; continue; }
    else grid[i][j] = num++;
    j++; i--;
  }
  const displayGrid = grid.map(row => row.map(cell => Math.random() > 0.4 ? null : cell));
  return { type: config.generatorType, grid: displayGrid, solution: grid, config };
};

const generateCrossword = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = 11;
  const grid = Array.from({ length: size }, () => Array(size).fill('#'));
  for (let i = 0; i < size; i++) {
    grid[5][i] = '';
    grid[i][5] = '';
  }
  return { type: config.generatorType, grid, config, clues: ['1. Across: Hidden Path', '1. Down: Deep Mystery'] };
};

const generateTartan = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000', '#ffffff'];
  const stripes = Array.from({ length: 8 }, () => ({
    color: colors[Math.floor(Math.random() * colors.length)],
    width: Math.floor(Math.random() * 30) + 5
  }));
  return { type: config.generatorType, renderData: stripes, config };
};

const generateKenKen = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = 4;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  for(let r=0; r<size; r++) for(let c=0; c<size; c++) grid[r][c] = ((r+c)%size)+1;
  const cages = [
    { cells: [[0,0], [0,1]], target: 3, op: '+' },
    { cells: [[1,0], [2,0]], target: 2, op: '/' },
  ];
  return { type: config.generatorType, grid, renderData: cages, config };
};

const generateStarBattle = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = 8;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const regions = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => Math.floor((x+y)/2)));
  return { type: config.generatorType, grid, renderData: regions, config };
};

const generateBridges = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const islands = [
    { x: 1, y: 1, val: 2 }, { x: 4, y: 1, val: 3 },
    { x: 1, y: 4, val: 2 }, { x: 4, y: 4, val: 1 }
  ];
  return { type: config.generatorType, renderData: islands, config };
};

const generateBauhaus = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const shapes = Array.from({ length: 15 }, () => ({
    type: ['circle', 'rect', 'poly'][Math.floor(Math.random()*3)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 40 + 10,
    color: ['#e11d48', '#2563eb', '#f59e0b', '#000000'][Math.floor(Math.random()*4)]
  }));
  return { type: config.generatorType, renderData: shapes, config };
};

const generateKakuro = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const size = 8;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  return { type: config.generatorType, grid, config };
};

const generateCryptogram = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const quote = "THE ONLY WAY OUT IS THROUGH THE LABYRINTH";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
  const map: Record<string, string> = {};
  alphabet.forEach((l, i) => map[l] = shuffled[i]);
  
  const encoded = quote.split("").map(c => map[c] || c).join("");
  return { type: config.generatorType, grid: { encoded, original: quote }, config };
};

const generateTwistedWordSearch = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const puzzle = generateWordSearch(config);
  return { ...puzzle, type: 'twistedword' };
};

const generateMazePuzzle = (config: AppConfig): Omit<GeneratedPuzzle, 'story'> => {
  const result = generateMaze(config);
  return {
    type: config.generatorType,
    grid: result.grid,
    start: result.start,
    end: result.end,
    solution: result.solution,
    config
  };
};
