import { useBox } from '@react-three/cannon';

export default function Board () {

  const [ref] = useBox(() => ({ position: [0, -1, 0], mass: 0 }));

  return (
      <mesh ref={ref}>
        <boxBufferGeometry attach='geometry' args={[100, 1, 100]} />
        <meshLambertMaterial attach="material" color="lightgreen" />
      </mesh>
  )
}
