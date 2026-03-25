export type Player = 'blue' | 'orange';
export type Piece = Player | 'neutral' | null;

export class GameState {
  board: Piece[][];
  currentPlayer: Player;
  passes: number;
  gameOver: boolean;
  winner: Player | 'tie' | null;
  scores: { blue: number; orange: number } | null;
  inventory: { blue: number; orange: number };

  constructor() {
    this.board = Array(9).fill(null).map(() => Array(9).fill(null));
    this.board[4][4] = 'neutral';
    this.currentPlayer = 'blue';
    this.passes = 0;
    this.gameOver = false;
    this.winner = null;
    this.scores = null;
    this.inventory = { blue: 40, orange: 40 };
  }

  public isWall(x: number, y: number): boolean {
    if (x < 0 || x >= 9 || y < 0 || y >= 9) return true;
    if (x === 4 && y === 4) return true;
    return false;
  }

  public getGroupLiberties(startX: number, startY: number): { liberties: number; group: { x: number; y: number }[] } {
    const player = this.board[startY][startX];
    if (!player || player === 'neutral') return { liberties: 0, group: [] };

    const visited = new Set<string>();
    const group: { x: number; y: number }[] = [];
    const libertiesSet = new Set<string>();
    
    const queue = [{ x: startX, y: startY }];
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      group.push({ x, y });

      const neighbors = [
        { nx: x, ny: y - 1 },
        { nx: x, ny: y + 1 },
        { nx: x - 1, ny: y },
        { nx: x + 1, ny: y }
      ];

      for (const { nx, ny } of neighbors) {
        if (this.isWall(nx, ny)) continue;

        const neighborKey = `${nx},${ny}`;
        const neighborPiece = this.board[ny][nx];

        if (neighborPiece === null) {
          libertiesSet.add(neighborKey);
        } else if (neighborPiece === player && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    return { liberties: libertiesSet.size, group };
  }

  // Helper to check if an empty space belongs to a fully completed territory of the opponent
  private isOpponentCompletedTerritory(startX: number, startY: number, opponent: Player): boolean {
    if (this.board[startY][startX] !== null) return false;

    const queue = [{ x: startX, y: startY }];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    let touchesCurrentPlayer = false; 
    let touchesOpponent = false; 
    const edgesHit = new Set<string>();

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      
      const neighbors = [
        { nx: x, ny: y - 1, edge: 'top' },
        { nx: x, ny: y + 1, edge: 'bottom' },
        { nx: x - 1, ny: y, edge: 'left' },
        { nx: x + 1, ny: y, edge: 'right' }
      ];

      for (const { nx, ny, edge } of neighbors) {
        if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) {
          edgesHit.add(edge);
          continue;
        }
        if (nx === 4 && ny === 4) {
          continue; // Neutral castle is a wall
        }

        const p = this.board[ny][nx];
        if (p === opponent) {
          touchesOpponent = true;
        } else if (p !== null && p !== opponent && p !== 'neutral') {
          touchesCurrentPlayer = true;
        } else if (p === null && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    // Prohibited if bounded by Opponent EXCLUSIVELY and touches <= 3 edges.
    return touchesOpponent && !touchesCurrentPlayer && edgesHit.size <= 3;
  }

  public isValidMove(x: number, y: number): boolean {
    if (this.gameOver) return false;
    if (this.inventory[this.currentPlayer] <= 0) return false;
    if (this.isWall(x, y)) return false;
    if (this.board[y][x] !== null) return false;

    const opponent = this.currentPlayer === 'blue' ? 'orange' : 'blue';
    if (this.isOpponentCompletedTerritory(x, y, opponent)) return false;

    this.board[y][x] = this.currentPlayer;
    
    let opponentCaptured = false;
    const neighbors = [
      { nx: x, ny: y - 1 },
      { nx: x, ny: y + 1 },
      { nx: x - 1, ny: y },
      { nx: x + 1, ny: y }
    ];
    for (const { nx, ny } of neighbors) {
      if (this.isWall(nx, ny)) continue;
      if (this.board[ny][nx] === opponent) {
        const { liberties: oppLiberties } = this.getGroupLiberties(nx, ny);
        if (oppLiberties === 0) {
          opponentCaptured = true;
          break;
        }
      }
    }

    if (opponentCaptured) {
      this.board[y][x] = null;
      return true;
    }

    const { liberties } = this.getGroupLiberties(x, y);
    this.board[y][x] = null;
    
    if (liberties === 0) return false;
    return true;
  }

  public calculateScore(): { blue: number; orange: number; winner: Player; blueTerritory: {x:number,y:number}[]; orangeTerritory: {x:number,y:number}[] } {
    const visited = Array(9).fill(false).map(() => Array(9).fill(false));
    let blueScore = 0;
    let orangeScore = 0;
    const blueTerritory: {x:number, y:number}[] = [];
    const orangeTerritory: {x:number, y:number}[] = [];

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.board[y][x] === null && !visited[y][x]) {
          const group: { x: number; y: number }[] = [];
          const queue = [{ x, y }];
          visited[y][x] = true;

          let hitBlue = false;
          let hitOrange = false;
          const edgesHit = new Set<string>();

          while (queue.length > 0) {
            const current = queue.shift()!;
            group.push(current);

            const neighbors = [
              { nx: current.x, ny: current.y - 1, edge: 'top' },
              { nx: current.x, ny: current.y + 1, edge: 'bottom' },
              { nx: current.x - 1, ny: current.y, edge: 'left' },
              { nx: current.x + 1, ny: current.y, edge: 'right' }
            ];

            for (const { nx, ny, edge } of neighbors) {
              if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) {
                edgesHit.add(edge);
                continue;
              }
              if (nx === 4 && ny === 4) continue;
              
              const piece = this.board[ny][nx];
              if (piece === 'blue') hitBlue = true;
              else if (piece === 'orange') hitOrange = true;
              else if (piece === null && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
              }
            }
          }

          if (edgesHit.size <= 3) {
            if (hitBlue && !hitOrange) {
              blueScore += group.length;
              blueTerritory.push(...group);
            } else if (hitOrange && !hitBlue) {
              orangeScore += group.length;
              orangeTerritory.push(...group);
            }
          }
        }
      }
    }

