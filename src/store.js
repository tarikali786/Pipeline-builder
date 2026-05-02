import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

const STORAGE_KEY = "pipeline-builder-data";
const HISTORY_LIMIT = 50;

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        nodeIDs: parsed.nodeIDs || {},
      };
    }
  } catch (e) {
    console.warn("Failed to load pipeline from localStorage", e);
  }
  return { nodes: [], edges: [], nodeIDs: {} };
};

const saveToStorage = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      })
    );
  } catch (e) {
    console.warn("Failed to save pipeline to localStorage", e);
  }
};

const saved = loadFromStorage();

export const useStore = create((set, get) => ({
  nodes: saved.nodes,
  edges: saved.edges,
  nodeIDs: saved.nodeIDs,

  // -- History for undo/redo --
  history: [],
  historyIndex: -1,

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex, nodes, edges } = get();
    if (historyIndex < 0) return;
    // Save current state if at the end
    if (historyIndex === history.length - 1) {
      const newHistory = [...history, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      const snapshot = history[historyIndex];
      set({ nodes: snapshot.nodes, edges: snapshot.edges, history: newHistory, historyIndex: historyIndex - 1 });
    } else {
      const snapshot = history[historyIndex];
      set({ nodes: snapshot.nodes, edges: snapshot.edges, historyIndex: historyIndex - 1 });
    }
    saveToStorage(get());
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const snapshot = history[nextIndex];
    if (snapshot) {
      set({ nodes: snapshot.nodes, edges: snapshot.edges, historyIndex: nextIndex });
      saveToStorage(get());
    }
  },

  // -- Clipboard for copy/paste --
  clipboard: null,

  copySelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target)
    );
    set({
      clipboard: {
        nodes: JSON.parse(JSON.stringify(selectedNodes)),
        edges: JSON.parse(JSON.stringify(selectedEdges)),
      },
    });
  },

  pasteNodes: () => {
    const { clipboard, getNodeID } = get();
    if (!clipboard || clipboard.nodes.length === 0) return;
    get().pushHistory();

    const idMap = {};
    const newNodes = clipboard.nodes.map((node) => {
      const newId = getNodeID(node.type);
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
        data: { ...node.data, id: newId },
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));

    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...get().edges, ...newEdges],
    });
    saveToStorage(get());
  },

  // -- Node/edge operations --
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node] });
    saveToStorage(get());
  },

  onNodesChange: (changes) => {
    const hasRemove = changes.some((c) => c.type === "remove");
    if (hasRemove) get().pushHistory();
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    saveToStorage(get());
  },

  onEdgesChange: (changes) => {
    const hasRemove = changes.some((c) => c.type === "remove");
    if (hasRemove) get().pushHistory();
    set({ edges: applyEdgeChanges(changes, get().edges) });
    saveToStorage(get());
  },

  onConnect: (connection) => {
    get().pushHistory();
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.Arrow, height: "20px", width: "20px" },
        },
        get().edges
      ),
    });
    saveToStorage(get());
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, [fieldName]: fieldValue };
        }
        return node;
      }),
    });
    saveToStorage(get());
  },

  // -- Delete selected --
  deleteSelected: () => {
    const { nodes, edges } = get();
    const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    const hasSelected = selectedNodeIds.size > 0 || edges.some((e) => e.selected);
    if (!hasSelected) return;
    get().pushHistory();
    set({
      nodes: nodes.filter((n) => !n.selected),
      edges: edges.filter(
        (e) => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      ),
    });
    saveToStorage(get());
  },

  // -- Clear all --
  clearAll: () => {
    get().pushHistory();
    set({ nodes: [], edges: [], nodeIDs: {} });
    saveToStorage(get());
  },

  // -- Save / Load pipeline --
  savePipeline: (name) => {
    const { nodes, edges, nodeIDs } = get();
    const pipelines = JSON.parse(localStorage.getItem("pipeline-saved-list") || "{}");
    pipelines[name] = { nodes, edges, nodeIDs, savedAt: Date.now() };
    localStorage.setItem("pipeline-saved-list", JSON.stringify(pipelines));
  },

  loadPipeline: (name) => {
    const pipelines = JSON.parse(localStorage.getItem("pipeline-saved-list") || "{}");
    const pipeline = pipelines[name];
    if (!pipeline) return false;
    get().pushHistory();
    set({ nodes: pipeline.nodes, edges: pipeline.edges, nodeIDs: pipeline.nodeIDs || {} });
    saveToStorage(get());
    return true;
  },

  deletePipeline: (name) => {
    const pipelines = JSON.parse(localStorage.getItem("pipeline-saved-list") || "{}");
    delete pipelines[name];
    localStorage.setItem("pipeline-saved-list", JSON.stringify(pipelines));
  },

  getSavedPipelines: () => {
    return JSON.parse(localStorage.getItem("pipeline-saved-list") || "{}");
  },

  // -- Export / Import JSON --
  exportPipeline: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importPipeline: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.nodes || !data.edges) return false;
      get().pushHistory();
      set({ nodes: data.nodes, edges: data.edges });
      saveToStorage(get());
      return true;
    } catch {
      return false;
    }
  },

  // -- Pipeline templates --
  loadTemplate: (template) => {
    get().pushHistory();
    set({ nodes: template.nodes, edges: template.edges, nodeIDs: template.nodeIDs || {} });
    saveToStorage(get());
  },

  // -- Execution state --
  nodeStatuses: {},
  executionLogs: [],
  isRunning: false,

  setNodeStatus: (nodeId, status) => {
    set({ nodeStatuses: { ...get().nodeStatuses, [nodeId]: status } });
  },

  addExecutionLog: (log) => {
    set({ executionLogs: [...get().executionLogs, { ...log, timestamp: Date.now() }] });
  },

  clearExecutionLogs: () => {
    set({ executionLogs: [], nodeStatuses: {} });
  },

  runPipeline: async () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    set({ isRunning: true, executionLogs: [], nodeStatuses: {} });
    get().addExecutionLog({ type: "info", message: "Pipeline execution started" });

    // Topological sort
    const inDegree = {};
    const adj = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
      if (adj[e.source]) adj[e.source].push(e.target);
    });

    const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
    const order = [];
    while (queue.length > 0) {
      const id = queue.shift();
      order.push(id);
      (adj[id] || []).forEach((next) => {
        inDegree[next]--;
        if (inDegree[next] === 0) queue.push(next);
      });
    }

    if (order.length !== nodes.length) {
      get().addExecutionLog({ type: "error", message: "Pipeline has cycles - cannot execute" });
      set({ isRunning: false });
      return;
    }

    for (const nodeId of order) {
      const node = nodes.find((n) => n.id === nodeId);
      get().setNodeStatus(nodeId, "running");
      get().addExecutionLog({ type: "info", message: `Running node: ${node?.type || nodeId}` });

      // Simulate processing
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

      get().setNodeStatus(nodeId, "success");
      get().addExecutionLog({ type: "success", message: `Node ${node?.type || nodeId} completed` });
    }

    get().addExecutionLog({ type: "success", message: "Pipeline execution completed" });
    set({ isRunning: false });
  },

  // -- Snap to grid --
  snapToGrid: true,
  toggleSnapToGrid: () => {
    set({ snapToGrid: !get().snapToGrid });
  },

  // -- Search/filter toolbar nodes --
  toolbarFilter: "",
  setToolbarFilter: (filter) => set({ toolbarFilter: filter }),
}));
