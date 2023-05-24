import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { 
  COLOR_BLUE, 
  COLOR_RED,
  COLOR_BG_PANEL,
  COLOR_BUBBLE_AGENT,
  COLOR_FONT, 
} from '../libs/constants';

export default function Panel () {

  // Retrieve context
  const { turn, agents } = useContext(GameContext);
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  const currentSight = currentAgent.sight.map(o => {
    if (o.kind === 'agents') {
      return `Agent ${o.id} (${o.position[0]}, ${o.position[1]})`;
    }
    if (o.kind === 'targets') {
      return `Target ${o.team} (${o.position[0]}, ${o.position[1]})`;
    }
    if (o.kind === 'obstacles') {
      return `Obstacle ${o.id} (${o.position[0]}, ${o.position[1]})`;
    }
    return '???'
  })
  
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
      backgroundColor: COLOR_BUBBLE_AGENT,
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
    sightLine: {
      margin: 3,
      padding: 0,
    }
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
          <h4 style={styles.itemField}>Life: {currentAgent.life}</h4>
          <h4 style={styles.itemField}>Position: ({currentAgent.position[0]}, {currentAgent.position[1]})</h4>
          <h4 style={styles.itemField}>Sight:</h4>
          {currentSight.map(o => <p style={styles.sightLine} key={o}>{o}</p>)}
        </div>
      )}
    </div>
  );
};

