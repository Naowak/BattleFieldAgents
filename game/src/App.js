import React from 'react';
import Game from './components/Game';

console.warn = () => {};

function App() {
  return (
    <div className="App" style={{display: 'flex', flex: 1}}>
      <Game/>
    </div>
  );
}

export default App;
