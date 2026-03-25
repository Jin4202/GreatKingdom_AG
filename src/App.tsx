import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';

function App() {
  const { gameState, placePiece, passTurn } = useGame();

  return (
    <div className="app-container">
      <div className="header">
        <h1>Great Kingdom</h1>
      </div>
      
      <div className="status-panel">
        {gameState.gameOver ? (
          <div className="game-over">Game Over</div>
        ) : (
          <div className="current-player">
            <span>Turn:</span>
            <div className={`player-indicator ${gameState.currentPlayer}`} />
            <span style={{textTransform: 'capitalize'}}>{gameState.currentPlayer}</span>
          </div>
        )}
        <button 
          className="pass-btn" 
          onClick={passTurn} 
          disabled={gameState.gameOver}
        >
          Pass Turn
        </button>
      </div>

      <GameBoard 
        gameState={gameState} 
        onPlacePiece={placePiece} 
      />
    </div>
  );
}

export default App;
