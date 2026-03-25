import { useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import { GameBoard } from './GameBoard';

const btnStyle = { padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export function LocalGame({ onLeave }: { onLeave: () => void }) {
  const { gameState, placePiece, passTurn, resetGame, tick } = useGame();

  const liveStats = useMemo(() => {
    return gameState.calculateScore();
  }, [gameState, tick]);

  const liveTerritory = { blueTerritory: liveStats.blueTerritory, orangeTerritory: liveStats.orangeTerritory };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Great Kingdom (Local)</h1>
        <div style={{fontSize: '1.2rem'}}>Turn: <span style={{textTransform: 'capitalize', color: `var(--glow-${gameState.currentPlayer})`, fontWeight: 'bold'}}>{gameState.currentPlayer}</span></div>
      </div>
      
      <div className="status-panel">
        {gameState.gameOver ? (
          <div className="game-over">
            <div>Game Over! Winner: <span style={{textTransform: 'capitalize'}}>{gameState.winner}</span></div>
            {!gameState.scores && <div style={{fontSize: '0.9rem', marginTop: '5px', color: '#ef4444'}}>Sudden Death Victory!</div>}
            {gameState.scores && (
              <div style={{fontSize: '1rem', marginTop: '4px', color: '#94a3b8', textShadow: 'none'}}>
                Territory - Blue: {gameState.scores.blue} | Orange: {gameState.scores.orange}
                {gameState.winner === 'orange' && gameState.scores.blue >= gameState.scores.orange && (
                  <span style={{color: '#fb923c', display: 'block', marginTop: '8px', fontSize: '0.9rem'}}>
                    Orange wins! Blue failed to overcome the +2 Handicap.
                  </span>
                )}
                {gameState.winner === 'blue' && (
                  <span style={{color: '#60a5fa', display: 'block', marginTop: '8px', fontSize: '0.9rem'}}>
                    Blue successfully cleared the +3 Handicap threshold!
                  </span>
                )}
              </div>
            )}
            <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center'}}>
              <button 
                onClick={onLeave} 
                style={{...btnStyle, background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.6)', color: 'rgba(239, 68, 68, 0.9)', width: 'auto'}}
              >
                Exit Local Play
              </button>
              <button onClick={resetGame} style={{...btnStyle, width: 'auto', padding: '10px 30px'}}>Restart Match</button>
            </div>
          </div>
        ) : (
          <div className="scoreboard">
            <div className="current-player" style={{marginBottom: '10px'}}>
              <span>Current Turn:</span>
              <div className={`player-indicator ${gameState.currentPlayer}`} />
              <span style={{textTransform: 'capitalize', fontWeight: 'bold'}}>{gameState.currentPlayer}</span>
            </div>
            
            <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#cbd5e1'}}>
              <div style={{background: 'rgba(59, 130, 246, 0.2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)'}}>
                <div style={{color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px'}}>Blue</div>
                <div>Pieces: {gameState.inventory.blue}/40</div>
                <div>Territory: {liveStats.blue}</div>
              </div>

              <div style={{background: 'rgba(249, 115, 22, 0.2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.4)'}}>
                <div style={{color: '#fb923c', fontWeight: 'bold', marginBottom: '4px'}}>Orange (+2 Handicap)</div>
                <div>Pieces: {gameState.inventory.orange}/40</div>
                <div>Territory: {liveStats.orange}</div>
              </div>
            </div>
            
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '15px'}}>
               <strong>Handicap Rule:</strong> Blue must lead by 3+ territory to win. Orange automatically claims victory on narrow leads or ties.
            </div>
          </div>
        )}

        {!gameState.gameOver && (
          <div style={{display: 'flex', gap: '10px', alignSelf: 'flex-end'}}>
             <button onClick={onLeave} style={{...btnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#cbd5e1'}}>Exit</button>
             <button className="pass-btn" onClick={passTurn} style={{margin: 0}}>Pass Turn</button>
          </div>
        )}
      </div>

      <GameBoard 
        gameState={gameState} 
        liveTerritory={liveTerritory}
        role={gameState.currentPlayer} 
        onPlacePiece={placePiece} 
      />
    </div>
  );
}
