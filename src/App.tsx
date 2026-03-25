import { useMemo } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';

function App() {
  const { gameState, placePiece, passTurn, tick } = useGame();

  const liveStats = useMemo(() => {
    return gameState.calculateScore();
  }, [gameState, tick]);

  return (
    <div className="app-container">
      <div className="header">
        <h1>Great Kingdom</h1>
      </div>
      
      <div className="status-panel">
        {gameState.gameOver ? (
          <div className="game-over">
            <div>Game Over! Winner: <span style={{textTransform: 'capitalize'}}>{gameState.winner}</span></div>
            {gameState.scores && (
              <div style={{fontSize: '1rem', marginTop: '4px', color: '#94a3b8', textShadow: 'none'}}>
                Territory - Blue: {gameState.scores.blue} | Orange: {gameState.scores.orange}
              </div>
            )}
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
                <div style={{color: '#fb923c', fontWeight: 'bold', marginBottom: '4px'}}>Orange</div>
                <div>Pieces: {gameState.inventory.orange}/40</div>
                <div>Territory: {liveStats.orange}</div>
              </div>
            </div>
          </div>
        )}

        {!gameState.gameOver && (
          <button 
            className="pass-btn" 
            onClick={passTurn} 
            disabled={gameState.gameOver}
            style={{alignSelf: 'flex-end'}}
          >
            Pass Turn
          </button>
        )}
      </div>

      <GameBoard 
        gameState={gameState} 
        liveTerritory={{ blueTerritory: liveStats.blueTerritory, orangeTerritory: liveStats.orangeTerritory }}
        onPlacePiece={placePiece} 
      />
    </div>
  );
}

export default App;
