import React from 'react';
import { COLOR_BLUE, COLOR_RED } from '../libs/constants';

export default function Panel ({ gameState }) {
  const { turn, agents } = gameState;
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  
  // Define styles in a JavaScript object
  const panelStyles = {
    display: 'flex',
    flex: 1,
    height: '100vh',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#222222',
    color: '#fff',
  };
  
  const headerStyles = {
    marginTop: '40px',
    marginBottom: '60px',
    textAlign: 'center',
  };
  
  const itemStyles = {
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: '5px',
    marginBottom: '20px',
  };

  const itemTitleStyles = {
    width: '100%',
    padding: '10px',
    //backgroundColor: '#af7788',
    backgroundColor: currentAgent.team === 'red' ? COLOR_RED : COLOR_BLUE,
    borderRadius: '5px',
    textAlign: 'center',
  };

  const itemFieldStyles = {
    width: '100%',
    textAlign: 'center',
    margin: 20,
  };

  return (
    <div style={panelStyles}>
      <h1 style={headerStyles}>Game Details</h1>
      
      <div style={itemStyles}>
        <h2 style={itemTitleStyles}>Turn Details</h2>
        <h4 style={itemFieldStyles}>Current Turn: {turn.current}</h4>
        <h4 style={itemFieldStyles}>Actions Done: {turn.actions}</h4>
      </div>
      
      {currentAgent && (
        <div style={itemStyles}>
          <h2 style={itemTitleStyles}>Agent Details</h2>
          <h4 style={itemFieldStyles}>ID: {currentAgent.id}</h4>
          <h4 style={itemFieldStyles}>Team: {currentAgent.team}</h4>
          <h4 style={itemFieldStyles}>Life: {currentAgent.life}</h4>
          <h4 style={itemFieldStyles}>Position: ({currentAgent.position[0]}, {currentAgent.position[1]})</h4>
        </div>
      )}
    </div>
  );
};

