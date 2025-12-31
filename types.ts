
export type MazeShape = 
  | 'square' 
  | 'circle' 
  | 'diamond' 
  | 'cross' 
  | 'triangle' 
  | 'star' 
  | 'heart'
  | 'donut'
  | 'hexagon'
  | 'octagon'
  | 'moon'
  | 'arrow';

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

export interface MazeConfig {
  size: number;
  cellSize: number;
  shape: MazeShape;
  difficulty: Difficulty;
  showSolution: boolean;
  showMarks: boolean;
  seed: string;
  themeId: ThemeId;
  wallThickness: number;
  pathThickness: number;
  pdfHeader: string;
  pdfFooter: string;
  pdfCredits: string;
  showSignatureFields: boolean;
  randomizeShapes: boolean;
  randomizeDifficulty: boolean;
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
  isPath?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface GeneratedMaze {
  grid: Cell[][];
  start: Point;
  end: Point;
  solution: Point[];
  story: string;
  config: MazeConfig;
}
