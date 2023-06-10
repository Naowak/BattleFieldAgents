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
      gap: 20,
      alignItems: 'center',
      backgroundColor: COLOR_BG_PANEL,
      color: COLOR_FONT,
    },
    header: {
      height: '5vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    panelTurn: {
      height: '20vh',
      width: '80%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: COLOR_BUBBLE_AGENT,
      borderRadius: '5px',
      paddingBottom: 20,
      gap: 10,
    },
    // scrollable y panel
    panelAgent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '80%',
      height: '60vh',
      backgroundColor: COLOR_BUBBLE_AGENT,
      borderRadius: 5,
      paddingBottom: 20,
    },
    panelAgentContent: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 10,
      overflowY: 'scroll',
    },
    panelTitle: {
      width: '100%',
      padding: '10px',
      marginTop: 15,
      marginBottom: 10,
      backgroundColor: currentAgent.team === 'red' ? COLOR_RED : COLOR_BLUE,
      borderRadius: 5,
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
    historic: {
      width: '90%',
      margin: 3,
      padding: 0,
      fontSize: 16,
      whiteSpace: "pre-line",
      textAlign: currentAgent.historic.length > 0 ? 'left' : 'center',
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>BattleFieldAgents</h1>
      
      {/* Turn Details */}
      <div style={styles.panelTurn}>
        <h2 style={styles.panelTitle}>Turn Details</h2>
        <div style={styles.line}>
          <h4 style={styles.itemTitle}>Current Turn: </h4>
          <h4 style={styles.itemValue}>{turn.current}</h4>
        </div>
        <div style={styles.line}>
          <h4 style={styles.itemTitle}>Actions Done: </h4>
          <h4 style={styles.itemValue}>{turn.actions}/{NB_ACTIONS_PER_TURN}</h4>
        </div>
      </div>
      
      {/* Agent Details */}
      {currentAgent && (
        <div style={styles.panelAgent}>

          {/* Basic infos */}
          <h2 style={{...styles.panelTitle, marginBottom: 23}}>Agent Details</h2>

          <div style={styles.panelAgentContent}>
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
                currentAgent.messages.map(({ turn, sender, position, message }) => `${sender}: ${message}\nPosition: [${position[0]}, ${position[1]}]\nTurn: ${turn}\n\n`)
                : 'No message received.\n\n'
              }
            </p>
            <h4 style={styles.itemTitle}>Thoughts & Actions:</h4>
            <p style={styles.historic}>
              {currentAgent.historic.length > 0 ?
                currentAgent.historic.map(({ turn, actionNumber, thoughts, action }) => 
                  `${turn+1}.${actionNumber+1}. ${thoughts}\n\n${action}\n\n`
                )
                : 'No thoughts & actions yet.\n\n'
              }
            </p>

          </div>
        </div>
      )}
    </div>
  );
};

