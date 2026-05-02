import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const APINode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || '');
  const [method, setMethod] = useState(data?.method || 'GET');

  return (
    <BaseNode
      id={id}
      title="API Call"
      icon="&#8633;"
      color="#ec4899"
      inputs={[
        { id: 'headers', label: '' },
        { id: 'body', label: '' },
      ]}
      outputs={[{ id: 'response', label: '' }]}
    >
      <div className="base-node__field">
        <label className="base-node__label">Method</label>
        <select
          className="base-node__select"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div className="base-node__field">
        <label className="base-node__label">URL</label>
        <input
          className="base-node__input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com"
        />
      </div>
    </BaseNode>
  );
};
