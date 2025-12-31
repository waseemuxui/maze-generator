
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig, GeneratorType, Difficulty, MazeShape, MazeTheme, ThemeId, GeneratedPuzzle, Point } from './types';
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
  { id: 'cyberpunk', name: 'Cyber', bgColor: '#000000', wallColor: '#06b6d4', pathColor: '#f472b6', startColor: '#4ade80', endColor: '#fbbf24', icon: 'fa-microchip' },
  { id: 'parchment', name: 'Ancient', bgColor: '#fdf6e3', wallColor: '#586e75', pathColor: '#268bd2', startColor: '#d33682', endColor: '#859900', icon: 'fa-scroll' },
  { id: 'nightmare', name: 'Dark', bgColor: '#0f172a', wallColor: '#f43f5e', pathColor: '#f8fafc', startColor: '#a855f7', endColor: '#ffffff', icon: 'fa-ghost' },
];

const SHAPES: { id: MazeShape; icon: string }[] = [
  { id: 'square', icon: 'fa-square' }, { id: 'circle', icon: 'fa-circle' }, { id: 'star', icon: 'fa-star' },
  { id: 'heart', icon: 'fa-heart' }, { id: 'moon', icon: 'fa-moon' }, { id: 'arrow', icon: 'fa-arrow-up' },
];

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    generatorType: 'maze', size: 20, cellSize: 25, difficulty: 'medium', shape: 'square', themeId: 'classic', seed: 'ABC',
    showSolution: false, showMarks: true, wallThickness: 2, pathThickness: 3,
    pdfHeader: 'ARCHITECT PRO CHALLENGE', pdfFooter: 'WWW.PUZZLEPRO.IO', pdfCredits: '© 2025 ARCHITECT AI',
    showSignatureFields: true, bulkCount: 1, randomizeShapes: true, randomizeDifficulty: true, randomizeGenerators: false,
    words: [], gridSize: 15
  });

  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'puzzle' | 'solution'>('puzzle');
  const [progress, setProgress] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentTheme = MAZE_THEMES.find(t => t.id === config.themeId) || MAZE_THEMES[0];

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const data = generatePuzzle(config);
    const storyText = await generateMazeStory(config);
    setPuzzle({ ...data, story: storyText } as GeneratedPuzzle);
    setIsGenerating(false);
  }, [config]);

  useEffect(() => { handleGenerate(); }, [config.generatorType, config.shape, config.difficulty, config.size]);

  const drawToCanvas = (ctx: CanvasRenderingContext2D, p: GeneratedPuzzle, cfg: AppConfig, theme: MazeTheme, forceSolution: boolean) => {
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (p.type === 'maze' || p.type === 'maze2') {
      const cellSize = ctx.canvas.width / cfg.size;
      ctx.strokeStyle = theme.wallColor;
      ctx.lineWidth = cfg.wallThickness;
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
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.startColor;
        ctx.fillText('S', p.start.x * cellSize + cellSize/2, p.start.y * cellSize + cellSize/2);
        ctx.fillStyle = theme.endColor;
        ctx.fillText('E', p.end.x * cellSize + cellSize/2, p.end.y * cellSize + cellSize/2);
      }

      if (forceSolution && p.solution) {
        ctx.strokeStyle = theme.pathColor;
        ctx.lineWidth = cfg.pathThickness;
        ctx.beginPath();
        p.solution.forEach((pt: Point, i: number) => {
          const x = pt.x * cellSize + cellSize/2;
          const y = pt.y * cellSize + cellSize/2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    } else if (p.type === 'wordscramble') {
      ctx.fillStyle = theme.wallColor;
      ctx.font = 'bold 20px JetBrains Mono';
      ctx.textAlign = 'left';
      p.grid.forEach((w: any, idx: number) => {
        const y = 80 + (idx * 40);
        ctx.fillText(`${idx + 1}. ${w.scrambled}`, 100, y);
        if (forceSolution) {
          ctx.fillStyle = theme.pathColor;
          ctx.fillText(`→ ${w.original}`, 350, y);
          ctx.fillStyle = theme.wallColor;
        } else {
           ctx.setLineDash([5, 5]);
           ctx.strokeRect(340, y - 20, 200, 30);
           ctx.setLineDash([]);
        }
      });
    } else if (p.type === 'cryptogram') {
      ctx.fillStyle = theme.wallColor;
      ctx.font = '22px JetBrains Mono';
      ctx.textAlign = 'center';
      const text = forceSolution ? p.grid.original : p.grid.encoded;
      const lines = text.match(/.{1,30}/g) || [];
      lines.forEach((line: string, i: number) => {
        ctx.fillText(line, ctx.canvas.width / 2, (ctx.canvas.height / 2) - (lines.length * 15) + (i * 50));
      });
    } else if (p.type === 'bauhaus' && p.renderData) {
      p.renderData.forEach((s: any) => {
        ctx.fillStyle = s.color;
        const x = (s.x / 100) * ctx.canvas.width;
        const y = (s.y / 100) * ctx.canvas.height;
        ctx.beginPath();
        if (s.type === 'circle') ctx.arc(x, y, s.size, 0, Math.PI * 2);
        else if (s.type === 'rect') ctx.rect(x - s.size / 2, y - s.size / 2, s.size, s.size);
        else {
          ctx.moveTo(x, y - s.size);
          ctx.lineTo(x + s.size, y + s.size);
          ctx.lineTo(x - s.size, y + s.size);
          ctx.closePath();
        }
        ctx.fill();
      });
    } else if (p.type === 'tartan' && p.renderData) {
      let offset = 0;
      p.renderData.forEach((s: any) => {
        ctx.fillStyle = s.color;
        ctx.fillRect(offset, 0, s.width, ctx.canvas.height);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, offset, ctx.canvas.width, s.width);
        ctx.globalAlpha = 1.0;
        offset += s.width;
      });
    } else if (p.grid && Array.isArray(p.grid) && p.grid.length > 0 && Array.isArray(p.grid[0])) {
      const rows = p.grid.length;
      const cols = p.grid[0].length;
      const step = ctx.canvas.width / cols;
      ctx.strokeStyle = theme.wallColor;
      ctx.lineWidth = 1;
      ctx.font = `bold ${step * 0.5}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const gridData = forceSolution && p.solution ? p.solution : p.grid;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step, y = r * step;
          if (gridData[r][c] === '#') {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, y, step, step);
          } else {
            ctx.strokeRect(x, y, step, step);
            if (gridData[r][c] !== null && gridData[r][c] !== '') {
              ctx.fillStyle = theme.wallColor;
              ctx.fillText(gridData[r][c].toString(), x + step/2, y + step/2);
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!puzzle || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = 800;
    canvasRef.current.height = 800;
    drawToCanvas(ctx, puzzle, config, currentTheme, currentView === 'solution');
  }, [puzzle, config, currentTheme, currentView]);

  const downloadImage = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `puzzle-${Date.now()}.${format}`;
    link.href = canvasRef.current.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    setProgress(0);
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 20;
    const canvasSize = width - margin * 2;
    
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 1600;
    offCanvas.height = 1600;
    const offCtx = offCanvas.getContext('2d')!;

    const batchPuzzles: GeneratedPuzzle[] = [];
    
    for (let i = 0; i < config.bulkCount; i++) {
      const batchConfig = { ...config, seed: `${config.seed}-${i}-${Math.random()}` };
      const p = generatePuzzle(batchConfig);
      batchPuzzles.push({ ...p, story: await generateMazeStory(batchConfig) } as GeneratedPuzzle);
      setProgress(Math.round(((i + 1) / (config.bulkCount * 2)) * 100));
    }

    for (let i = 0; i < batchPuzzles.length; i++) {
      if (i > 0) doc.addPage();
      const p = batchPuzzles[i];
      
      // Branding: Header
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(config.pdfHeader, width/2, 12, { align: 'center' });
      
      // Title
      doc.setFontSize(22); doc.setTextColor(30);
      doc.text(`${p.type.toUpperCase()} CHALLENGE #${i+1}`, margin, 30);
      
      // Main Puzzle Content
      drawToCanvas(offCtx, p, config, currentTheme, false);
      doc.addImage(offCanvas.toDataURL('image/png'), 'PNG', margin, 40, canvasSize, canvasSize);
      
      // Branding: Credits & Footer
      doc.setFontSize(9); doc.setTextColor(100);
      doc.text(config.pdfCredits, width/2, height - 18, { align: 'center' });
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(config.pdfFooter, width/2, height - 10, { align: 'center' });

      if (config.showSignatureFields) {
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text("Explorer Name: _______________________", margin, height - 30);
        doc.text("Date: ___________", width - margin - 40, height - 30);
      }
      
      setProgress(50 + Math.round(((i + 1) / (batchPuzzles.length * 2)) * 100));
    }

    // Solutions Section
    doc.addPage();
    doc.setFontSize(24); doc.setTextColor(30);
    doc.text("SOLUTIONS HANDBOOK", width/2, height/2, { align: 'center' });
    
    for (let i = 0; i < batchPuzzles.length; i++) {
      doc.addPage();
      const p = batchPuzzles[i];
      doc.setFontSize(14); doc.setTextColor(30);
      doc.text(`Solution for Puzzle #${i+1}`, margin, 20);
      
      drawToCanvas(offCtx, p, config, currentTheme, true);
      doc.addImage(offCanvas.toDataURL('image/png'), 'PNG', margin, 30, canvasSize, canvasSize);
      
      // Credits & Footer on solution page too
      doc.setFontSize(9); doc.setTextColor(120);
      doc.text(config.pdfCredits, width/2, height - 18, { align: 'center' });
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(config.pdfFooter, width/2, height - 10, { align: 'center' });
    }

    doc.save(`puzzle-collection-${Date.now()}.pdf`);
    setIsGenerating(false);
    setProgress(null);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0 border-r border-white/5">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><i className="fas fa-layer-group text-xl"></i></div>
          <div>
            <h1 className="font-black text-white tracking-tighter text-lg leading-none">ARCHITECT</h1>
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Studio Pro</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {['Labyrinths', 'Logic', 'Word', 'Games', 'Art'].map(cat => (
            <div key={cat} className="space-y-1">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{cat}</h3>
              {GENERATORS.filter(g => g.category === cat).map(gen => (
                <button 
                  key={gen.id} 
                  onClick={() => setConfig({...config, generatorType: gen.id})}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${config.generatorType === gen.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <i className={`fas ${gen.icon} w-5 text-center`}></i> {gen.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm z-10 relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Workspace</span>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 capitalize">
               {config.generatorType.replace('2', ' shaped')} Studio
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setCurrentView('puzzle')} className={`px-8 py-2.5 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${currentView === 'puzzle' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <i className="fas fa-eye"></i> CHALLENGE
            </button>
            <button onClick={() => setCurrentView('solution')} className={`px-8 py-2.5 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${currentView === 'solution' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <i className="fas fa-key"></i> SOLUTION
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="h-10 w-px bg-slate-200 mx-2"></div>
             <button onClick={handleGenerate} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group">
               <i className={`fas fa-sync-alt transition-transform duration-500 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180'}`}></i> REGENERATE
             </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-12 overflow-y-auto bg-slate-50 flex flex-col items-center gap-8 relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-indigo-600">{progress ?? 0}%</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-slate-900 font-black uppercase tracking-[0.3em] text-sm">Forging Masterpiece</span>
                  <span className="text-slate-400 text-xs font-bold mt-1 max-w-[200px]">Computing paths and assembling bundle...</span>
                </div>
              </div>
            )}
            
            <div className="bg-white p-16 shadow-[0_30px_100px_-10px_rgba(0,0,0,0.15)] rounded-lg border border-slate-200 relative max-w-[750px] w-full aspect-square flex items-center justify-center transform transition-transform duration-500 hover:scale-[1.01]">
              <div className="absolute top-6 left-10 flex flex-col">
                <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">{config.pdfHeader}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Edition #{(config.seed.length % 999) + 1} • {config.difficulty} Mode</span>
              </div>
              <canvas ref={canvasRef} className="max-w-full max-h-full h-auto w-auto" />
              <div className="absolute bottom-6 right-10 flex items-center gap-4">
                 <div className="text-right">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{config.pdfFooter}</div>
                    <div className="h-6 w-32 border-b-2 border-slate-100 italic text-[10px] text-slate-300 mt-1 pl-2">{config.pdfCredits}</div>
                 </div>
              </div>
            </div>

            <div className="w-full max-w-[750px] bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl flex items-start gap-6 border-4 border-white">
               <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/20"><i className="fas fa-feather-pointed text-2xl text-indigo-300"></i></div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Procedural Lore Engine</h4>
                    <div className="h-px flex-1 bg-indigo-500/30"></div>
                  </div>
                  <p className="text-lg font-medium leading-relaxed tracking-tight text-slate-100">{puzzle?.story}</p>
               </div>
            </div>
          </div>

          <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-8 space-y-10 shadow-2xl z-10">
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] border-b pb-4">Configuration</h3>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Difficulty</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                  {['easy', 'medium', 'hard'].map(d => (
                    <button key={d} onClick={() => setConfig({...config, difficulty: d as Difficulty})} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all duration-300 ${config.difficulty === d ? 'bg-white shadow-xl text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Complexity Scale</span>
                  <span className="text-indigo-600 font-black">{config.size}x{config.size}</span>
                </div>
                <input type="range" min="10" max="60" step="5" value={config.size} onChange={e => setConfig({...config, size: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 appearance-none rounded-lg accent-indigo-600 cursor-pointer" />
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] border-b pb-4 flex items-center justify-between">
                <span>Branding</span>
                <i className="fas fa-fingerprint text-indigo-500"></i>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'PDF Header', key: 'pdfHeader', icon: 'fa-heading' },
                  { label: 'PDF Footer', key: 'pdfFooter', icon: 'fa-shoe-prints' },
                  { label: 'PDF Credits / Copyright', key: 'pdfCredits', icon: 'fa-copyright' }
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <i className={`fas ${field.icon} text-[8px]`}></i> {field.label}
                    </span>
                    <input 
                      type="text" 
                      value={(config as any)[field.key]} 
                      onChange={e => setConfig({...config, [field.key]: e.target.value} as any)}
                      placeholder={`Enter ${field.label}...`}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all" 
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                   <input 
                    type="checkbox" 
                    id="sigToggle"
                    checked={config.showSignatureFields} 
                    onChange={e => setConfig({...config, showSignatureFields: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                   />
                   <label htmlFor="sigToggle" className="text-[10px] font-black text-slate-500 uppercase cursor-pointer">Include Explorer Fields</label>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] border-b pb-4">Bulk Production</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Puzzles per Bundle</span>
                  <span className="text-emerald-600 font-black">{config.bulkCount} Units</span>
                </div>
                <input type="range" min="1" max="50" step="1" value={config.bulkCount} onChange={e => setConfig({...config, bulkCount: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 appearance-none rounded-lg accent-emerald-500 cursor-pointer" />
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] border-b pb-4">Theme Engine</h3>
              <div className="grid grid-cols-2 gap-4">
                {MAZE_THEMES.map(t => (
                  <button key={t.id} onClick={() => setConfig({...config, themeId: t.id})} className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${config.themeId === t.id ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'border-slate-50 hover:border-slate-200'}`}>
                    <div className="w-full h-12 rounded-xl shadow-inner flex items-center justify-center" style={{ backgroundColor: t.wallColor }}>
                       <i className={`fas ${t.icon} text-white/30 text-xl`}></i>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${config.themeId === t.id ? 'text-indigo-700' : 'text-slate-500'}`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-4 pb-8">
               <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em]">Export Formats</h3>
               <div className="grid grid-cols-1 gap-3">
                  <button onClick={downloadPDF} className="w-full flex items-center justify-between px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                    <div className="flex items-center gap-3"><i className="fas fa-file-pdf text-lg"></i> PDF BUNDLE</div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[9px]">{config.bulkCount}x</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => downloadImage('png')} className="flex items-center justify-center gap-3 px-4 py-4 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black hover:bg-slate-200 transition-all">
                      <i className="fas fa-file-image"></i> PNG
                    </button>
                    <button onClick={() => downloadImage('jpeg')} className="flex items-center justify-center gap-3 px-4 py-4 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black hover:bg-slate-200 transition-all">
                      <i className="fas fa-file-image"></i> JPEG
                    </button>
                  </div>
               </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
