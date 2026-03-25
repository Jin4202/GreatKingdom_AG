export type Player = 'blue' | 'orange';
export type Piece = Player | 'neutral' | null;

export class GameState {
  board: Piece[][];
  currentPlayer: Player;
  passes: number;
  gameOver: boolean;
  winner: Player | 'tie' | null;

  constructor() {
    // Initialize 9x9 board with null
    this.board = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // Place neutral castle at center
    this.board[4][4] = 'neutral';
    
    this.currentPlayer = 'blue'; // First player
    this.passes = 0;
    this.gameOver = false;
    this.winner = null;
  }

  placePiece(x: number, y: number): boolean {
    if (this.gameOver) return false;
    
    // Check bounds
    if (x < 0 || x >= 9 || y < 0 || y >= 9) return false;
    
    // Check if empty
    if (this.board[y][x] !== null) return false;
    
    // Place piece
    this.board[y][x] = this.currentPlayer;
    
    // Reset passes
    this.passes = 0;
    
    // Toggle player
    this.togglePlayer();
    
    return true;
  }

  passTurn(): boolean {
    if (this.gameOver) return false;
    
    this.passes++;
    if (this.passes >= 2) {
      this.gameOver = true;
      // In a full implementation, calculate territory here
    }
    
    this.togglePlayer();
    return true;
  }

  private togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'blue' ? 'orange' : 'blue';
  }
}
