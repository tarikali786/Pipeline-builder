import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const MergeNode = ({ id, data }) => {
  const [strategy, setStrategy] = useState(data?.strategy || 'concatenate');

  return (
    <BaseNode
      id={id}
      title="Merge"
      icon="&#8726;"
      color="#f97316"
      inputs={[
        { id: 'input_a', label: '' },
        { id: 'input_b', label: '' },
      ]}
      outputs={[{ id: 'merged', label: '' }]}
    >
      <div className="base-node__field">
        <label className="base-node__label">Strategy</label>
        <select
          className="base-node__select"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        >
          <option value="concatenate">Concatenate</option>
          <option value="interleave">Interleave</option>
          <option value="override">Override (A wins)</option>
        </select>
      </div>
    </BaseNode>
  );
};
