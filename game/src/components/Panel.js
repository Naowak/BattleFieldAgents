import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { 
  COLOR_BLUE, 
  COLOR_RED,
  COLOR_BG_PANEL,
  COLOR_BG_ITEM,
  COLOR_FONT, 
} from '../libs/constants';

export default function Panel ({ }) {

  // Retrieve context
  const { turn, agents } = useContext(GameContext);
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  
  // Define styles in a JavaScript object
  const styles = {
    panel: {
      display: 'flex',
      flex: 1,
      height: '100vh',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: COLOR_BG_PANEL,
      color: COLOR_FONT,
    },
    header: {
      marginTop: '40px',
      marginBottom: '60px',
      textAlign: 'center',
    },
    item: {
      width: '80%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: COLOR_BG_ITEM,
      borderRadius: '5px',
      marginBottom: '20px',
    },
    itemTitle: {
      width: '100%',
      padding: '10px',
      backgroundColor: currentAgent.team === 'red' ? COLOR_RED : COLOR_BLUE,
      borderRadius: '5px',
      textAlign: 'center',
    },
    itemField: {
      width: '100%',
      textAlign: 'center',
      margin: 20,
    },
  }

  return (
    <div style={styles.panel}>
      <h1 style={styles.header}>Game Details</h1>
      
      <div style={styles.item}>
        <h2 style={styles.itemTitle}>Turn Details</h2>
        <h4 style={styles.itemField}>Current Turn: {turn.current}</h4>
        <h4 style={styles.itemField}>Actions Done: {turn.actions}</h4>
      </div>
      
      {currentAgent && (
        <div style={styles.item}>
          <h2 style={styles.itemTitle}>Agent Details</h2>
          <h4 style={styles.itemField}>ID: {currentAgent.id}</h4>
          <h4 style={styles.itemField}>Team: {currentAgent.team}</h4>
          <h4 style={styles.itemField}>Life: {currentAgent.life}</h4>
          <h4 style={styles.itemField}>Position: ({currentAgent.position[0]}, {currentAgent.position[1]})</h4>
        </div>
      )}
    </div>
  );
};

