import { useState, useCallback } from 'react';
import { GameState } from '../game/gameState';

export function useGame() {
  const [gameState, setGameState] = useState(() => new GameState());
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

  const resetGame = useCallback(() => {
    setGameState(new GameState());
    setTick(0);
  }, []);

  return { gameState, placePiece, passTurn, resetGame, tick };
}
