import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig, GeneratorType, Difficulty, MazeShape, MazeTheme, ThemeId, GeneratedPuzzle, Point, PdfPageSize, PdfOrientation, PdfFont, PdfBorderStyle } from './types';
import { generatePuzzle } from './services/puzzleLogic';
import { generateMazeStory } from './services/geminiService';
import { jsPDF } from 'jspdf';

const GENERATORS: { id: GeneratorType; label: string; icon: string; category: string }[] = [
  { id: 'maze', label: 'Classic Maze', icon: 'fa-route', category: 'Labyrinths' },
  { id: 'maze2', label: 'Shaped Maze', icon: 'fa-shapes', category: 'Labyrinths' },
  { id: 'sudoku', label: 'Sudoku', icon: 'fa-table-cells', category: 'Logic' },
  { id: 'kenken', label: 'KenKen', icon: 'fa-calculator', category: 'Logic' },
  { id: 'kakuro', label: 'Kakuro', icon: 'fa-border-all', category: 'Logic' },
  { id: 'magicsquare', label: 'Magic Square', icon: 'fa-wand-sparkles', category: 'Logic' },
  { id: 'starbattle', label: 'Star Battle', icon: 'fa-star-half-stroke', category: 'Logic' },
  { id: 'bridges', label: 'Bridges / Hashi', icon: 'fa-bridge', category: 'Node' },
  { id: 'wordsearch', label: 'Word Search', icon: 'fa-magnifying-glass', category: 'Word' },
  { id: 'wordscramble', label: 'Scramble', icon: 'fa-shuffle', category: 'Word' },
  { id: 'crossword', label: 'Crossword', icon: 'fa-keyboard', category: 'Word' },
  { id: 'cryptogram', label: 'Cryptogram', icon: 'fa-key', category: 'Word' },
  { id: 'twistedword', label: 'Twisted Word', icon: 'fa-wind', category: 'Word' },
  { id: 'bingo', label: 'Bingo', icon: 'fa-circle-dot', category: 'Games' },
  { id: 'tartan', label: 'Tartan Pattern', icon: 'fa-barcode', category: 'Art' },
  { id: 'bauhaus', label: 'Bauhaus Art', icon: 'fa-palette', category: 'Art' },
];

const MAZE_THEMES: MazeTheme[] = [
  { id: 'classic', name: 'Classic', bgColor: '#f8fafc', wallColor: '#334155', pathColor: '#ef4444', startColor: '#22c55e', endColor: '#3b82f6', icon: 'fa-monument' },
  { id: 'cartoon', name: 'Kid Zone', bgColor: '#fffcf0', wallColor: '#f43f5e', pathColor: '#0ea5e9', startColor: '#fbbf24', endColor: '#8b5cf6', icon: 'fa-face-smile-beam' },
  { id: 'cyberpunk', name: 'Cyber', bgColor: '#000000', wallColor: '#06b6d4', pathColor: '#f472b6', startColor: '#4ade80', endColor: '#fbbf24', icon: 'fa-microchip' },
  { id: 'parchment', name: 'Ancient', bgColor: '#fdf6e3', wallColor: '#586e75', pathColor: '#268bd2', startColor: '#d33682', endColor: '#859900', icon: 'fa-scroll' },
  { id: 'nightmare', name: 'Dark', bgColor: '#0f172a', wallColor: '#f43f5e', pathColor: '#f8fafc', startColor: '#a855f7', endColor: '#ffffff', icon: 'fa-ghost' },
  { id: 'enchanted', name: 'Enchanted', bgColor: '#ecfdf5', wallColor: '#065f46', pathColor: '#d97706', startColor: '#10b981', endColor: '#f59e0b', icon: 'fa-tree' },
  { id: 'ocean', name: 'Ocean', bgColor: '#f0f9ff', wallColor: '#075985', pathColor: '#2dd4bf', startColor: '#0ea5e9', endColor: '#ffffff', icon: 'fa-water' },
  { id: 'sunset', name: 'Sunset', bgColor: '#fff7ed', wallColor: '#9a3412', pathColor: '#7c3aed', startColor: '#f97316', endColor: '#6366f1', icon: 'fa-cloud-sun' },
  { id: 'candy', name: 'Candy', bgColor: '#fff1f2', wallColor: '#be123c', pathColor: '#fb7185', startColor: '#f43f5e', endColor: '#ec4899', icon: 'fa-candy-cane' },
];

