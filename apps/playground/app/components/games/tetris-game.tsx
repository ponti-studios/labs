import React, { useReducer, useEffect, useCallback, useRef, memo } from 'react';

// Constants
const COLS = 10;
const ROWS = 20;
const TICK_MS = 1000;
const LOCK_DELAY_MS = 500;
const POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 };

// Tetrominos
const PIECES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  L: { shape: [[1,0],[1,0],[1,1]], color: '#f0a000' },
  J: { shape: [[0,1],[0,1],[1,1]], color: '#0000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' }
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
          newGrid[newY][x + col] = piece.color;
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
const Cell = memo(({ color, isGhost }) => (
  <div 
    className="w-6 h-6 border border-gray-800 transition-colors duration-100"
    style={{ 
      backgroundColor: color || '#1a1a1a',
      opacity: isGhost ? 0.3 : 1
    }}
  />
));

// Memoized preview component
const Preview = memo(({ piece, title }) => (
  <div className="border border-gray-600 p-2 rounded bg-gray-900">
    <div className="text-xs font-bold mb-2 text-center text-gray-400">{title}</div>
    <div className="flex flex-col items-center">
      {piece ? (
        piece.shape.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div 
                key={j}
                className="w-5 h-5 border border-gray-800"
                style={{ backgroundColor: cell ? piece.color : '#1a1a1a' }}
              />
            ))}
          </div>
        ))
      ) : (
        <div className="w-20 h-20 flex items-center justify-center text-gray-600">
          Empty
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
              grid[ghostY + row][state.x + col] = { ghost: true, color: state.current.color };
            }
          }
        }
      }
      
      // Add current piece
      for (let row = 0; row < state.current.shape.length; row++) {
        for (let col = 0; col < state.current.shape[row].length; col++) {
          if (state.current.shape[row][col] && state.y + row >= 0) {
            grid[state.y + row][state.x + col] = state.current.color;
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
    <div className="flex justify-center items-center min-h-screen bg-gray-950 p-4">
      <div className="flex gap-4">
        {/* Left panel */}
        <div className="flex flex-col gap-4">
          <Preview piece={state.held} title="HOLD (C)" />
          
          <div className="border border-gray-600 p-3 rounded bg-gray-900 text-white">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Score</span>
                <span className="font-bold">{state.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lines</span>
                <span className="font-bold">{state.lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Level</span>
                <span className="font-bold">{state.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game board */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">TETRIS</h1>
          
          <div className="border-4 border-gray-700 bg-gray-950 relative">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1.5rem)` }}>
              {displayGrid.map((row, i) => 
                row.map((cell, j) => (
                  <Cell 
                    key={`${i}-${j}`}
                    color={cell?.ghost ? cell.color : cell}
                    isGhost={!!cell?.ghost}
                  />
                ))
              )}
            </div>
            
            {/* Overlays */}
            {!state.started && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                <div className="text-center text-white">
                  <p className="text-2xl mb-4">Press ENTER to Start</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>← →: Move  ↑: Rotate  ↓: Soft Drop</p>
                    <p>SPACE: Hard Drop  C: Hold  P: Pause</p>
                  </div>
                </div>
              </div>
            )}
            
            {state.paused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                <p className="text-3xl text-white font-bold">PAUSED</p>
              </div>
            )}
            
            {state.gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                <div className="text-center text-white">
                  <p className="text-3xl mb-4">GAME OVER</p>
                  <p className="text-xl mb-2">Score: {state.score}</p>
                  <p className="text-sm text-gray-400">Press R to Restart</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          <Preview piece={state.next} title="NEXT" />
          
          <div className="border border-gray-600 p-3 rounded bg-gray-900 text-white text-xs space-y-1">
            <p className="font-bold mb-2 text-gray-400">CONTROLS</p>
            <p>← → : Move</p>
            <p>↑ : Rotate</p>
            <p>↓ : Soft Drop</p>
            <p>SPACE : Hard Drop</p>
            <p>C : Hold Piece</p>
            <p>P : Pause</p>
            <p>R : Restart</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
