import React, { useState } from 'react';
import Game from './components/Game';
import Panel from './components/Panel';
import GameContextProvider from './contexts/GameContext';

console.warn = () => {};

function App() {

  return (
    <div className="App" style={{display: 'flex', flex: 1, flexDirection: 'row'}}>
      <GameContextProvider>
        <Panel />
        <Game />
      </GameContextProvider>
    </div>
  );
}

export default App;
