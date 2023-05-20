import React, { useState } from 'react';
import Game from './components/Game';
import Panel from './components/Panel';
import { initGameState } from './libs/initialization';

console.warn = () => {};

function App() {

  const [gameState, setGameState] = useState(initGameState());

  return (
    <div className="App" style={{display: 'flex', flex: 1, flexDirection: 'row'}}>
      <Panel gameState={gameState} />
      <Game gameState={gameState} setGameState={setGameState}/>
    </div>
  );
}

export default App;
