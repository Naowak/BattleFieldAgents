import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { 
  COLOR_BLUE, 
  COLOR_RED,
  COLOR_BG_PANEL,
  COLOR_BUBBLE_AGENT,
  COLOR_FONT,
  NB_ACTIONS_PER_TURN, 
} from '../libs/constants';


export default function Panel () {

  // Retrieve context
  const { turn, agents } = useContext(GameContext);
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  //const currentSight = sightToText(currentAgent);
  
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
      marginBottom: '40px',
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
      marginTop: 15,
      marginBottom: 10,
      backgroundColor: currentAgent.team === 'red' ? COLOR_RED : COLOR_BLUE,
      borderRadius: '5px',
      textAlign: 'center',
    },
    itemField: {
      width: '100%',
      textAlign: 'center',
      margin: 10,
    },
    thoughts: {
      width: '90%',
      margin: 3,
      padding: 0,
      fontSize: 16,
      whiteSpace: "pre-line",
      textAlign: currentAgent.thoughts.length > 0 ? 'left' : 'center',
    }
  }

  return (
    <div style={styles.panel}>
      <h1 style={styles.header}>Game Details</h1>
      
      <div style={styles.item}>
        <h2 style={styles.itemTitle}>Turn Details</h2>
        <h4 style={styles.itemField}>Current Turn: {turn.current + 1}</h4>
        <h4 style={styles.itemField}>Actions Done: {turn.actions}/{NB_ACTIONS_PER_TURN}</h4>
      </div>
      
      {currentAgent && (
        <div style={styles.item}>
          <h2 style={styles.itemTitle}>Agent Details</h2>
          <h4 style={styles.itemField}>Life: {currentAgent.life}</h4>
          <h4 style={styles.itemField}>Position: ({currentAgent.position[0]}, {currentAgent.position[1]})</h4>
          <h4 style={styles.itemField}>Thoughts & Actions:</h4>
          <p style={styles.thoughts}>
            {currentAgent.thoughts.length > 0 ?
              currentAgent.thoughts.map((t, i) => `${i+1}. ${t}\n\n${currentAgent.actions[i]}\n\n`)
              : 'No thoughts & actions yet\n\n'
            }
          </p>
        </div>
      )}
    </div>
  );
};

