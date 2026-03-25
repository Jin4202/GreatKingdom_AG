import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './gameState';

describe('GameState Phase 3 - Territory Algorithm', () => {
  let game: GameState;

  beforeEach(() => {
    game = new GameState();
  });

  it('should calculate completely open board as 0 territory (no pieces)', () => {
    const score = game.calculateScore();
    expect(score.blue).toBe(0);
    expect(score.orange).toBe(0);
    expect(score.winner).toBe('orange');
  });

  it('should treat purely wall-bounded regions without player pieces as 0 territory', () => {
    // Top-left corner bounded by Blue
    game.board[0][1] = 'blue';
    game.board[1][0] = 'blue';
    
    // Put an Orange piece far away to neutralize the rest of the board (outside the corner)
    game.board[8][8] = 'orange';

    const score = game.calculateScore();
    // Area [0][0] is exactly 1 empty space bounded only by Blue and walls.
    expect(score.blue).toBe(1);
    // The rest of the board touches Blue and Orange, so Orange gets 0, Blue gets only the 1 corner.
    expect(score.orange).toBe(0);
  });

  it('should give 0 points if a territory touches both Orange and Blue', () => {
    game.board[0][1] = 'blue';
    game.board[1][0] = 'orange'; // Closes it, but touches both players
    
    // Put Orange piece far away to neutralize the rest
    game.board[8][8] = 'orange';

    const score = game.calculateScore();
    expect(score.blue).toBe(0); // [0][0] touches both
  });

  it('should ignore Neutral Castle as a player bounded entity but respect it as a Wall for territory', () => {
    // Blue surrounds [3][3] using the Neutral Castle at [4][4]
    game.board[3][4] = 'blue';
    game.board[4][3] = 'blue';
    game.board[2][3] = 'blue';
    game.board[3][2] = 'blue';
    
    // Put Orange piece far away to neutralize the rest of the board
    game.board[8][8] = 'orange';

    const score = game.calculateScore();
    // [3][3] Should give 1 pt to Blue.
    expect(score.blue).toBe(1);
    expect(score.orange).toBe(0);
  });

  it('should declare Blue winner ONLY if leading by 3 or more', () => {
    game.board[0][1] = 'blue';
    game.board[1][0] = 'blue';
    // Neutralize rest
    game.board[8][8] = 'orange';
    
    let score = game.calculateScore();
    expect(score.blue).toBe(1);
    expect(score.winner).toBe('orange'); // 1 - 0 = 1 < 3

    // Reset board
    game.board = Array(9).fill(null).map(() => Array(9).fill(null));
    game.board[4][4] = 'neutral';
    
    // Give Blue 3 points in top row, neutralizing rest with Orange
    game.board[1][0] = 'blue';
    game.board[1][1] = 'blue';
    game.board[1][2] = 'blue';
    game.board[0][3] = 'blue';
    // Empty: [0][0], [0][1], [0][2] -> 3 spaces bounded by Blue
    game.board[8][8] = 'orange'; // neutralize rest
    
    score = game.calculateScore();
    expect(score.blue).toBe(3);
    expect(score.orange).toBe(0);
    expect(score.winner).toBe('blue'); // 3 - 0 = 3 >= 3
  });

  it('score is set and calculated during consecutive passes', () => {
    // Give Blue 4 points
    game.board[1][0] = 'blue';
    game.board[1][1] = 'blue';
    game.board[1][2] = 'blue';
    game.board[1][3] = 'blue';
    game.board[0][4] = 'blue';
    // Neutralize rest
    game.board[8][8] = 'orange';

    game.passTurn();
    expect(game.gameOver).toBe(false);
    
    game.passTurn();
    expect(game.gameOver).toBe(true);
    expect(game.scores?.blue).toBe(4);
    expect(game.winner).toBe('blue');
  });

  it('1-eye should be permanently safe from Capture because Suicide is evaluated first', () => {
    // Blue builds a 1-eye completely surrounding [0,0]
    game.board[0][1] = 'blue';
    game.board[1][0] = 'blue';
    
    // Set board outside to something else just in case
    game.board[8][8] = 'blue';

    // Now [0,0] is Blue's completed territory (1 empty space, bounded by 2 blue + 2 walls).
    
    // Orange tries to place at [0,0] to capture Blue!
    // In standard Go, this works because Capture overrides Suicide.
    // In Great Kingdom, it should be strictly prohibited!
    game.currentPlayer = 'orange';
    const success = game.placePiece(0, 0);

    // Expected: Move is blocked!
    expect(success).toBe(false);
    expect(game.board[0][0]).toBe(null);
    expect(game.gameOver).toBe(false); // Orange did not win via capture
  });
});
