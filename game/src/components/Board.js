import React, { useRef } from 'react';
import * as Three from 'three';

const BoardTile = ({ position }) => {
  const ref = useRef();

  return (
    <>
      <mesh ref={ref} position={[position[0], -1, position[1]]}>
        <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
        <meshLambertMaterial attach="material" color="lightgrey" />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new Three.BoxBufferGeometry(1, 1, 1)]} />
          <lineBasicMaterial attach="material" color="darkgrey" linewidth={2} />
        </lineSegments>
      </mesh>
    </>
  );
}

export default function Board({ dimensions }) {
  const tiles = [];
  for (let i = 0; i < dimensions[0]; i++) {
    for (let j = 0; j < dimensions[1]; j++) {
      const position = [i * 1 - 10, j * 1 - 10];
      tiles.push(<BoardTile key={`${i}-${j}`} position={position} />);
    }
  }

  return <>{tiles}</>;
}
