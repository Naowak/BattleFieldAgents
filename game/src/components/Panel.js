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
    container: {
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
    panel: {
      width: '80%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: COLOR_BUBBLE_AGENT,
      borderRadius: '5px',
      marginBottom: '20px',
      paddingBottom: 20,
      gap: 10,
    },
    panelTitle: {
      width: '100%',
      padding: '10px',
      marginTop: 15,
      marginBottom: 10,
      backgroundColor: currentAgent.team === 'red' ? COLOR_RED : COLOR_BLUE,
      borderRadius: '5px',
      textAlign: 'center',
    },
    line: {
      width: '90%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      gap: 12,
    },
    itemTitle: {
      fontWeight: 'bold',
      margin: 0,
    },
    itemValue: {
      fontWeight: 400,
      margin: 0,
    },
    messages: {
      width: '90%',
      margin: 3,
      padding: 0,
      fontSize: 16,
      whiteSpace: "pre-line",
      textAlign: currentAgent.messages.length > 0 ? 'left' : 'center',
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
    <div style={styles.container}>
      <h1 style={styles.header}>Game Details</h1>
      
      {/* Turn Details */}
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Turn Details</h2>
        <div style={styles.line}>
          <h4 style={styles.itemTitle}>Current Turn: </h4>
          <h4 style={styles.itemValue}>{turn.current + 1}</h4>
        </div>
        <div style={styles.line}>
          <h4 style={styles.itemTitle}>Actions Done: </h4>
          <h4 style={styles.itemValue}>{turn.actions}/{NB_ACTIONS_PER_TURN}</h4>
        </div>
      </div>
      
      {/* Agent Details */}
      {currentAgent && (
        <div style={styles.panel}>

          {/* Basic infos */}
          <h2 style={styles.panelTitle}>Agent Details</h2>
          <div style={styles.line}>
            <h4 style={styles.itemTitle}>Life: </h4>
            <h4 style={styles.itemValue}>{currentAgent.life}</h4>
          </div>
          <div style={styles.line}>
            <h4 style={styles.itemTitle}>Position: </h4>
            <h4 style={styles.itemValue}>({currentAgent.position[0]}, {currentAgent.position[1]})</h4>
          </div>

          <div style={{height: 12}}/>
          
          {/* Messages, thoughts and actions */}
          <h4 style={styles.itemTitle}>Messages:</h4>
          <p style={styles.messages}>
            {currentAgent.messages.length > 0 ?
              currentAgent.messages.map(m => `- ${m}\n`)
              : 'No message received.\n\n'
            }
          </p>
          <h4 style={styles.itemTitle}>Thoughts & Actions:</h4>
          <p style={styles.thoughts}>
            {currentAgent.thoughts.length > 0 ?
              currentAgent.thoughts.map((t, i) => `${i+1}. ${t}\n\n${currentAgent.actions[i]}\n\n`)
              : 'No thoughts & actions yet.\n\n'
            }
          </p>
        </div>
      )}
    </div>
  );
};

