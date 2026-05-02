import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'contains');
  const [value, setValue] = useState(data?.value || '');

  return (
    <BaseNode
      id={id}
      title="Filter"
      icon="&#9783;"
      color="#14b8a6"
      inputs={[{ id: 'data', label: '' }]}
      outputs={[
        { id: 'pass', label: '' },
        { id: 'fail', label: '' },
      ]}
    >
      <div className="base-node__field">
        <label className="base-node__label">Condition</label>
        <select
          className="base-node__select"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="contains">Contains</option>
          <option value="equals">Equals</option>
          <option value="startsWith">Starts With</option>
          <option value="greaterThan">Greater Than</option>
        </select>
      </div>
      <div className="base-node__field">
        <label className="base-node__label">Value</label>
        <input
          className="base-node__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Filter value..."
        />
      </div>
    </BaseNode>
  );
};
