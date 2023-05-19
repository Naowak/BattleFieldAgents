import React, { useState, useEffect } from 'react';
import Game from './components/Game';

function App() {
  return (
    <div className="App" style={{display: 'flex', flex: 1}}>
      <Game/>
    </div>
  );
}

export default App;
