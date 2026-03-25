import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameBoard } from './components/GameBoard';
import { GameState } from './game/gameState';

const socket: Socket = io('http://localhost:3001');

function App() {
  const [view, setView] = useState<'LOBBY' | 'GAME'>('LOBBY');
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState<'blue'|'orange'|null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [waiting, setWaiting] = useState(false);
  
  const [newRoomName, setNewRoomName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [promptingRoomId, setPromptingRoomId] = useState<string | null>(null);
  const [attemptPassword, setAttemptPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    socket.emit('get_rooms');

    socket.on('sync_rooms', (data) => setRooms(data));
    
    socket.on('room_created', (id) => {
      socket.emit('join_room', { roomId: id, password: createPassword });
    });

    socket.on('joined_room', (data) => {
      setRoomId(data.roomId);
      setRole(data.role);
      setView('GAME');
      setWaiting(true);
      setErrorMsg('');
      setPromptingRoomId(null);
    });

    socket.on('game_start', () => {
      setWaiting(false);
    });

    socket.on('game_waiting', () => {
      setWaiting(true);
    });

    socket.on('sync_state', (data) => {
      const gs = new GameState();
      Object.assign(gs, data);
      setGameState(gs);
    });

    socket.on('room_error', (msg) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    });

    socket.on('player_left', (msg) => {
      alert(msg);
      setView('LOBBY');
      setGameState(null);
    });

    return () => {
      socket.off('sync_rooms');
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('game_start');
      socket.off('game_waiting');
      socket.off('sync_state');
      socket.off('room_error');
      socket.off('player_left');
    };
  }, [createPassword]);

  const handleCreateRoom = () => {
    if (!newRoomName) return;
    socket.emit('create_room', { name: newRoomName, password: createPassword });
  };

  const handleJoinRoom = (id: string, hasPassword: boolean) => {
    if (hasPassword) {
      setPromptingRoomId(id);
      setAttemptPassword('');
      return;
    }
    socket.emit('join_room', { roomId: id });
  };

  const submitJoinPassword = () => {
    if (promptingRoomId) {
      socket.emit('join_room', { roomId: promptingRoomId, password: attemptPassword });
    }
  };

  const placePiece = (x: number, y: number) => {
    if (gameState && role === gameState.currentPlayer) {
      socket.emit('place_piece', { roomId, x, y });
    }
  };

  const passTurn = () => {
    if (gameState && role === gameState.currentPlayer) {
      socket.emit('pass_turn', { roomId });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { roomId });
    setView('LOBBY');
    setGameState(null);
  };

  const handleRestartGame = () => {
    socket.emit('restart_game', { roomId });
  };

  if (view === 'LOBBY') {
    return (
      // ... lobby view ... (keeping context correct by not replacing the whole enormous file chunk unnecessarily)
      <div className="app-container">
        <div className="header">
          <h1>Great Kingdom Multiplayer</h1>
        </div>
        {errorMsg && <div style={{color: '#ef4444', marginBottom: '10px'}}>{errorMsg}</div>}
        
        {promptingRoomId && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: 'rgba(30,41,59,0.95)', padding: '30px', borderRadius: '12px', width: '300px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <h3 style={{marginTop: 0}}>Private Room</h3>
              <input type="password" placeholder="Enter room password" value={attemptPassword} onChange={e=>setAttemptPassword(e.target.value)} style={inputStyle} autoFocus />
              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <button onClick={() => setPromptingRoomId(null)} style={{...btnStyle, background: 'rgba(255,255,255,0.1)'}}>Cancel</button>
                <button onClick={submitJoinPassword} style={btnStyle}>Join Room</button>
              </div>
            </div>
          </div>
        )}

        <div style={{background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px'}}>
          <h3>Create Room</h3>
          <input type="text" placeholder="Room Name" value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password (Optional)" value={createPassword} onChange={e=>setCreatePassword(e.target.value)} style={inputStyle} />
          <button onClick={handleCreateRoom} style={btnStyle}>Create & Join</button>
        </div>

        <div style={{background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px', marginTop: '20px'}}>
          <h3>Active Rooms</h3>
          {rooms.length === 0 ? <p style={{color: '#94a3b8'}}>No active rooms.</p> : (
             <ul style={{listStyle: 'none', padding: 0}}>
               {rooms.map(r => (
                 <li key={r.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                    <div>
                      <strong>{r.name}</strong> ({r.playerCount}/2)
                      {r.hasPassword && <span style={{marginLeft: '8px'}} role="img" aria-label="locked">🔒</span>}
                    </div>
                    <button onClick={() => handleJoinRoom(r.id, r.hasPassword)} disabled={r.playerCount >= 2} style={{...btnStyle, padding: '4px 12px', width: 'auto'}}>Join</button>
                 </li>
               ))}
             </ul>
          )}
        </div>
      </div>
    );
  }

  if (waiting || !gameState) {
    return (
      <div className="app-container">
         <div className="header"><h1>Great Kingdom</h1></div>
         <h2>Room ID: {roomId}</h2>
         <p style={{fontSize: '1.2rem', margin: '20px 0'}}>
           You are <span style={{textTransform: 'capitalize', color: `var(--glow-${role})`, fontWeight: 'bold'}}>{role}</span>
         </p>
         <p className="game-over">Waiting for opponent to join...</p>
         <button onClick={handleLeaveRoom} style={{...btnStyle, marginTop: '20px', background: 'rgba(239, 68, 68, 0.4)', border: '1px solid rgba(239, 68, 68, 0.6)'}}>
           Leave Room
         </button>
      </div>
    );
  }

  // @ts-ignore extracted from raw payload sync 
  const liveTerritory = gameState.liveTerritory || { blueTerritory: [], orangeTerritory: [] };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Great Kingdom</h1>
        <div style={{fontSize: '1.2rem'}}>You are <span style={{textTransform: 'capitalize', color: `var(--glow-${role})`, fontWeight: 'bold'}}>{role}</span></div>
      </div>
      
      {errorMsg && <div style={{color: '#ef4444'}}>{errorMsg}</div>}

      <div className="status-panel">
        {gameState.gameOver ? (
          <div className="game-over">
            <div>Game Over! Winner: <span style={{textTransform: 'capitalize'}}>{gameState.winner}</span></div>
            {gameState.scores && (
              <div style={{fontSize: '1rem', marginTop: '4px', color: '#94a3b8', textShadow: 'none'}}>
                Territory - Blue: {gameState.scores.blue} | Orange: {gameState.scores.orange}
              </div>
            )}
            <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center'}}>
              <button 
                onClick={handleLeaveRoom} 
                style={{...btnStyle, background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.6)', color: 'rgba(239, 68, 68, 0.9)', width: 'auto'}}
              >
                Leave Room
              </button>
              <button onClick={handleRestartGame} style={{...btnStyle, width: 'auto', padding: '10px 30px'}}>Restart Match</button>
            </div>
          </div>
        ) : (
          <div className="scoreboard">
            <div className="current-player" style={{marginBottom: '10px'}}>
              <span>Turn:</span>
              <div className={`player-indicator ${gameState.currentPlayer}`} />
              <span style={{textTransform: 'capitalize', fontWeight: 'bold'}}>{gameState.currentPlayer}</span>
            </div>
            
            <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#cbd5e1'}}>
              <div style={{background: 'rgba(59, 130, 246, 0.2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)'}}>
                <div style={{color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px'}}>Blue</div>
                <div>Pieces: {gameState.inventory.blue}/40</div>
              </div>

              <div style={{background: 'rgba(249, 115, 22, 0.2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.4)'}}>
                <div style={{color: '#fb923c', fontWeight: 'bold', marginBottom: '4px'}}>Orange</div>
                <div>Pieces: {gameState.inventory.orange}/40</div>
              </div>
            </div>
          </div>
        )}

        {!gameState.gameOver && (
          <button 
            className="pass-btn" 
            onClick={passTurn} 
            disabled={gameState.currentPlayer !== role}
            style={{alignSelf: 'flex-end'}}
          >
            Pass Turn
          </button>
        )}
      </div>

      <GameBoard 
        gameState={gameState} 
        liveTerritory={liveTerritory}
        role={role}
        onPlacePiece={placePiece} 
      />
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', boxSizing: 'border-box' as const };
const btnStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export default App;
