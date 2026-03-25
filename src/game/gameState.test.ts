import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './gameState';

describe('GameState Phase 1 - Core Loop', () => {
  let game: GameState;

  beforeEach(() => {
    game = new GameState();
  });

  it('should initialize with a 9x9 board and neutral castle at [4,4]', () => {
    expect(game.board.length).toBe(9);
    expect(game.board[0].length).toBe(9);
    expect(game.board[4][4]).toBe('neutral');
    expect(game.currentPlayer).toBe('blue');
    expect(game.gameOver).toBe(false);
  });

  it('should allow alternating piece placement on valid intersections', () => {
    // Blue places at 0,0
    const success1 = game.placePiece(0, 0);
    expect(success1).toBe(true);
    expect(game.board[0][0]).toBe('blue');
    expect(game.currentPlayer).toBe('orange');

    // Orange places at 1,1
    const success2 = game.placePiece(1, 1);
    expect(success2).toBe(true);
    expect(game.board[1][1]).toBe('orange');
    expect(game.currentPlayer).toBe('blue');
  });

  it('should prevent placing pieces on occupied intersections or out of bounds', () => {
    // Invalid bounds
    expect(game.placePiece(-1, 0)).toBe(false);
    expect(game.placePiece(9, 9)).toBe(false);

    // Occupied by neutral
    expect(game.placePiece(4, 4)).toBe(false);

    // Occupied by player
    game.placePiece(0, 0); // Blue places
    expect(game.placePiece(0, 0)).toBe(false); // Orange cannot place there
  });

  it('should handle consecutive passes leading to game over', () => {
    game.passTurn(); // Blue passes
    expect(game.currentPlayer).toBe('orange');
    expect(game.gameOver).toBe(false);

    game.passTurn(); // Orange passes
    expect(game.gameOver).toBe(true);
  });
});