    const winner = (blueScore - orangeScore >= 3) ? 'blue' : 'orange';
    return { blue: blueScore, orange: orangeScore, winner, blueTerritory, orangeTerritory };
  }

  placePiece(x: number, y: number): boolean {
    if (this.gameOver) return false;
    if (this.inventory[this.currentPlayer] <= 0) return false;
    if (this.isWall(x, y)) return false;
    if (this.board[y][x] !== null) return false;

    // Check Placement Restriction (Cannot place in opponent's completed territory)
    const opponent = this.currentPlayer === 'blue' ? 'orange' : 'blue';
    if (this.isOpponentCompletedTerritory(x, y, opponent)) {
      return false; // strictly prohibited
    }
    
    this.board[y][x] = this.currentPlayer;

    const neighbors = [
      { nx: x, ny: y - 1 },
      { nx: x, ny: y + 1 },
      { nx: x - 1, ny: y },
      { nx: x + 1, ny: y }
    ];

    // Capture (Sudden Death) Check evaluated BEFORE Suicide
    let opponentCaptured = false;
    
    for (const { nx, ny } of neighbors) {
      if (this.isWall(nx, ny)) continue;
      if (this.board[ny][nx] === opponent) {
        const { liberties: oppLiberties } = this.getGroupLiberties(nx, ny);
        if (oppLiberties === 0) {
          opponentCaptured = true;
          break; // Sudden death!
        }
      }
    }

    if (opponentCaptured) {
      this.inventory[this.currentPlayer]--;
      this.gameOver = true;
      this.winner = this.currentPlayer; // Sudden Death win!
      return true;
    }

    // Placement Restriction (Suicide fallback for self-capture or shared spaces)
    const { liberties } = this.getGroupLiberties(x, y);
    if (liberties === 0) {
      this.board[y][x] = null;
      return false;
    }
    
    this.inventory[this.currentPlayer]--;
    this.passes = 0;
    this.togglePlayer();
    
    return true;
  }

  passTurn(): boolean {
    if (this.gameOver) return false;
    
    this.passes++;
    if (this.passes >= 2) {
      this.gameOver = true;
      const result = this.calculateScore();
      this.winner = result.winner;
      this.scores = { blue: result.blue, orange: result.orange };
    }
    
    this.togglePlayer();
    return true;
  }

  private togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'blue' ? 'orange' : 'blue';
  }
}