const PRINT_READY_THEME: MazeTheme = {
  id: 'classic',
  name: 'Print Ready',
  bgColor: '#ffffff',
  wallColor: '#000000',
  pathColor: '#555555',
  startColor: '#000000',
  endColor: '#000000',
  icon: 'fa-print'
};

const SHAPES: { id: MazeShape; icon: string }[] = [
  { id: 'square', icon: 'fa-square' }, 
  { id: 'circle', icon: 'fa-circle' }, 
  { id: 'triangle', icon: 'fa-caret-up' },
  { id: 'diamond', icon: 'fa-diamond' },
  { id: 'star', icon: 'fa-star' },
  { id: 'heart', icon: 'fa-heart' }, 
  { id: 'moon', icon: 'fa-moon' }, 
  { id: 'arrow', icon: 'fa-arrow-up' },
  { id: 'hexagon', icon: 'fa-hexagon' },
  { id: 'clover', icon: 'fa-clover' },
  { id: 'shield', icon: 'fa-shield-halved' },
  { id: 'bolt', icon: 'fa-bolt' },
  { id: 'donut', icon: 'fa-circle-dot' },
  { id: 'cross', icon: 'fa-plus' },
];

const BORDER_STYLES: { id: PdfBorderStyle; icon: string; label: string }[] = [
  { id: 'none', icon: 'fa-slash', label: 'No Border' },
  { id: 'modern', icon: 'fa-square', label: 'Modern' },
  { id: 'playful', icon: 'fa-shapes', label: 'Playful' },
  { id: 'dashed', icon: 'fa-grip-lines', label: 'Dashed' },
  { id: 'dotted', icon: 'fa-ellipsis', label: 'Dotted' },
  { id: 'double', icon: 'fa-equals', label: 'Double' },
  { id: 'wavy', icon: 'fa-wave-square', label: 'Wavy' },
  { id: 'stars', icon: 'fa-star', label: 'Stars' },
  { id: 'floral', icon: 'fa-leaf', label: 'Floral' },
];

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    generatorType: 'maze', size: 20, cellSize: 25, difficulty: 'medium', shape: 'square', themeId: 'cartoon', seed: 'PUZZLE',
    showSolution: false, showMarks: true, wallThickness: 2, pathThickness: 3,
    pdfHeader: 'PUZZLESPRINTS COLLECTION', pdfFooter: 'https://puzzlesprints.etsy.com/', pdfCredits: '© 2025 PUZZLESPRINTS',
    pdfPageSize: 'a4', pdfOrientation: 'portrait', pdfFont: 'helvetica', pdfMargin: 15, pdfShowDecorativeLines: true,
    pdfBorderStyle: 'playful', pdfAccentColor: '#f43f5e', pdfRuleColor: '#e2e8f0', pdfRuleThickness: 0.3, pdfLogoBase64: null, pdfWatermarkText: '',
    showSignatureFields: true, signatureLabel1: 'COMPLETED BY', signatureLabel2: 'DATE',
    bulkCount: 5, randomizeShapes: true, enableProgression: true, randomizeGenerators: false,
    words: ['MAZE', 'PUZZLE', 'LOGIC', 'QUEST', 'SOLVE', 'EXPLORE', 'KINDNESS', 'WISDOM'],
    wordSearchDirections: ['E', 'S'], wordSearchOverlap: true, wordScrambleCount: 5,
    sudokuSize: 9, sudokuSymmetry: true, kenKenSize: 4, kenKenOps: ['+', '-'],
    magicSquareSize: 3, starBattleSize: 8, starBattleStars: 1, kakuroDensity: 0.3,
    mazeBraidChance: 0.1, cryptogramSource: "SUCCESS IS THE RESULT OF PREPARATION AND HARD WORK",
    twistedWordBending: true, crosswordDensity: 0.4, bridgesIslandCount: 10, bridgesMaxBridges: 3,
    bingoGridSize: 5, bingoCardCount: 1, tartanStripeCount: 8, tartanComplexity: 5,
    bauhausShapeCount: 15, bauhausStyle: 'modern', gridSize: 15
  });

  const [isInkSaver, setIsInkSaver] = useState(true);
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'puzzle' | 'solution'>('puzzle');
  const [progress, setProgress] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const currentTheme = isInkSaver && currentView === 'puzzle' 
    ? PRINT_READY_THEME 
    : (MAZE_THEMES.find(t => t.id === config.themeId) || MAZE_THEMES[0]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = generatePuzzle(config);
      const storyText = await generateMazeStory(config);
      setPuzzle({ ...data, story: storyText } as GeneratedPuzzle);
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  useEffect(() => { 
    handleGenerate(); 
  }, [handleGenerate]);

  const drawToCanvas = useCallback((ctx: CanvasRenderingContext2D, p: GeneratedPuzzle, cfg: AppConfig, theme: MazeTheme, forceSolution: boolean, isForPrint: boolean = false) => {
    const scale = isForPrint ? 4 : 2; 
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const wallThickness = (cfg.wallThickness || 2) * scale;
    const pathThickness = (cfg.pathThickness || 3) * scale;

    if (p.type === 'maze' || p.type === 'maze2') {
      const cellSize = ctx.canvas.width / cfg.size;
      ctx.strokeStyle = theme.wallColor;
      ctx.lineWidth = wallThickness;
      ctx.lineCap = 'round';
      p.grid?.forEach((row: any) => row.forEach((cell: any) => {
        if (!cell.isInside) return;
        const x = cell.x * cellSize, y = cell.y * cellSize;
        if (cell.walls.top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
        if (cell.walls.right) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
        if (cell.walls.bottom) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
        if (cell.walls.left) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); ctx.stroke(); }
      }));
      if (cfg.showMarks && p.start && p.end) {
        ctx.font = `bold ${cellSize * 0.7}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.startColor; ctx.fillText('S', p.start.x * cellSize + cellSize/2, p.start.y * cellSize + cellSize/2);
        ctx.fillStyle = theme.endColor; ctx.fillText('E', p.end.x * cellSize + cellSize/2, p.end.y * cellSize + cellSize/2);
      }
      if (forceSolution && p.solution) {
        ctx.strokeStyle = theme.pathColor; ctx.lineWidth = pathThickness;
        ctx.beginPath();
        p.solution.forEach((pt: Point, i: number) => {
          const x = pt.x * cellSize + cellSize/2, y = pt.y * cellSize + cellSize/2;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    } else if (p.grid && Array.isArray(p.grid)) {
      const rows = p.grid.length, cols = p.grid[0].length, step = ctx.canvas.width / cols;
      ctx.strokeStyle = theme.wallColor; ctx.lineWidth = wallThickness;
      ctx.font = `bold ${step * (p.type === 'bingo' ? 0.4 : 0.5)}px Inter`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const gridData = forceSolution && p.solution ? p.solution : p.grid;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step, y = r * step;
          if (gridData[r][c] === '#') { ctx.fillStyle = theme.wallColor; ctx.fillRect(x, y, step, step); }
          else {
            ctx.strokeRect(x, y, step, step);
            if (gridData[r][c] !== '' && gridData[r][c] !== null) {
              ctx.fillStyle = theme.wallColor; ctx.fillText(gridData[r][c].toString(), x + step/2, y + step/2 + (scale * 2));
            }
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && puzzle) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = 1600;
        canvasRef.current.height = 1600;
        drawToCanvas(ctx, puzzle, config, currentTheme, currentView === 'solution');
      }
    }
  }, [puzzle, currentTheme, currentView, config, drawToCanvas]);

  const downloadPDFPackage = async () => {
    setIsGenerating(true);
    setProgress(0);
    const doc = new jsPDF({ orientation: config.pdfOrientation, unit: 'mm', format: config.pdfPageSize, compress: true });
    const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight(), margin = config.pdfMargin;
    const contentWidth = pw - (margin * 2);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 2400; tempCanvas.height = 2400;
    const tempCtx = tempCanvas.getContext('2d')!;

    const batch: GeneratedPuzzle[] = [];
    for (let i = 0; i < config.bulkCount; i++) {
        let diff = config.difficulty;
        let shape = config.shape;
        if (config.enableProgression) {
            const ratio = i / config.bulkCount;
            diff = ratio < 0.3 ? 'easy' : ratio < 0.6 ? 'medium' : 'hard';
        }
        if (config.randomizeShapes) {
          shape = SHAPES[Math.floor(Math.random() * SHAPES.length)].id;
        }
        const subConfig = { ...config, seed: `${config.seed}_${i}`, difficulty: diff, shape };
        const p = generatePuzzle(subConfig);
        batch.push({ ...p, story: '', config: subConfig } as GeneratedPuzzle);
        setProgress(Math.round(((i + 1) / (config.bulkCount * 2)) * 100));
    }

    const drawBorder = (doc: any, pw: number, ph: number, margin: number, style: PdfBorderStyle, color: string) => {
      const bx = margin / 2;
      const by = margin / 2;
      const bw = pw - margin;
      const bh = ph - margin;
      
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.setLineDash([]);

      if (style === 'modern') {
        doc.rect(bx, by, bw, bh);
      } else if (style === 'playful') {
        doc.setLineWidth(1.5);
        doc.roundedRect(bx, by, bw, bh, 5, 5);
        doc.setLineWidth(0.5);
        doc.roundedRect(bx + 1, by + 1, bw - 2, bh - 2, 4, 4);
      } else if (style === 'dashed') {
        doc.setLineDash([3, 3]);
        doc.rect(bx, by, bw, bh);
      } else if (style === 'dotted') {
        doc.setLineDash([1, 2]);
        doc.rect(bx, by, bw, bh);
      } else if (style === 'double') {
        doc.rect(bx, by, bw, bh);
        doc.rect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
      } else if (style === 'wavy') {
        const step = 5;
        const wave = 2;
        // Top
        for (let x = bx; x < bx + bw; x += step) {
          doc.line(x, by, x + step / 2, by - wave);
          doc.line(x + step / 2, by - wave, x + step, by);
        }
        // Bottom
        for (let x = bx; x < bx + bw; x += step) {
          doc.line(x, by + bh, x + step / 2, by + bh + wave);
          doc.line(x + step / 2, by + bh + wave, x + step, by + bh);
        }
        // Sides
        for (let y = by; y < by + bh; y += step) {
          doc.line(bx, y, bx - wave, y + step / 2);
          doc.line(bx - wave, y + step / 2, bx, y + step);
          doc.line(bx + bw, y, bx + bw + wave, y + step / 2);
          doc.line(bx + bw + wave, y + step / 2, bx + bw, y + step);
        }
      } else if (style === 'stars') {
        doc.setFontSize(10);
        const starStep = 8;
        for (let x = bx; x <= bx + bw; x += starStep) {
          doc.text('*', x, by + 1);
          doc.text('*', x, by + bh + 1);
        }
        for (let y = by + starStep; y < by + bh; y += starStep) {
          doc.text('*', bx, y + 1);
          doc.text('*', bx + bw - 1, y + 1);
        }
      } else if (style === 'floral') {
        doc.setFontSize(12);
        const leafStep = 15;
        for (let x = bx; x <= bx + bw; x += leafStep) {
          doc.text('~', x, by + 1);
          doc.text('~', x, by + bh + 1);
        }
        for (let y = by + leafStep; y < by + bh; y += leafStep) {
          doc.text('|', bx, y + 1);
          doc.text('|', bx + bw - 1, y + 1);
        }
      }
    };

    const drawPageDecor = (title: string, pNum: number, color: string, isSolution: boolean = false) => {
        if (config.pdfBorderStyle !== 'none') {
          drawBorder(doc, pw, ph, margin, config.pdfBorderStyle, color);
        }
        doc.setFont(config.pdfFont, 'bold');
        doc.setFontSize(9); doc.setTextColor('#94a3b8');
        doc.text(config.pdfHeader, pw / 2, margin + 5, { align: 'center' });
        doc.setFontSize(22); doc.setTextColor(color);
        doc.text(isSolution ? `${title} SOLUTION` : title, margin, margin + 20);
        doc.setFontSize(12); doc.text(`#${pNum}`, pw - margin, margin + 20, { align: 'right' });
        doc.setFontSize(7); doc.setTextColor('#94a3b8');
        doc.text(config.pdfFooter, pw / 2, ph - margin + 5, { align: 'center' });
    };

    const finalTheme = isInkSaver ? PRINT_READY_THEME : currentTheme;
    const finalAccent = isInkSaver ? '#000000' : config.pdfAccentColor;

    for (let i = 0; i < batch.length; i++) {
        if (i > 0) doc.addPage();
        const p = batch[i];
        drawPageDecor(`${p.type.toUpperCase()}`, i + 1, finalAccent);
        drawToCanvas(tempCtx, p, config, finalTheme, false, true);
        doc.addImage(tempCanvas.toDataURL('image/jpeg', 0.9), 'JPEG', margin, margin + 30, contentWidth, contentWidth);
    }

    for (let i = 0; i < batch.length; i++) {
        doc.addPage();
        const p = batch[i];
        drawPageDecor(`${p.type.toUpperCase()}`, i + 1, '#10b981', true);
        drawToCanvas(tempCtx, p, config, finalTheme, true, true);
        doc.addImage(tempCanvas.toDataURL('image/jpeg', 0.9), 'JPEG', margin, margin + 30, contentWidth, contentWidth);
        setProgress(50 + Math.round(((i + 1) / (batch.length * 2)) * 100));
    }

    doc.save(`puzzlesprints-bundle-${Date.now()}.pdf`);
    setIsGenerating(false); setProgress(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0 border-r border-white/5 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl"><i className="fas fa-print"></i></div>
          <div><h1 className="font-black text-white text-lg leading-none tracking-tight">PUZZLES</h1><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">PRINTS</span></div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {['Labyrinths', 'Logic', 'Word', 'Games', 'Art'].map(cat => (
            <div key={cat}>
              <h3 className="px-3 text-[10px] font-black uppercase text-slate-600 mb-2">{cat}</h3>
              {GENERATORS.filter(g => g.category === cat).map(gen => (
                <button key={gen.id} onClick={() => setConfig({...config, generatorType: gen.id})} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${config.generatorType === gen.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                  <i className={`fas ${gen.icon} w-5`}></i> {gen.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between shadow-sm z-10">
          <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Mode</span><h2 className="text-xl font-bold capitalize">{config.generatorType}</h2></div>
          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
            {['puzzle', 'solution'].map(v => (
              <button key={v} onClick={() => setCurrentView(v as any)} className={`px-8 py-2.5 text-xs font-black rounded-xl transition-all ${currentView === v ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>{v.toUpperCase()}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase">Ink Saver</span>
                <button onClick={() => setIsInkSaver(!isInkSaver)} className={`w-12 h-6 rounded-full relative transition-all ${isInkSaver ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isInkSaver ? 'left-7' : 'left-1'}`} /></button>
            </div>
            <button onClick={handleGenerate} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-slate-800 shadow-xl transition-transform active:scale-95">REFRESH</button>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
          <div className="flex flex-col items-center py-12 gap-8 px-12">
            {isGenerating && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"><div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div><span className="font-black text-xs text-indigo-600 uppercase tracking-widest">AI Generating {progress ?? ''}%</span></div>}
            
            <div className="flex flex-col lg:flex-row gap-10 items-start w-full max-w-6xl">
              <div className="bg-white p-8 shadow-2xl rounded-3xl border flex-1 flex items-center justify-center overflow-hidden aspect-square">
                <canvas ref={canvasRef} className="max-w-full max-h-full rounded-xl shadow-lg border border-slate-100" />
              </div>
              <div className="lg:w-96 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
                  <h4 className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest">AI Puzzle Lore</h4>
                  <p className="text-lg font-medium text-slate-700 italic leading-relaxed">"{puzzle?.story || 'The story unfolds as you prepare to solve...'}"</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl space-y-4">
                  <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-widest border-b border-white/10 pb-4">Export Bundle</h3>
                  <div className="bg-white/5 p-4 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label><input type="number" min="1" max="50" value={config.bulkCount} onChange={e => setConfig({...config, bulkCount: parseInt(e.target.value) || 1})} className="w-16 bg-white/10 border-white/10 border rounded-lg px-2 py-1 text-right text-indigo-400 font-bold" /></div>
                    <div className="flex items-center gap-3 text-white"><input type="checkbox" id="progression" checked={config.enableProgression} onChange={e => setConfig({...config, enableProgression: e.target.checked})}/><label htmlFor="progression" className="text-xs font-bold text-slate-300">Smart Difficulty</label></div>
                    <div className="flex items-center gap-3 text-white"><input type="checkbox" id="varied" checked={config.randomizeShapes} onChange={e => setConfig({...config, randomizeShapes: e.target.checked})}/><label htmlFor="varied" className="text-xs font-bold text-slate-300">Varied Shapes</label></div>
                  </div>
                  <button onClick={downloadPDFPackage} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest">Download Bundle PDF</button>
                  <p className="text-[9px] text-center text-slate-500 font-bold tracking-widest uppercase">Answers Included at End</p>
                </div>
              </div>
            </div>

            <section className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-slate-100 p-10 space-y-12 mb-12">
              <div className="flex items-center justify-between border-b pb-6">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Puzzle Generation Settings</h3>
                 <div className="flex gap-4">
                   {['easy', 'medium', 'hard'].map(d => (
                     <button key={d} onClick={() => setConfig({...config, difficulty: d as Difficulty})} className={`px-6 py-2 text-[10px] font-black rounded-xl uppercase border transition-all ${config.difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{d}</button>
                   ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structure</h4>
                  {(config.generatorType === 'maze' || config.generatorType === 'maze2') && (
                    <>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-700">Complexity ({config.size})</label>
                        <input type="range" min="10" max="60" value={config.size} onChange={e => setConfig({...config, size: parseInt(e.target.value)})} className="w-full accent-indigo-600" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700">Boundary Shape</label>
                        <div className="grid grid-cols-5 gap-2">
                          {SHAPES.map(s => (
                            <button key={s.id} onClick={() => setConfig({...config, shape: s.id})} className={`p-3 rounded-xl border transition-all ${config.shape === s.id ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-300 hover:bg-slate-50'}`}><i className={`fas ${s.icon}`}></i></button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {config.generatorType === 'sudoku' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700">Sudoku Format</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[4, 9].map(sz => (
                          <button key={sz} onClick={() => setConfig({...config, sudokuSize: sz})} className={`py-3 text-xs font-black rounded-xl border ${config.sudokuSize === sz ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'border-slate-100'}`}>{sz}x{sz}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content</h4>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700">Seed String</label>
                    <input type="text" value={config.seed} onChange={e => setConfig({...config, seed: e.target.value})} className="w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600 uppercase" placeholder="RANDOM_SEED" />
                  </div>
                  {(config.generatorType === 'wordsearch' || config.generatorType === 'wordscramble') && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700">Vocabulary (CSV)</label>
                      <textarea value={config.words.join(', ')} onChange={e => setConfig({...config, words: e.target.value.split(',').map(w => w.trim())})} className="w-full h-32 text-xs p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aesthetics</h4>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700">PDF Page Border</label>
                      <div className="grid grid-cols-3 gap-2">
                        {BORDER_STYLES.map(b => (
                          <button key={b.id} onClick={() => setConfig({...config, pdfBorderStyle: b.id})} className={`p-2 rounded-xl border text-center transition-all ${config.pdfBorderStyle === b.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            <i className={`fas ${b.icon} block mb-1`}></i>
                            <span className="text-[8px] font-bold uppercase">{b.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700">Display Theme</label>
                      <div className="grid grid-cols-2 gap-4">
                        {MAZE_THEMES.map(t => (
                          <button key={t.id} onClick={() => { setConfig({...config, themeId: t.id}); setIsInkSaver(false); }} className={`p-4 rounded-2xl border-2 text-left transition-all ${config.themeId === t.id && !isInkSaver ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-50 hover:border-slate-100'}`}>
                            <div className="w-full h-8 rounded-lg mb-2 shadow-inner border border-black/5" style={{ backgroundColor: t.wallColor }} />
                            <span className="text-[10px] font-black uppercase text-slate-600 block">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-6 left-6 z-50 pointer-events-none">
        <div className="bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">© 2025 PuzzlesPrints Engine • v2.0 AI Optimized</span>
        </div>
      </footer>
    </div>
  );
};

export default App;