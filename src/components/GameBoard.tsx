import { useRef, useEffect, useState } from 'react';
import { GameState, type Piece } from '../game/gameState';

interface GameBoardProps {
  gameState: GameState;
  liveTerritory: { blueTerritory: {x:number, y:number}[], orangeTerritory: {x:number, y:number}[] };
  onPlacePiece: (x: number, y: number) => void;
}

const BOARD_SIZE = 9;
const CELL_SIZE = 50;
const MARGIN = 30;
const CANVAS_SIZE = BOARD_SIZE * CELL_SIZE + MARGIN * 2;

export function GameBoard({ gameState, liveTerritory, onPlacePiece }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverCoord, setHoverCoord] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw live territory highlights
    const drawTerritoryBlock = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(MARGIN + x * CELL_SIZE + 2, MARGIN + y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    };

    liveTerritory.blueTerritory.forEach(t => drawTerritoryBlock(t.x, t.y, 'rgba(59, 130, 246, 0.4)'));
    liveTerritory.orangeTerritory.forEach(t => drawTerritoryBlock(t.x, t.y, 'rgba(249, 115, 22, 0.4)'));

    // Draw grid
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
    
    for (let i = 0; i <= BOARD_SIZE; i++) {
        const p = MARGIN + i * CELL_SIZE;
        ctx.moveTo(p, MARGIN);
        ctx.lineTo(p, CANVAS_SIZE - MARGIN);
        ctx.moveTo(MARGIN, p);
        ctx.lineTo(CANVAS_SIZE - MARGIN, p);
    }
    ctx.stroke();

    // Helper to draw a piece
    const drawPiece = (x: number, y: number, type: Piece, isGhost = false, isInvalid = false) => {
        if (!type) return;
        
        const cx = MARGIN + x * CELL_SIZE + CELL_SIZE / 2;
        const cy = MARGIN + y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 4;

        let baseColor = '';
        let glowColor = '';

        if (isInvalid) {
            baseColor = 'rgba(239, 68, 68, 0.6)'; // Red for suicide/invalid
            glowColor = 'rgba(239, 68, 68, 0.4)';
        } else if (type === 'blue') {
            baseColor = 'rgba(59, 130, 246, 0.9)';
            glowColor = 'rgba(59, 130, 246, 0.5)';
        } else if (type === 'orange') {
            baseColor = 'rgba(249, 115, 22, 0.9)';
            glowColor = 'rgba(249, 115, 22, 0.5)';
        } else if (type === 'neutral') {
            baseColor = 'rgba(251, 191, 36, 1)';
            glowColor = 'rgba(251, 191, 36, 0.6)';
        }

        if (isGhost && !isInvalid) {
            baseColor = baseColor.replace(/0\.\d+\)/, '0.3)');
            glowColor = glowColor.replace(/0\.\d+\)/, '0.2)');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        
        ctx.shadowBlur = isGhost ? 10 : 20;
        ctx.shadowColor = glowColor;
        
        const gradient = ctx.createRadialGradient(cx - radius/3, cy - radius/3, radius/5, cx, cy, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, baseColor);
        gradient.addColorStop(1, glowColor);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 0;
    };

    // Draw pieces
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (gameState.board[y][x]) {
            drawPiece(x, y, gameState.board[y][x]);
        }
      }
    }

    // Draw hover ghost
    if (hoverCoord && !gameState.gameOver) {
        if (hoverCoord.x >= 0 && hoverCoord.x < BOARD_SIZE && hoverCoord.y >= 0 && hoverCoord.y < BOARD_SIZE) {
            if (!gameState.board[hoverCoord.y][hoverCoord.x] && !gameState.isWall(hoverCoord.x, hoverCoord.y)) {
                // Check if valid
                const isValid = gameState.isValidMove(hoverCoord.x, hoverCoord.y);
                drawPiece(hoverCoord.x, hoverCoord.y, gameState.currentPlayer, true, !isValid);
            }
        }
    }

  }, [gameState, gameState.board, gameState.currentPlayer, gameState.gameOver, hoverCoord, liveTerritory]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN;
    const y = e.clientY - rect.top - MARGIN;

    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);

    if (gridX !== hoverCoord?.x || gridY !== hoverCoord?.y) {
        setHoverCoord({ x: gridX, y: gridY });
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  const handleClick = () => {
    if (hoverCoord && !gameState.gameOver) {
        onPlacePiece(hoverCoord.x, hoverCoord.y);
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.2)',
        cursor: gameState.gameOver ? 'default' : 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
}
