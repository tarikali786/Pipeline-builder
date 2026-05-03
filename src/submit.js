import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);

  const handleSubmit = () => {
    const numNodes = nodes.length;
    const numEdges = edges.length;

    // Check if the graph is a DAG using topological sort (Kahn's algorithm)
    const adj = {};
    const inDegree = {};
    nodes.forEach((n) => {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    });
    edges.forEach((e) => {
      if (adj[e.source]) adj[e.source].push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });
    const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
    let visited = 0;
    while (queue.length > 0) {
      const node = queue.shift();
      visited++;
      (adj[node] || []).forEach((neighbor) => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      });
    }
    const isDag = visited === numNodes;

    alert(
      `Pipeline Analysis\n\n` +
      `Nodes: ${numNodes}\n` +
      `Edges: ${numEdges}\n` +
      `Is DAG: ${isDag ? 'Yes' : 'No'}`
    );
  };

  return (
    <div className="submit-bar">
      <button className="submit-btn" type="button" onClick={handleSubmit}>
        <span>&#9654;</span> Submit Pipeline
      </button>
    </div>
  );
};
  