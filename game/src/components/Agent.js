import { useSphere } from '@react-three/cannon';

const Agent = ({ position, team, life }) => {
  const [ref] = useSphere(() => ({ position, mass: 0 }));

  return (
    <mesh ref={ref}>
      <sphereBufferGeometry attach='geometry' args={[0.5, 32, 64]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Agent;
