import { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, { Controls, Background, MiniMap } from "reactflow";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";
import { InputNode } from "./nodes/inputNode";
import { LLMNode } from "./nodes/llmNode";
import { OutputNode } from "./nodes/outputNode";
import { TextNode } from "./nodes/textNode";
import { APINode } from "./nodes/apiNode";
import { FilterNode } from "./nodes/filterNode";
import { MergeNode } from "./nodes/mergeNode";
import { TimerNode } from "./nodes/timerNode";
import { ConditionalNode } from "./nodes/conditionalNode";

import "reactflow/dist/style.css";

const gridSize = 16;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  api: APINode,
  filter: FilterNode,
  merge: MergeNode,
  timer: TimerNode,
  conditional: ConditionalNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  undo: state.undo,
  redo: state.redo,
  deleteSelected: state.deleteSelected,
  copySelectedNodes: state.copySelectedNodes,
  pasteNodes: state.pasteNodes,
  snapToGrid: state.snapToGrid,
  nodeStatuses: state.nodeStatuses,
  executionLogs: state.executionLogs,
  isRunning: state.isRunning,
  runPipeline: state.runPipeline,
  clearExecutionLogs: state.clearExecutionLogs,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNodePreview, setSelectedNodePreview] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const logsEndRef = useRef(null);

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    deleteSelected,
    copySelectedNodes,
    pasteNodes,
    snapToGrid,
    nodeStatuses,
    executionLogs,
    isRunning,
    runPipeline,
    clearExecutionLogs,
  } = useStore(selector, shallow);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger in input fields
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
        if (e.key === "c") { e.preventDefault(); copySelectedNodes(); }
        if (e.key === "v") { e.preventDefault(); pasteNodes(); }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, deleteSelected, copySelectedNodes, pasteNodes]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [executionLogs]);

  const getInitNodeData = (nodeID, type) => {
    return { id: nodeID, nodeType: `${type}` };
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData("application/reactflow")) {
        const appData = JSON.parse(
          event.dataTransfer.getData("application/reactflow")
        );
        const type = appData?.nodeType;

        if (typeof type === "undefined" || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, addNode, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodePreview(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodePreview(null);
  }, []);

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  // Node validation: find nodes with missing connections
  const getNodeValidation = (node) => {
    const issues = [];
    const nodeEdges = edges.filter(
      (e) => e.source === node.id || e.target === node.id
    );
    const hasInput = edges.some((e) => e.target === node.id);
    const hasOutput = edges.some((e) => e.source === node.id);

    if (node.type !== "customInput" && !hasInput) {
      issues.push("No input connected");
    }
    if (node.type !== "customOutput" && !hasOutput) {
      issues.push("No output connected");
    }
    if (nodeEdges.length === 0) {
      issues.push("Isolated node");
    }
    return issues;
  };

  // Style nodes based on status and validation
  const styledNodes = nodes.map((node) => {
    const status = nodeStatuses[node.id];
    const validation = getNodeValidation(node);
    let className = "";
    if (status === "running") className = "node-running";
    else if (status === "success") className = "node-success";
    else if (status === "error") className = "node-error";
    else if (validation.length > 0) className = "node-warning";

    return { ...node, className };
  });

  return (
    <>
      <div ref={reactFlowWrapper} className="pipeline-canvas">
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          proOptions={proOptions}
          snapToGrid={snapToGrid}
          snapGrid={[gridSize, gridSize]}
          defaultEdgeOptions={{ type: "smoothstep" }}
          connectionLineType="smoothstep"
          deleteKeyCode={null}
        >
          <Background color="#334155" gap={gridSize} />
          <Controls className="pipeline-controls" />
          <MiniMap
            nodeColor={(node) => {
              const status = nodeStatuses[node.id];
              if (status === "running") return "#f59e0b";
              if (status === "success") return "#10b981";
              if (status === "error") return "#ef4444";
              return "#6366f1";
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            style={{
              background: "#1e293b",
              border: "1px solid #234155",
              borderRadius: "8px",
            }}
          />
        </ReactFlow>

        {/* Floating action buttons */}
        <div className="canvas-fab">
          <button className="canvas-fab__btn" onClick={handleFitView} title="Zoom to Fit">
            &#8690;
          </button>
          <button
            className={`canvas-fab__btn ${isRunning ? "canvas-fab__btn--running" : ""}`}
            onClick={runPipeline}
            disabled={isRunning}
            title="Run Pipeline"
          >
            &#9654;
          </button>
          <button
            className={`canvas-fab__btn ${showLogs ? "canvas-fab__btn--active" : ""}`}
            onClick={() => setShowLogs(!showLogs)}
            title="Toggle Logs"
          >
            &#9776;
          </button>
        </div>

        {/* Node Preview Panel */}
        {selectedNodePreview && (
          <div className="preview-panel">
            <div className="preview-panel__header">
              <span>Node Details</span>
              <button className="preview-panel__close" onClick={() => setSelectedNodePreview(null)}>&#10005;</button>
            </div>
            <div className="preview-panel__body">
              <div className="preview-panel__row">
                <span className="preview-panel__label">ID</span>
                <span className="preview-panel__value">{selectedNodePreview.id}</span>
              </div>
              <div className="preview-panel__row">
                <span className="preview-panel__label">Type</span>
                <span className="preview-panel__value">{selectedNodePreview.type}</span>
              </div>
              <div className="preview-panel__row">
                <span className="preview-panel__label">Position</span>
                <span className="preview-panel__value">
                  x: {Math.round(selectedNodePreview.position.x)}, y: {Math.round(selectedNodePreview.position.y)}
                </span>
              </div>
              <div className="preview-panel__row">
                <span className="preview-panel__label">Status</span>
                <span className={`preview-panel__status preview-panel__status--${nodeStatuses[selectedNodePreview.id] || "idle"}`}>
                  {nodeStatuses[selectedNodePreview.id] || "idle"}
                </span>
              </div>
              {(() => {
                const issues = getNodeValidation(selectedNodePreview);
                if (issues.length === 0) return null;
                return (
                  <div className="preview-panel__row">
                    <span className="preview-panel__label">Warnings</span>
                    <div className="preview-panel__warnings">
                      {issues.map((issue, i) => (
                        <span key={i} className="preview-panel__warning">{issue}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {selectedNodePreview.data && Object.entries(selectedNodePreview.data).filter(([k]) => k !== "id" && k !== "nodeType").length > 0 && (
                <>
                  <div className="preview-panel__divider" />
                  <div className="preview-panel__label">Data</div>
                  {Object.entries(selectedNodePreview.data)
                    .filter(([k]) => k !== "id" && k !== "nodeType")
                    .map(([key, val]) => (
                      <div key={key} className="preview-panel__row">
                        <span className="preview-panel__label">{key}</span>
                        <span className="preview-panel__value">{String(val)}</span>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Execution Logs Panel */}
      {showLogs && (
        <div className="logs-panel">
          <div className="logs-panel__header">
            <span>Execution Logs</span>
            <div className="logs-panel__actions">
              <button className="logs-panel__btn" onClick={clearExecutionLogs}>Clear</button>
              <button className="logs-panel__btn" onClick={() => setShowLogs(false)}>&#10005;</button>
            </div>
          </div>
          <div className="logs-panel__body">
            {executionLogs.length === 0 ? (
              <div className="logs-panel__empty">No logs yet. Run a pipeline to see execution logs.</div>
            ) : (
              executionLogs.map((log, i) => (
                <div key={i} className={`logs-panel__entry logs-panel__entry--${log.type}`}>
                  <span className="logs-panel__time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="logs-panel__msg">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </>
  );
};
