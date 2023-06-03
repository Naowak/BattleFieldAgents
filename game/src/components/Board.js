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
  DEBUG,
} from '../libs/constants';

const BoardTile = ({ position }) => {

  const ref = useRef();
  const { visibleCells } = useContext(GameContext);

  // choose color in function of debug mode and visibility
  const color = visibleCells.find(p => p[0] === position[0] && p[1] === position[1]) && DEBUG ? 
    (position[0] + position[1]) % 2 === 0 ? COLOR_CELL_VISIBLE_1 : COLOR_CELL_VISIBLE_2
    : (position[0] + position[1]) % 2 === 0 ? COLOR_CELL_1 : COLOR_CELL_2;

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

  const tiles = [];
  for (let i = 0; i < 2*BOARD_SIZE+1; i++) {
    for (let j = 0; j < 2*BOARD_SIZE+1; j++) {
      const position = [i * 1 - BOARD_SIZE, j * 1 - BOARD_SIZE];
      tiles.push(<BoardTile key={`${i}-${j}`} position={position} />);
    }
  }

  return <>{tiles}</>;
}
