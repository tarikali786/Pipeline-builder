export const DraggableNode = ({ type, label, icon, color }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = "grabbing";
    event.target.classList.add("dragging");
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(appData),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = (event) => {
    event.target.style.cursor = "grab";
    event.target.classList.remove("dragging");
  };

  return (
    <div
      className="draggable-node"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={onDragEnd}
      style={{ "--drag-color": color }}
      draggable
    >
      <span className="draggable-node__icon">{icon}</span>
      <span className="draggable-node__label">{label}</span>
    </div>
  );
};
