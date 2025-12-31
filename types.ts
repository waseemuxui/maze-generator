
export type GeneratorType = 
  | 'maze' | 'maze2' | 'bingo' | 'crossword' | 'kenken' 
  | 'magicsquare' | 'starbattle' | 'sudoku' | 'tartan' 
  | 'wordscramble' | 'wordsearch' | 'twistedword' 
  | 'bridges' | 'bauhaus' | 'kakuro' | 'cryptogram';

export type MazeShape = 'square' | 'circle' | 'diamond' | 'cross' | 'triangle' | 'star' | 'heart' | 'donut' | 'hexagon' | 'octagon' | 'moon' | 'arrow';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ThemeId = 'classic' | 'nightmare' | 'enchanted' | 'cyberpunk' | 'parchment' | 'ocean';

export interface MazeTheme {
  id: ThemeId;
  name: string;
  wallColor: string;
  pathColor: string;
  bgColor: string;
  startColor: string;
  endColor: string;
  icon: string;
}

// Fix: Export Cell interface used by maze logic and rendering
export interface Cell {
  x: number;
  y: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  isInside: boolean;
}

export interface AppConfig {
  generatorType: GeneratorType;
  size: number;
  // Fix: Added cellSize to AppConfig
  cellSize: number;
  difficulty: Difficulty;
  shape: MazeShape;
  themeId: ThemeId;
  seed: string;
  
  // Display Options
  showSolution: boolean;
  showMarks: boolean;
  wallThickness: number;
  pathThickness: number;

  // PDF & Export
  pdfHeader: string;
  pdfFooter: string;
  pdfCredits: string;
  showSignatureFields: boolean;
  
  // Batch Options
  bulkCount: number;
  randomizeShapes: boolean;
  randomizeDifficulty: boolean;
  randomizeGenerators: boolean;

  // Generator Specifics
  words: string[];
  gridSize: number;
}

// Fix: Export MazeConfig as an alias for AppConfig
export type MazeConfig = AppConfig;

export interface Point { x: number; y: number; }

export interface GeneratedPuzzle {
  type: GeneratorType;
  grid?: any;
  solution?: any;
  start?: Point;
  end?: Point;
  story: string;
  clues?: string[];
  config: AppConfig;
  renderData?: any; // For patterns like Tartan/Bauhaus
}
