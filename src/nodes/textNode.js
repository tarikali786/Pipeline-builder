import { useState, useEffect, useRef, useMemo } from 'react';
import { BaseNode } from './BaseNode';

const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => {
    const matches = [];
    const seen = new Set();
    let match;
    while ((match = VARIABLE_REGEX.exec(currText)) !== null) {
      if (!seen.has(match[1])) {
        seen.add(match[1]);
        matches.push(match[1]);
      }
    }
    return matches;
  }, [currText]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [currText]);

  const dynamicInputs = variables.map((v) => ({ id: v, label: v }));

  const nodeWidth = Math.max(240, Math.min(currText.length * 3 + 200, 500));

  return (
    <BaseNode
      id={id}
      title="Text"
      icon="&#9998;"
      color="#3b82f6"
      inputs={dynamicInputs}
      outputs={[{ id: '', label: '' }]}
      style={{ width: nodeWidth }}
    >
      <div className="base-node__field">
        <label className="base-node__label">Text</label>
        <textarea
          ref={textareaRef}
          className="base-node__textarea"
          value={currText}
          onChange={(e) => setCurrText(e.target.value)}
          rows={1}
        />
      </div>
      {variables.length > 0 && (
        <div className="base-node__tags">
          {variables.map((v) => (
            <span key={v} className="base-node__tag">{v}</span>
          ))}
        </div>
      )}
    </BaseNode>
  );
};
