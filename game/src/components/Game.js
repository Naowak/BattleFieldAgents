import React, { useState } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

// import other necessary components...

const Game = () => {
  const [agents, setAgents] = useState([
    { id: 1, team: 'red', life: 100, position: [1, 0, 0] },
    // add more agents...
  ]);

  const [targets, setTargets] = useState([
    { id: 1, team: 'blue', position: [-1, 0, 0] },
    // add more targets...
  ]);

  const [obstacles, setObstacles] = useState([
    { id: 1, position: [0, 0, 0] },
    // add more obstacles...
  ]);

  return (
    <Canvas style={{ background: "#111111"}}>
      <OrbitControls />
      <Stars />
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 50, 0]} angle={1} />
      <Physics>
        <Board dimensions={[21, 21]}
        />
        {/* Here you can add your agents, targets, and obstacles. */}
        {agents.map(agent => <Agent key={agent.id} position={agent.position} team={agent.team} life={agent.life} />)}
        {targets.map(target => <Target key={target.id} position={target.position} team={target.team} />)}
        {obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      </Physics>
    </Canvas>
  );
};

export default Game;
