import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';

const Bullet = ({ position, direction }) => {
  const [ref] = useSphere(() => ({ position, mass: 0 }));

  // This hook will animate the bullet each frame
  useFrame((state, delta) => {
    ref.current.position.x += direction[0] * 10 * delta; // Multiply delta with a speed factor
    ref.current.position.y += direction[1] * 10 * delta;
    ref.current.position.z += direction[2] * 10 * delta;
  });

  return (
    <mesh ref={ref}>
      <sphereBufferGeometry attach='geometry' args={[0.1, 16, 16]} />
      <meshStandardMaterial attach='material' color='yellow' />
    </mesh>
  );
};

export default Bullet;