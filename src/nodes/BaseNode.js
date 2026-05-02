import { Handle, Position } from 'reactflow';

const handleStyle = (index, total) => ({
  top: `${((index + 1) / (total + 1)) * 100}%`,
});

export const BaseNode = ({
  id,
  title,
  icon,
  color = '#6366f1',
  children,
  inputs = [],
  outputs = [],
  minWidth = 240,
  minHeight,
  style = {},
}) => {
  return (
    <div
      className="base-node"
      style={{
        minWidth,
        minHeight,
        '--node-color': color,
        ...style,
      }}
    >
      <div className="base-node__header">
        {icon && <span className="base-node__icon">{icon}</span>}
        <span className="base-node__title">{title}</span>
      </div>

      <div className="base-node__body">{children}</div>

      {inputs.map((input, i) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={`${id}-${input.id}`}
          className="base-node__handle base-node__handle--target"
          style={handleStyle(i, inputs.length)}
        >
          <span className="base-node__handle-label base-node__handle-label--left">
            {input.label}
          </span>
        </Handle>
      ))}

      {outputs.map((output, i) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={`${id}-${output.id}`}
          className="base-node__handle base-node__handle--source"
          style={handleStyle(i, outputs.length)}
        >
          <span className="base-node__handle-label base-node__handle-label--right">
            {output.label}
          </span>
        </Handle>
      ))}
    </div>
  );
};
