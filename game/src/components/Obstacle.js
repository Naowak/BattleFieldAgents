import { useBox } from '@react-three/cannon';

const Obstacle = ({ position }) => {
  const [ref] = useBox(() => ({ position, mass: 0 }));

  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color='gray' />
    </mesh>
  );
};

export default Obstacle;
