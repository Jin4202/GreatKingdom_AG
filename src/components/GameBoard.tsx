import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '../game/gameState';

interface GameBoardProps {
  gameState: GameState;
  liveTerritory: { blueTerritory: {x:number, y:number}[], orangeTerritory: {x:number, y:number}[] };
  role: 'blue' | 'orange' | null;
  onPlacePiece: (x: number, y: number) => void;
}

const CELL_SIZE = 1.2;
const getPos = (x: number, y: number): [number, number, number] => [(x - 4) * CELL_SIZE, 0, (y - 4) * CELL_SIZE];

function Castle({ position, type, isGhost = false, isInvalid = false }: any) {
  const color = isInvalid ? '#ef4444' : type === 'blue' ? '#3b82f6' : type === 'orange' ? '#f97316' : '#fbbf24';
  const scale = type === 'neutral' ? 1.2 : 1;
  const height = type === 'neutral' ? 1.5 : 1;

  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, height/2, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} transparent={isGhost} opacity={isGhost ? 0.4 : 1} roughness={0.3} metalness={0.2} />
      </mesh>
      {[-0.3, 0.3].map(bx => 
        [-0.3, 0.3].map(bz => (
          <mesh castShadow key={`${bx}-${bz}`} position={[bx, height + 0.1, bz]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={color} transparent={isGhost} opacity={isGhost ? 0.4 : 1} roughness={0.3} metalness={0.2} />
          </mesh>
        ))
      )}
    </group>
  );
}

function GridLines() {
  const lines = [];
  const size = 9 * CELL_SIZE;
  
  for (let i = 0; i < 9; i++) {
    const pos = (i - 4) * CELL_SIZE;
    // vertical
    lines.push(<mesh receiveShadow key={`v${i}`} position={[pos, 0.01, 0]}><boxGeometry args={[0.04, 0.02, size]} /><meshStandardMaterial color="#475569" /></mesh>);
    // horizontal
    lines.push(<mesh receiveShadow key={`h${i}`} position={[0, 0.01, pos]}><boxGeometry args={[size, 0.02, 0.04]} /><meshStandardMaterial color="#475569" /></mesh>);
  }
  return <group>{lines}</group>;
}

function Board({ gameState, liveTerritory, role, onPlacePiece }: GameBoardProps) {
  const [hoverCoord, setHoverCoord] = useState<{x: number, y: number} | null>(null);

  return (
    <group>
      {/* Table Top Base */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[12, 1, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Play Area Underlay */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
         <boxGeometry args={[10 * CELL_SIZE, 0.02, 10 * CELL_SIZE]} />
         <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      <GridLines />

      {/* Interactive Cells via invisible hitboxes */}
      {Array.from({ length: 9 }).map((_, y) =>
        Array.from({ length: 9 }).map((_, x) => (
          <mesh 
            key={`cell-${x}-${y}`} 
            position={[getPos(x, y)[0], 0.02, getPos(x, y)[2]]} 
            rotation={[-Math.PI/2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (!gameState.gameOver) onPlacePiece(x, y);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              if (!gameState.gameOver) setHoverCoord({ x, y });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoverCoord(null);
            }}
          >
            <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        ))
      )}

      {/* Placed Pieces */}
      {gameState.board.map((row, y) => 
        row.map((piece, x) => {
          if (!piece) return null;
          return <Castle key={`piece-${x}-${y}`} position={getPos(x, y)} type={piece} />;
        })
      )}

      {/* Hover Ghost Piece */}
      {hoverCoord && !gameState.gameOver && role === gameState.currentPlayer && !gameState.board[hoverCoord.y][hoverCoord.x] && !gameState.isWall(hoverCoord.x, hoverCoord.y) && (
        <Castle 
          position={getPos(hoverCoord.x, hoverCoord.y)} 
          type={gameState.currentPlayer} 
          isGhost={true} 
          isInvalid={!gameState.isValidMove(hoverCoord.x, hoverCoord.y)} 
        />
      )}

      {/* Territory Dynamic Auras */}
      {liveTerritory.blueTerritory.map(t => (
        <mesh key={`b-ter-${t.x}-${t.y}`} position={[getPos(t.x, t.y)[0], 0.05, getPos(t.x, t.y)[2]]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} />
        </mesh>
      ))}
      {liveTerritory.orangeTerritory.map(t => (
        <mesh key={`o-ter-${t.x}-${t.y}`} position={[getPos(t.x, t.y)[0], 0.05, getPos(t.x, t.y)[2]]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export function GameBoard(props: GameBoardProps) {
  return (
    <div style={{ width: '100%', maxWidth: '800px', minWidth: 'min(100%, 800px)', margin: '0 auto', height: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#020617' }}>
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[10, 20, 10]} 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        {/* Cinematic Rim Lights */}
        <pointLight position={[-10, 5, -10]} intensity={2.0} color="#60a5fa" distance={30} />
        <pointLight position={[10, 5, -10]} intensity={1.5} color="#fb923c" distance={30} />
        
        <Board {...props} />
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={8} 
          maxDistance={25}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
