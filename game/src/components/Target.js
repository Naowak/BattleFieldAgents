import { useBox } from '@react-three/cannon';

const Target = ({ position, team }) => {
  const [ref] = useBox(() => ({ position, mass: 0 }));

  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Target;
