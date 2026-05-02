import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const TimerNode = ({ id, data }) => {
  const [delay, setDelay] = useState(data?.delay || 1000);
  const [unit, setUnit] = useState(data?.unit || "ms");

  return (
    <BaseNode
      id={id}
      title="Timer"
      icon="&#9202;"
      color="#64748b"
      inputs={[{ id: 'trigger', label: '' }]}
      outputs={[{ id: 'done', label: '' }]}
    >
      <div className="base-node__field-row">
        <div className="base-node__field" style={{ flex: 2 }}>
          <label className="base-node__label">Delay</label>
          <input
            className="base-node__input"
            type="number"
            min={0}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
        </div>
        <div className="base-node__field" style={{ flex: 1 }}>
          <label className="base-node__label">Unit</label>
          <select
            className="base-node__select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="ms">ms</option>
            <option value="s">sec</option>
            <option value="m">min</option>
          </select>
        </div>
      </div>
    </BaseNode>
  );
};
