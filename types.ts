export type GeneratorType = 
  | 'maze' | 'maze2' | 'bingo' | 'crossword' | 'kenken' 
  | 'magicsquare' | 'starbattle' | 'sudoku' | 'tartan' 
  | 'wordscramble' | 'wordsearch' | 'twistedword' 
  | 'bridges' | 'bauhaus' | 'kakuro' | 'cryptogram';

export type MazeShape = 'square' | 'circle' | 'diamond' | 'cross' | 'triangle' | 'star' | 'heart' | 'donut' | 'hexagon' | 'octagon' | 'moon' | 'arrow' | 'clover' | 'shield' | 'bolt';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ThemeId = 'classic' | 'nightmare' | 'enchanted' | 'cyberpunk' | 'parchment' | 'ocean' | 'sunset' | 'candy' | 'cartoon';
export type PdfPageSize = 'a4' | 'letter' | 'legal';
export type PdfOrientation = 'portrait' | 'landscape';
export type PdfFont = 'helvetica' | 'courier' | 'times';
export type PdfBorderStyle = 'none' | 'modern' | 'playful' | 'stars' | 'wavy' | 'dashed' | 'dotted' | 'double' | 'floral';

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
  pdfPageSize: PdfPageSize;
  pdfOrientation: PdfOrientation;
  pdfFont: PdfFont;
  pdfMargin: number;
  pdfShowDecorativeLines: boolean;
  pdfBorderStyle: PdfBorderStyle;
  pdfAccentColor: string;
  pdfRuleColor: string;
  pdfRuleThickness: number;
  pdfLogoBase64: string | null;
  pdfWatermarkText: string;
  
  // Signature / Field Labels
  showSignatureFields: boolean;
  signatureLabel1: string; 
  signatureLabel2: string; 
  
  // Batch & Progression Options
  bulkCount: number;
  randomizeShapes: boolean;
  enableProgression: boolean; 
  randomizeGenerators: boolean;

  // --- Specialized Generator Settings ---
  
  // Mazes
  mazeBraidChance: number; // 0-1, likelihood of removing dead ends
  
  // Logic
  sudokuSize: number; // 4, 9, 16
  sudokuSymmetry: boolean;
  kenKenSize: number; // 3-9
  kenKenOps: string[]; // ['+', '-', '*', '/']
  magicSquareSize: number; // 3-11
  starBattleSize: number; // 6-12
  starBattleStars: number; // 1, 2, 3
  kakuroDensity: number; // 0.1 - 0.5
  
  // Word
  words: string[];
  wordSearchDirections: string[]; // ['E', 'S', 'SE', 'SW']
  wordSearchOverlap: boolean;
  wordScrambleCount: number;
  cryptogramSource: string;
  twistedWordBending: boolean;
  crosswordDensity: number;
  
  // Node
  bridgesIslandCount: number;
  bridgesMaxBridges: number;
  
  // Games
  bingoGridSize: number; // 3, 5
  bingoCardCount: number;
  
  // Art
  tartanStripeCount: number;
  tartanComplexity: number;
  bauhausShapeCount: number;
  bauhausStyle: 'minimal' | 'modern' | 'chaotic';

  // General fallback
  gridSize: number;
}

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
  renderData?: any; 
}