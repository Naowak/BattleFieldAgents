const shake = (ref) => {
  ref.current.position.x += (Math.random() - 0.5) * 0.1;
  ref.current.position.z += (Math.random() - 0.5) * 0.1;
}

export {
  shake
};