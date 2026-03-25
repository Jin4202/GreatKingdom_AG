import { useState, useCallback } from 'react';
import { GameState } from '../game/gameState';

export function useGame() {
  const [gameState] = useState(() => new GameState());
  const [tick, setTick] = useState(0);

  const placePiece = useCallback((x: number, y: number) => {
    if (gameState.placePiece(x, y)) {
      setTick(t => t + 1);
    }
  }, [gameState]);

  const passTurn = useCallback(() => {
    if (gameState.passTurn()) {
      setTick(t => t + 1);
    }
  }, [gameState]);

  return { gameState, placePiece, passTurn, tick };
}
