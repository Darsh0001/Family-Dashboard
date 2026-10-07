import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QuickNote, FamilyMember } from '../types/dashboard';
import {
  PenTool,
  StickyNote,
  Trash2,
  Plus,
  Eraser,
  RotateCcw,
  Pin,
  Clock,
  Sparkles,
  Check,
  X,
  Palette,
} from 'lucide-react';

interface QuickNotesSectionProps {
  notes: QuickNote[];
  familyMembers: FamilyMember[];
  onAddNote: (note: Omit<QuickNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const QuickNotesSection: React.FC<QuickNotesSectionProps> = ({
  notes,
  familyMembers,
  onAddNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [activeMode, setActiveMode] = useState<'canvas' | 'sticky'>('canvas');

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#fbbf24'); // amber-400
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const strokeHistoryRef = useRef<ImageData[]>([]);

  // Text Note State
  const [showAddTextForm, setShowAddTextForm] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('bg-amber-950/40 border-amber-500/50 text-amber-100');

  const CANVAS_STORAGE_KEY = 'kitchen_dashboard_live_scribble';

  // Available pen colors
  const penColors = [
    { label: 'Amber', hex: '#fbbf24', bg: 'bg-amber-400' },
    { label: 'White', hex: '#f8fafc', bg: 'bg-stone-100' },
    { label: 'Sky', hex: '#38bdf8', bg: 'bg-sky-400' },
    { label: 'Rose', hex: '#fb7185', bg: 'bg-rose-400' },
    { label: 'Lime', hex: '#a3e635', bg: 'bg-lime-400' },
  ];

  // Quick preset kitchen phrases
  const quickPhrases = [
    'Back in 20 mins!',
    'Dinner is in the fridge 🍲',
    'Don\'t eat the cake in the red dish!',
    'Turned off the stove & oven ✅',
    'Gone for a quick walk 🐕',
    'Pick up milk & bread on way home!',
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load saved scribble from localStorage if available
    const savedDataUrl = localStorage.getItem(CANVAS_STORAGE_KEY);
    if (savedDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedDataUrl;
    }
  }, []);

  const saveCanvasToStorage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem(CANVAS_STORAGE_KEY, dataUrl);
    } catch {
      // ignore
    }
  }, []);

  // Canvas drawing coordinate helper
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot for undo
    if (strokeHistoryRef.current.length >= 10) {
      strokeHistoryRef.current.shift();
    }
    strokeHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? 18 : penWidth;
    ctx.strokeStyle = isEraser ? '#161922' : penColor;

    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasToStorage();
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(CANVAS_STORAGE_KEY);
    strokeHistoryRef.current = [];
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastState = strokeHistoryRef.current.pop();
    if (lastState) {
      ctx.putImageData(lastState, 0, 0);
      saveCanvasToStorage();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveCanvasToStorage();
    }
  };

  const handleSaveDoodleAsNote = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onAddNote({
      drawingDataUrl: dataUrl,
      authorId: selectedAuthorId,
      color: 'bg-stone-900/80 border-stone-700 text-stone-100',
      pinned: true,
    });
  };

  const handleCreateTextNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    onAddNote({
      text: newNoteText.trim(),
      authorId: selectedAuthorId,
      color: selectedColor,
      pinned: false,
    });

    setNewNoteText('');
    setShowAddTextForm(false);
  };

  const getMember = (id: string) => {
    return familyMembers.find((m) => m.id === id) || familyMembers[0];
  };

  const formatNoteTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="kitchen-panel rounded-2xl p-3 sm:p-4 flex flex-col h-full space-y-3">
      {/* Top Header & Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-stone-100">
            Kitchen Scratchpad
          </h2>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-900/80 p-0.5 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              activeMode === 'canvas'
                ? 'bg-stone-800 text-amber-300 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Finger Scribble</span>
          </button>
          <button
            onClick={() => setActiveMode('sticky')}
            className={`touch-btn px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              activeMode === 'sticky'
                ? 'bg-stone-800 text-amber-300 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Sticky Memos ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* Mode A: Finger Scribble Canvas Area */}
      {activeMode === 'canvas' && (
        <div className="flex flex-col flex-1 space-y-2">
          {/* Canvas Toolbar with Touch Hitboxes */}
          <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
            {/* Pen Colors */}
            <div className="flex items-center gap-1.5 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
              {penColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setPenColor(c.hex);
                    setIsEraser(false);
                  }}
                  className={`touch-btn min-h-[32px] min-w-[32px] rounded-lg flex items-center justify-center transition-all ${
                    !isEraser && penColor === c.hex
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  <span className={`w-4 h-4 rounded-full ${c.bg} shadow-sm`} />
                </button>
              ))}

              <div className="w-[1px] h-5 bg-stone-800 mx-0.5" />

              {/* Eraser */}
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`touch-btn min-h-[32px] px-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  isEraser
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
            </div>

            {/* Stroke Thickness & Actions */}
            <div className="flex items-center gap-1">
              {/* Width Selector */}
              <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
                {[2, 4, 7].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setPenWidth(w);
                      setIsEraser(false);
                    }}
                    className={`touch-btn min-h-[32px] min-w-[28px] rounded-lg text-xs font-bold flex items-center justify-center ${
                      !isEraser && penWidth === w
                        ? 'bg-stone-800 text-amber-300'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <span
                      className="rounded-full bg-stone-300"
                      style={{ width: `${w * 1.5}px`, height: `${w * 1.5}px` }}
                    />
                  </button>
                ))}
              </div>

              {/* Undo */}
              <button
                onClick={handleUndo}
                className="touch-btn min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200"
                title="Undo last stroke"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Clear */}
              <button
                onClick={handleClearCanvas}
                className="touch-btn min-h-[36px] px-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1"
                title="Clear whiteboard"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Interactive Drawing Board (Appliance Whiteboard surface) */}
          <div className="relative flex-1 w-full min-h-[260px] rounded-xl overflow-hidden border-2 border-stone-800 bg-[#141720] shadow-inner touch-none">
            {/* Subtle background grid pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <canvas
              ref={canvasRef}
              width={540}
              height={320}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="relative w-full h-full cursor-crosshair touch-none"
            />
          </div>

          {/* Bottom helper & Pin-to-board action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-500">
              Scribble stays on kitchen screen automatically
            </span>

            <button
              onClick={handleSaveDoodleAsNote}
              className="touch-btn min-h-[36px] px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              <span>Pin Scribble to Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode B: Sticky Memos Board */}
      {activeMode === 'sticky' && (
        <div className="flex flex-col flex-1 space-y-3">
          {/* Quick Preset Kitchen Phrase Chips */}
          <div className="overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5">
              {quickPhrases.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => {
                    onAddNote({
                      text: phrase,
                      authorId: selectedAuthorId,
                      color: selectedColor,
                      pinned: false,
                    });
                  }}
                  className="touch-btn min-h-[34px] px-2.5 py-1 text-xs rounded-lg bg-stone-900/90 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-300 shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>{phrase}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Text Note Drawer / Form */}
          {showAddTextForm ? (
            <form onSubmit={handleCreateTextNote} className="p-3 rounded-xl bg-stone-800/95 border border-stone-700 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Leave a Kitchen Note</span>
                <button
                  type="button"
                  onClick={() => setShowAddTextForm(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write a message for the family..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none resize-none"
                autoFocus
              />

              <div className="flex items-center justify-between gap-2">
                {/* Author selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400">From:</span>
                  <select
                    value={selectedAuthorId}
                    onChange={(e) => setSelectedAuthorId(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color choices */}
                <div className="flex items-center gap-1">
                  {[
                    { color: 'bg-amber-950/40 border-amber-500/50 text-amber-100', dot: 'bg-amber-400' },
                    { color: 'bg-sky-950/40 border-sky-500/50 text-sky-100', dot: 'bg-sky-400' },
                    { color: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100', dot: 'bg-emerald-400' },
                    { color: 'bg-rose-950/40 border-rose-500/50 text-rose-100', dot: 'bg-rose-400' },
                  ].map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        selectedColor === c.color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.dot}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="touch-btn flex-1 min-h-[44px] py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                >
                  Post Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTextForm(false)}
                  className="touch-btn px-3 min-h-[44px] py-2 rounded-xl bg-stone-700 text-stone-300 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddTextForm(true)}
              className="touch-btn w-full min-h-[44px] py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Write a New Sticky Memo</span>
            </button>
          )}

          {/* Sticky Notes Grid / List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5 max-h-[340px]">
            {notes.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <StickyNote className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                <p className="text-sm font-semibold">No notes on the fridge</p>
                <p className="text-xs text-stone-500 mt-0.5">Leave a quick memo for family members</p>
              </div>
            ) : (
              notes.map((note) => {
                const author = getMember(note.authorId);
                return (
                  <div
                    key={note.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 shadow-sm relative transition-all ${note.color}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${author.color}`} />
                        <span className="text-xs font-bold text-stone-200">{author.name}</span>
                        <span className="text-[10px] text-stone-400 font-medium">· {formatNoteTime(note.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onTogglePin(note.id)}
                          className={`touch-btn p-1.5 rounded-lg transition-colors ${
                            note.pinned ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                          }`}
                          title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="touch-btn p-1.5 rounded-lg text-stone-500 hover:text-rose-400"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content: Text or Doodle image */}
                    {note.drawingDataUrl ? (
                      <div className="rounded-lg overflow-hidden border border-stone-800 bg-[#12141c] p-2">
                        <img
                          src={note.drawingDataUrl}
                          alt="Kitchen scribble doodle"
                          className="w-full max-h-[140px] object-contain rounded"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-stone-100 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
