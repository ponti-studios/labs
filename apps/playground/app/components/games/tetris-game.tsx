import React, { useReducer, useEffect, useCallback, useRef, memo } from 'react';

// Constants
const COLS = 10;
const ROWS = 20;
const TICK_MS = 1000;
const LOCK_DELAY_MS = 500;
const POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 };

// Tetrominos - using opacity levels for visual distinction
const PIECES = {
  I: { shape: [[1,1,1,1]], opacity: 1.0 },
  O: { shape: [[1,1],[1,1]], opacity: 0.9 },
  T: { shape: [[0,1,0],[1,1,1]], opacity: 0.85 },
  L: { shape: [[1,0],[1,0],[1,1]], opacity: 0.8 },
  J: { shape: [[0,1],[0,1],[1,1]], opacity: 0.75 },
  S: { shape: [[0,1,1],[1,1,0]], opacity: 0.7 },
  Z: { shape: [[1,1,0],[0,1,1]], opacity: 0.65 }
};

// Game logic utilities
const createEmptyGrid = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const randomPiece = () => {
  const keys = Object.keys(PIECES);
  const key = keys[Math.random() * keys.length | 0];
  return { ...PIECES[key], shape: PIECES[key].shape };
};

const canMove = (grid, piece, x, y) => {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newY = y + row;
        const newX = x + col;
        
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
        if (newY >= 0 && grid[newY][newX]) return false;
      }
    }
  }
  return true;
};

const mergePiece = (grid, piece, x, y) => {
  const newGrid = grid.map(row => [...row]);
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newY = y + row;
        if (newY >= 0) {
          newGrid[newY][x + col] = piece.opacity;
        }
      }
    }
  }
  
  return newGrid;
};

const clearLines = (grid) => {
  const newGrid = [];
  let cleared = 0;
  
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row].some(cell => !cell)) {
      newGrid.unshift(grid[row]);
    } else {
      cleared++;
    }
  }
  
  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(null));
  }
  
  return { grid: newGrid, lines: cleared };
};

const rotatePiece = (piece) => {
  const shape = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  );
  return { ...piece, shape };
};

const getDropY = (grid, piece, x, y) => {
  let dropY = y;
  while (canMove(grid, piece, x, dropY + 1)) {
    dropY++;
  }
  return dropY;
};

const getSpawnX = (piece) => Math.floor((COLS - piece.shape[0].length) / 2);

// Initial state
const initialState = {
  grid: createEmptyGrid(),
  current: null,
  next: randomPiece(),
  held: null,
  canHold: true,
  x: 0,
  y: 0,
  score: 0,
  lines: 0,
  level: 1,
  gameOver: false,
  paused: false,
  started: false
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'START': {
      const piece = state.next;
      return {
        ...initialState,
        current: piece,
        next: randomPiece(),
        x: getSpawnX(piece),
        y: 0,
        started: true
      };
    }
    
    case 'SPAWN': {
      const piece = state.next;
      const x = getSpawnX(piece);
      
      if (!canMove(state.grid, piece, x, 0)) {
        return { ...state, gameOver: true };
      }
      
      return {
        ...state,
        current: piece,
        next: randomPiece(),
        x,
        y: 0,
        canHold: true
      };
    }
    
    case 'MOVE': {
      const { dx, dy } = action;
      if (!state.current || state.gameOver || state.paused) return state;
      
      const newX = state.x + dx;
      const newY = state.y + dy;
      
      if (canMove(state.grid, state.current, newX, newY)) {
        return { ...state, x: newX, y: newY };
      }
      return state;
    }
    
    case 'ROTATE': {
      if (!state.current || state.gameOver || state.paused) return state;
      
      const rotated = rotatePiece(state.current);
      
      // Try rotation with wall kicks
      for (const offset of [0, -1, 1, -2, 2]) {
        if (canMove(state.grid, rotated, state.x + offset, state.y)) {
          return { ...state, current: rotated, x: state.x + offset };
        }
      }
      return state;
    }
    
    case 'DROP': {
      if (!state.current || state.gameOver || state.paused) return state;
      
      const dropY = getDropY(state.grid, state.current, state.x, state.y);
      const merged = mergePiece(state.grid, state.current, state.x, dropY);
      const { grid, lines } = clearLines(merged);
      
      const newLines = state.lines + lines;
      const level = Math.floor(newLines / 10) + 1;
      const points = (POINTS[lines] || 0) * state.level;
      
      return {
        ...state,
        grid,
        current: null,
        score: state.score + points + (dropY - state.y) * 2,
        lines: newLines,
        level
      };
    }
    
    case 'LOCK': {
      if (!state.current || state.gameOver || state.paused) return state;
      
      const merged = mergePiece(state.grid, state.current, state.x, state.y);
      const { grid, lines } = clearLines(merged);
      
      const newLines = state.lines + lines;
      const level = Math.floor(newLines / 10) + 1;
      const points = (POINTS[lines] || 0) * state.level;
      
      return {
        ...state,
        grid,
        current: null,
        score: state.score + points,
        lines: newLines,
        level
      };
    }
    
    case 'HOLD': {
      if (!state.current || !state.canHold || state.gameOver || state.paused) return state;
      
      const piece = state.held || state.next;
      const x = getSpawnX(piece);
      
      return {
        ...state,
        held: state.current,
        current: piece,
        next: state.held ? state.next : randomPiece(),
        x,
        y: 0,
        canHold: false
      };
    }
    
    case 'PAUSE':
      return { ...state, paused: !state.paused };
    
    default:
      return state;
  }
};

