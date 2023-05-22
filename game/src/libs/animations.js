const shake = (ref) => {
  ref.current.position.x += (Math.random() - 0.5) * 0.1;
  ref.current.position.z += (Math.random() - 0.5) * 0.1;
}

const handleShakeItem = (itemId, kind, agents, targets, setAgents, setTargets) => {

  let items = agents;
  let setItems = setAgents;
  if (kind === 'targets') {
    items = targets;
    setItems = setTargets;
  }

  // Find the item in the gameState
  const itemIndex = items.findIndex((item) => item.id === itemId);

  // If the item is found
  if (itemIndex !== -1) {
    let newItems = [...items];
    newItems[itemIndex].shake = true;
    setItems(newItems);

    // Reset shake state after 500ms
    setTimeout(() => {
      newItems = [...items];
      newItems[itemIndex].shake = false;
      setItems(newItems);
    }, 500);
  }
};


export {
  shake,
  handleShakeItem,
};