import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const ConditionalNode = ({ id, data }) => {
  const [operator, setOperator] = useState(data?.operator || '==');

  return (
    <BaseNode
      id={id}
      title="Conditional"
      icon="&#9878;"
      color="#ef4444"
      inputs={[
        { id: 'left', label: '' },
          { id: 'right', label: '' },
      ]}
      outputs={[
        { id: 'true', label: '' },
        { id: 'false', label: '' },
      ]}
    >
      <div className="base-node__field">
        <label className="base-node__label">Operator</label>
        <select
          className="base-node__select"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        >
          <option value="==">Equals (==)</option>
          <option value="!=">Not Equals (!=)</option>
          <option value=">">Greater Than (&gt;)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value=">=">Greater or Equal (&gt;=)</option>
          <option value="<=">Less or Equal (&lt;=)</option>
        </select>
      </div>
      <p className="base-node__description">
        Compares Left and Right inputs using the selected operator.
      </p>
    </BaseNode>
  );
};