// Memoized cell component
const Cell = memo(({ opacity, isGhost }) => (
  <div 
    className="w-6 h-6 border transition-all duration-100"
    style={{ 
      backgroundColor: opacity ? 'rgba(255, 255, 255, ' + (isGhost ? opacity * 0.2 : opacity) + ')' : 'transparent',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }}
  />
));

// Memoized preview component
const Preview = memo(({ piece, title }) => (
  <div className="border p-3 font-mono" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
    <div className="text-xs font-bold mb-2 text-center uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{title}</div>
    <div className="flex flex-col items-center">
      {piece ? (
        piece.shape.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div 
                key={j}
                className="w-5 h-5 border transition-all duration-100"
                style={{
                  backgroundColor: cell ? `rgba(255, 255, 255, ${piece.opacity})` : 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            ))}
          </div>
        ))
      ) : (
        <div className="w-20 h-20 flex items-center justify-center" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          EMPTY
        </div>
      )}
    </div>
  </div>
));

// Main game component
const TetrisGame = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const lockTimer = useRef(null);
  const dropTimer = useRef(null);

  // Calculate display grid (merges current piece and ghost)
  const displayGrid = (() => {
    const grid = state.grid.map(row => [...row]);
    
    if (state.current && !state.gameOver && state.started) {
      // Add ghost piece
      const ghostY = getDropY(state.grid, state.current, state.x, state.y);
      if (ghostY !== state.y) {
        for (let row = 0; row < state.current.shape.length; row++) {
          for (let col = 0; col < state.current.shape[row].length; col++) {
            if (state.current.shape[row][col] && ghostY + row >= 0) {
              grid[ghostY + row][state.x + col] = { ghost: true, opacity: state.current.opacity };
            }
          }
        }
      }
      
      // Add current piece
      for (let row = 0; row < state.current.shape.length; row++) {
        for (let col = 0; col < state.current.shape[row].length; col++) {
          if (state.current.shape[row][col] && state.y + row >= 0) {
            grid[state.y + row][state.x + col] = state.current.opacity;
          }
        }
      }
    }
    
    return grid;
  })();

  // Auto-drop piece
  useEffect(() => {
    if (!state.started || state.gameOver || state.paused) return;
    
    const tick = Math.max(100, TICK_MS - (state.level - 1) * 50);
    
    dropTimer.current = setInterval(() => {
      if (state.current && canMove(state.grid, state.current, state.x, state.y + 1)) {
        dispatch({ type: 'MOVE', dx: 0, dy: 1 });
      } else if (state.current) {
        // Start lock delay
        if (!lockTimer.current) {
          lockTimer.current = setTimeout(() => {
            dispatch({ type: 'LOCK' });
            lockTimer.current = null;
          }, LOCK_DELAY_MS);
        }
      }
    }, tick);
    
    return () => {
      clearInterval(dropTimer.current);
      if (lockTimer.current) {
        clearTimeout(lockTimer.current);
        lockTimer.current = null;
      }
    };
  }, [state.started, state.gameOver, state.paused, state.level, state.current, state.grid, state.x, state.y]);

  // Spawn new piece when current is null
  useEffect(() => {
    if (state.started && !state.current && !state.gameOver) {
      const timer = setTimeout(() => dispatch({ type: 'SPAWN' }), 100);
      return () => clearTimeout(timer);
    }
  }, [state.current, state.started, state.gameOver]);

  // Keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (!state.started && e.key === 'Enter') {
      dispatch({ type: 'START' });
      return;
    }
    
    if (state.gameOver && (e.key === 'r' || e.key === 'R')) {
      dispatch({ type: 'START' });
      return;
    }
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        dispatch({ type: 'MOVE', dx: -1, dy: 0 });
        break;
      case 'ArrowRight':
        e.preventDefault();
        dispatch({ type: 'MOVE', dx: 1, dy: 0 });
        break;
      case 'ArrowDown':
        e.preventDefault();
        dispatch({ type: 'MOVE', dx: 0, dy: 1 });
        break;
      case 'ArrowUp':
        e.preventDefault();
        dispatch({ type: 'ROTATE' });
        break;
      case ' ':
        e.preventDefault();
        dispatch({ type: 'DROP' });
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        dispatch({ type: 'HOLD' });
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        dispatch({ type: 'PAUSE' });
        break;
    }
  }, [state.started, state.gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4 font-mono text-white">
      <div className="flex gap-8">
        {/* Left panel */}
        <div className="flex flex-col gap-4">
          <Preview piece={state.held} title="HOLD (C)" />
          
          <div className="border p-4 font-mono" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="space-y-2 text-sm uppercase tracking-widest">
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Score</span>
                <span className="font-bold">{state.score}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Lines</span>
                <span className="font-bold">{state.lines}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Level</span>
                <span className="font-bold">{state.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game board */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-6 text-center uppercase tracking-widest">TETRIS</h1>
          
          <div className="border-2 bg-black relative" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1.5rem)` }}>
              {displayGrid.map((row, i) => 
                row.map((cell, j) => (
                  <Cell 
                    key={`${i}-${j}`}
                    opacity={typeof cell === 'object' ? cell.opacity : cell}
                    isGhost={typeof cell === 'object' && !!cell.ghost}
                  />
                ))
              )}
            </div>
            
            {/* Overlays */}
            {!state.started && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
                <div className="text-center font-mono">
                  <p className="text-2xl mb-6 uppercase tracking-widest">PRESS ENTER TO START</p>
                  <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    <p className="mb-1 uppercase tracking-widest">CONTROLS:</p>
                    <p>← → : MOVE  ↑ : ROTATE  ↓ : SOFT DROP</p>
                    <p>SPACE : HARD DROP  C : HOLD  P : PAUSE</p>
                  </div>
                </div>
              </div>
            )}
            
            {state.paused && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
                <p className="text-4xl font-bold uppercase tracking-widest">PAUSED</p>
              </div>
            )}
            
            {state.gameOver && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
                <div className="text-center font-mono">
                  <p className="text-4xl mb-4 font-bold uppercase tracking-widest">GAME OVER</p>
                  <p className="text-2xl mb-4">SCORE: {state.score}</p>
                  <p className="text-sm uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>PRESS R TO RESTART</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          <Preview piece={state.next} title="NEXT" />
          
          <div className="border p-4 font-mono text-xs space-y-1" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <p className="font-bold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>CONTROLS</p>
            <p className="uppercase tracking-widest">← → : MOVE</p>
            <p className="uppercase tracking-widest">↑ : ROTATE</p>
            <p className="uppercase tracking-widest">↓ : SOFT DROP</p>
            <p className="uppercase tracking-widest">SPACE : HARD DROP</p>
            <p className="uppercase tracking-widest">C : HOLD PIECE</p>
            <p className="uppercase tracking-widest">P : PAUSE</p>
            <p className="uppercase tracking-widest">R : RESTART</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
