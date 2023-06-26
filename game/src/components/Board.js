import React, { useRef, useContext } from 'react';
import * as Three from 'three';
import { GameContext } from '../contexts/GameContext';
import {
  BOARD_TRANSLATE_Y,
  BOARD_SIZE,
  COLOR_CELL_1,
  COLOR_CELL_2,
  COLOR_CELL_BORDER,
  COLOR_CELL_VISIBLE_1,
  COLOR_CELL_VISIBLE_2,
} from '../libs/constants';

const BoardTile = ({ position, color }) => {

  const ref = useRef();

  return (
    <>
      <mesh ref={ref} position={[position[0], BOARD_TRANSLATE_Y, position[1]]}>
        <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
        <meshLambertMaterial attach="material" color={color} />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new Three.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial attach="material" color={COLOR_CELL_BORDER} linewidth={2} />
        </lineSegments>
      </mesh>
    </>
  );
}

export default function Board() {

  // Retrieve context
  const { visibleCells, agents, turn, debug } = useContext(GameContext);

  // Compute highlighted cells (visible cells + agent sight)
  const hightlightedCells = [
    //...visibleCells, // uncomment to display all visible cells (not only agents & targets)
    ...agents.find(a => a.id === turn.agentId).sight
      .filter(o => ['targets', 'agents'].includes(o.kind))
      .map(o => o.position)
  ]

  // Create board tiles
  const tiles = [];
  for (let i = 0; i < 2*BOARD_SIZE+1; i++) {
    for (let j = 0; j < 2*BOARD_SIZE+1; j++) {

      const position = [i * 1 - BOARD_SIZE, j * 1 - BOARD_SIZE];
      const color = hightlightedCells.find(p => p[0] === position[0] && p[1] === position[1]) && debug ? 
        //(position[0] + position[1]) % 2 === 0 ? COLOR_CELL_VISIBLE_1 : COLOR_CELL_VISIBLE_2
        "#DD9922" // uncomment and decomment above to display all visible cells (not only agents & targets)
        : (position[0] + position[1]) % 2 === 0 ? COLOR_CELL_1 : COLOR_CELL_2;

      tiles.push(<BoardTile key={`${i}-${j}`} position={position} color={color}/>);
    }
  }

  return <>{tiles}</>;
}
