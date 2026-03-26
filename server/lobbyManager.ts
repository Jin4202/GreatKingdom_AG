import { Server, Socket } from 'socket.io';
import { GameState, Player } from '../src/game/gameState';

export interface Room {
  id: string;
  name: string;
  password?: string;
  players: { socketId: string, role: Player }[];
  gameState: GameState | null;
  timeout?: NodeJS.Timeout;
}

export class LobbyManager {
  private rooms: Map<string, Room> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public getPublicRooms() {
    const list: any[] = [];
    this.rooms.forEach((room, id) => {
      list.push({
        id,
        name: room.name,
        hasPassword: !!room.password,
        playerCount: room.players.length
      });
    });
    return list;
  }
  
  public handleConnection(socket: Socket) {
    socket.on('get_rooms', () => {
      socket.emit('sync_rooms', this.getPublicRooms());
    });

    socket.on('create_room', (data: { name: string, password?: string }) => {
      const roomId = Math.random().toString(36).substring(2, 9);
      
      const timeout = setTimeout(() => {
        const r = this.rooms.get(roomId);
        if (r && r.players.length < 2) {
          this.io.to(roomId).emit('player_left', 'Room closed due to inactivity (no opponent joined after 3 minutes).');
          this.rooms.delete(roomId);
          this.io.emit('sync_rooms', this.getPublicRooms());
        }
      }, 3 * 60 * 1000); // 3 minutes timeout

      this.rooms.set(roomId, {
        id: roomId,
        name: data.name || 'Game Room',
        password: data.password,
        players: [],
        gameState: null,
        timeout
      });
      socket.emit('room_created', roomId);
      this.io.emit('sync_rooms', this.getPublicRooms());
    });

    socket.on('join_room', (data: { roomId: string, password?: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room) {
        socket.emit('room_error', 'Room not found');
        return;
      }
      if (room.password && room.password !== data.password) {
        socket.emit('room_error', 'Invalid password');
        return;
      }
      if (room.players.length >= 2) {
        socket.emit('room_error', 'Room is full');
        return;
      }

      // Determine role
      const role: Player = room.players.length === 0 ? 'blue' : 'orange';
      room.players.push({ socketId: socket.id, role });
      socket.join(data.roomId);

      socket.emit('joined_room', { roomId: data.roomId, role });

      // Start game if 2 players
      if (room.players.length === 2) {
        if (room.timeout) clearTimeout(room.timeout);
        room.gameState = new GameState();
        this.io.to(data.roomId).emit('game_start', {
          message: 'Game is starting!',
        });
        this.broadcastState(room);
      } else {
        // Just broadcast empty state to waiting player
        socket.emit('game_waiting', 'Waiting for an opponent...');
      }
      
      this.io.emit('sync_rooms', this.getPublicRooms());
    });

    socket.on('place_piece', (data: { roomId: string, x: number, y: number }) => {
      const room = this.rooms.get(data.roomId);
      if (!room || !room.gameState) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      if (room.gameState.currentPlayer !== player.role) return;

      if (room.gameState.isValidMove(data.x, data.y)) {
        room.gameState.placePiece(data.x, data.y);
        this.broadcastState(room);
      } else {
        socket.emit('room_error', 'Invalid move according to server.');
      }
    });

    socket.on('pass_turn', (data: { roomId: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room || !room.gameState) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      if (room.gameState.currentPlayer !== player.role) return;

      room.gameState.passTurn();
      this.broadcastState(room);
    });

    socket.on('restart_game', (data: { roomId: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room) return;
      
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      if (room.gameState && room.gameState.gameOver) {
        room.gameState = new GameState();
        
        // Swap roles for fairness in the next match!
        room.players.forEach(p => p.role = p.role === 'blue' ? 'orange' : 'blue');
        
        room.players.forEach(p => {
          this.io.to(p.socketId).emit('joined_room', { roomId: data.roomId, role: p.role });
        });

        this.io.to(data.roomId).emit('game_start', { message: 'Game has restarted!' });
        this.broadcastState(room);
      }
    });

    socket.on('leave_room', (data: { roomId: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room) return;
      const pIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (pIndex !== -1) {
        room.players.splice(pIndex, 1);
        socket.leave(data.roomId);
        this.io.to(data.roomId).emit('player_left', 'Your opponent left the room. Sending you back to Lobby.');
        if (room.gameState) room.gameState = null;
        if (room.players.length === 0) {
          if (room.timeout) clearTimeout(room.timeout);
          this.rooms.delete(data.roomId);
        }
        this.io.emit('sync_rooms', this.getPublicRooms());
      }
    });

    socket.on('disconnect', () => {
      let stateChanged = false;
      
      this.rooms.forEach((room, id) => {
        const pIndex = room.players.findIndex(p => p.socketId === socket.id);
        
        if (pIndex !== -1) {
          room.players.splice(pIndex, 1);
          this.io.to(id).emit('player_left', 'Your opponent disconnected.');
          // Reset game if someone leaves mid-game
          if (room.gameState) {
             room.gameState = null;
          }
          stateChanged = true;
        }

        // Instantly garbage collect ANY room that is completely empty (0/2).
        // This catches ghost rooms left by people who disconnected exactly during room-creation before joining.
        if (room.players.length === 0) {
          if (room.timeout) clearTimeout(room.timeout);
          this.rooms.delete(id);
          stateChanged = true;
        }
      });

      if (stateChanged) {
        this.io.emit('sync_rooms', this.getPublicRooms());
      }
    });
  }

  private broadcastState(room: Room) {
    if (!room.gameState) return;
    const scores = room.gameState.calculateScore();
    const stateData = {
      board: room.gameState.board,
      currentPlayer: room.gameState.currentPlayer,
      passes: room.gameState.passes,
      gameOver: room.gameState.gameOver,
      winner: room.gameState.winner,
      inventory: room.gameState.inventory,
      scores: room.gameState.scores,
      liveTerritory: { blueTerritory: scores.blueTerritory, orangeTerritory: scores.orangeTerritory }
    };
    this.io.to(room.id).emit('sync_state', stateData);
  }
}
