import { useBox } from '@react-three/cannon';
import * as Three from 'three';

const BoardTile = ({ position }) => {
  const [ref] = useBox(() => ({ position, mass: 0 }));

  return (
    <>
      <mesh ref={ref}>
        <boxBufferGeometry attach='geometry' args={[5, 1, 5]} />
        <meshLambertMaterial attach="material" color="lightgrey" />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new Three.BoxBufferGeometry(5, 1, 5)]} />
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
      const position = [i * 5 - 50, -1, j * 5 - 50];
      tiles.push(<BoardTile key={`${i}-${j}`} position={position} />);
    }
  }

  return <>{tiles}</>;
}
