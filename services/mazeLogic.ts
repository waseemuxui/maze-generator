
import { MazeConfig, Cell, Point, MazeShape } from '../types';

export const isInsideShape = (x: number, y: number, shape: MazeShape, size: number): boolean => {
  const center = (size - 1) / 2;
  const dx = (x - center) / center;
  const dy = (y - center) / center;
  const r = Math.sqrt(dx * dx + dy * dy);

  switch (shape) {
    case 'square': return true;
    case 'circle': return r <= 1.0;
    case 'diamond': return Math.abs(dx) + Math.abs(dy) <= 1.0;
    case 'cross': return Math.abs(dx) < 0.4 || Math.abs(dy) < 0.4;
    case 'triangle': return dy <= 0.8 && dy >= -1.0 && Math.abs(dx) <= (1.0 - (dy + 1.0) / 1.8);
    case 'star': {
      const angle = Math.atan2(dy, dx);
      const s = Math.abs(Math.cos(angle * 2.5));
      return r <= 0.3 + 0.7 * s;
    }
    case 'heart': {
      const a = Math.atan2(dy, dx - 0.0001); // avoid div zero
      const heartR = (Math.sin(a) * Math.sqrt(Math.abs(Math.cos(a)))) / (Math.sin(a) + 1.4) - 2 * Math.sin(a) + 2;
      return r <= heartR * 0.3;
    }
    case 'donut': return r <= 1.0 && r >= 0.4;
    case 'hexagon': return Math.abs(dx) <= 0.866 && Math.abs(dy) <= 1.0 && Math.abs(dx) * 0.5 + Math.abs(dy) * 0.866 <= 0.866;
    case 'octagon': {
      const oct = Math.abs(dx) <= 1.0 && Math.abs(dy) <= 1.0 && (Math.abs(dx) + Math.abs(dy) <= 1.4);
      return oct;
    }
    case 'moon': {
      const isMainCircle = r <= 1.0;
      const distToCrescent = Math.sqrt(Math.pow(dx - 0.4, 2) + Math.pow(dy - 0.2, 2));
      return isMainCircle && distToCrescent > 0.8;
    }
    case 'arrow': {
      const isHead = dy < -0.2 && Math.abs(dx) <= (dy + 1.0) / 0.8;
      const isShaft = dy >= -0.2 && Math.abs(dx) < 0.3 && dy < 0.9;
      return isHead || isShaft;
    }
    case 'clover': {
      const angle = Math.atan2(dy, dx);
      const cloverR = 0.5 + 0.5 * Math.abs(Math.cos(2 * angle));
      return r <= cloverR * 0.9;
    }
    case 'shield': {
      if (Math.abs(dx) > 0.8) return false;
      if (dy < 0) return true; // Top rectangle part
      return dy <= 1.0 - Math.abs(dx); // Pointed bottom part
    }
    case 'bolt': {
      // Piece-wise definition of a lightning bolt
      const inTop = dy < 0 && dy > -0.8 && dx > -0.6 && dx < 0.2 && (dx - dy < 0.4);
      const inBottom = dy >= 0 && dy < 0.8 && dx > -0.2 && dx < 0.6 && (dx - dy > -0.4);
      return inTop || inBottom;
    }
    default: return true;
  }
};

export const generateMaze = (config: MazeConfig): { grid: Cell[][], start: Point, end: Point, solution: Point[] } => {
  const { size, difficulty } = config;
  const grid: Cell[][] = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => ({
      x,
      y,
      visited: false,
      walls: { top: true, right: true, bottom: true, left: true },
      isInside: isInsideShape(x, y, config.shape, size)
    }))
  );

  const stack: Cell[] = [];
  const startCandidates = grid.flat().filter(c => c.isInside);
  if (startCandidates.length === 0) return { grid, start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, solution: [] };

  const startCell = startCandidates[Math.floor(Math.random() * startCandidates.length)];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { cell: Cell; dir: keyof Cell['walls'] }[] = [];
    const dirs: { x: number; y: number; dir: keyof Cell['walls']; opp: keyof Cell['walls'] }[] = [
      { x: 0, y: -1, dir: 'top', opp: 'bottom' },
      { x: 1, y: 0, dir: 'right', opp: 'left' },
      { x: 0, y: 1, dir: 'bottom', opp: 'top' },
      { x: -1, y: 0, dir: 'left', opp: 'right' }
    ];

    for (const d of dirs) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        const neighbor = grid[ny][nx];
        if (neighbor.isInside && !neighbor.visited) {
          neighbors.push({ cell: neighbor, dir: d.dir });
        }
      }
    }

    if (neighbors.length > 0) {
      const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
      const opp = dir === 'top' ? 'bottom' : dir === 'bottom' ? 'top' : dir === 'left' ? 'right' : 'left';
      current.walls[dir] = false;
      next.walls[opp] = false;
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Braiding: Remove some dead ends based on difficulty
  const braidChance = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 0.2 : 0;
  if (braidChance > 0) {
    grid.flat().forEach(cell => {
      if (!cell.isInside) return;
      const wallCount = (cell.walls.top ? 1 : 0) + (cell.walls.right ? 1 : 0) + (cell.walls.bottom ? 1 : 0) + (cell.walls.left ? 1 : 0);
      if (wallCount === 3 && Math.random() < braidChance) {
        const closedWalls: (keyof Cell['walls'])[] = [];
        if (cell.walls.top) closedWalls.push('top');
        if (cell.walls.right) closedWalls.push('right');
        if (cell.walls.bottom) closedWalls.push('bottom');
        if (cell.walls.left) closedWalls.push('left');
        
        const wallToBreak = closedWalls[Math.floor(Math.random() * closedWalls.length)];
        const nx = cell.x + (wallToBreak === 'left' ? -1 : wallToBreak === 'right' ? 1 : 0);
        const ny = cell.y + (wallToBreak === 'top' ? -1 : wallToBreak === 'bottom' ? 1 : 0);
        
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx].isInside) {
          cell.walls[wallToBreak] = false;
          const opp = wallToBreak === 'top' ? 'bottom' : wallToBreak === 'bottom' ? 'top' : wallToBreak === 'left' ? 'right' : 'left';
          grid[ny][nx].walls[opp] = false;
        }
      }
    });
  }

  const validCells = grid.flat().filter(c => c.isInside);
  const start = validCells[0];
  let end = validCells[validCells.length - 1];
  let maxDist = 0;

  validCells.forEach(c => {
    const d = Math.sqrt(Math.pow(c.x - start.x, 2) + Math.pow(c.y - start.y, 2));
    if (d > maxDist) {
      maxDist = d;
      end = c;
    }
  });

  const solution = findSolution(grid, start, end);
  return { grid, start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y }, solution };
};

const findSolution = (grid: Cell[][], start: Point, end: Point): Point[] => {
  const queue: { point: Point; path: Point[] }[] = [{ point: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { point, path } = queue.shift()!;
    if (point.x === end.x && point.y === end.y) return path;

    const current = grid[point.y][point.x];
    const dirs: { x: number; y: number; wall: keyof Cell['walls'] }[] = [
      { x: 0, y: -1, wall: 'top' },
      { x: 1, y: 0, wall: 'right' },
      { x: 0, y: 1, wall: 'bottom' },
      { x: -1, y: 0, wall: 'left' }
    ];

    for (const d of dirs) {
      if (!current.walls[d.wall]) {
        const nx = point.x + d.x;
        const ny = point.y + d.y;
        const key = `${nx},${ny}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ point: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
        }
      }
    }
  }
  return [];
};
