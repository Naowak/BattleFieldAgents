import React, { useEffect, useState } from 'react';

const Agent = ({ position, team, life }) => {

  // const [currentPosition, setCurrentPosition] = useState(position);

  // useEffect(() => {
  //   const move = () => {
  //     if (position[0] < currentPosition[0]) { setCurrentPosition([currentPosition[0] - 0.1, currentPosition[1], currentPosition[2]]); }
  //     else if (position[0] > currentPosition[0]) { setCurrentPosition([currentPosition[0] + 0.1, currentPosition[1], currentPosition[2]]); }
  //     else if (position[2] < currentPosition[2]) { setCurrentPosition([currentPosition[0], currentPosition[1], currentPosition[2] - 0.1]); }
  //     else if (position[2] > currentPosition[2]) { setCurrentPosition([currentPosition[0], currentPosition[1], currentPosition[2] + 0.1]); }

  //     if (position[0] !== currentPosition[0] || position[2] !== currentPosition[2]) {
  //       setTimeout(() => {
  //         move(position);
  //       }, 500);
  //     }
  //   }

  //   if (position) {
  //     move();
  //   }

  // }, [position]);

  
  return (
    <mesh position={position}>
      <sphereBufferGeometry attach='geometry' args={[0.5, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Agent;
