const shake = (ref) => {
  ref.current.position.x += (Math.random() - 0.5) * 0.1;
  ref.current.position.z += (Math.random() - 0.5) * 0.1;
}

const handleShakeItem = (itemId, kind, gameState, setGameState) => {
  // Find the item in the gameState
  const itemIndex = gameState[kind].findIndex((item) => item.id === itemId);

  // If the item is found
  if (itemIndex !== -1) {
    let newGameState = { ...gameState };
    newGameState[kind][itemIndex].shake = true;
    setGameState(newGameState);

    // Reset shake state after 500ms
    setTimeout(() => {
      newGameState = { ...gameState };
      newGameState[kind][itemIndex].shake = false;
      setGameState(newGameState);
    }, 500);
  }
};


export {
  shake,
  handleShakeItem,
};