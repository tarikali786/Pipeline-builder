import { useState } from "react";
import { DraggableNode } from "./draggableNode";
import { SubmitButton } from "./submit";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

const ALL_NODES = [
  { type: "customInput", label: "Input", icon: "\u2197", color: "#10b981" },
  { type: "llm", label: "LLM", icon: "\u2699", color: "#8b5cf6" },
  { type: "customOutput", label: "Output", icon: "\u2196", color: "#f59e0b" },
  { type: "text", label: "Text", icon: "\u270E", color: "#3b82f6" },
  { type: "api", label: "API Call", icon: "\u21B9", color: "#ec4899" },
  { type: "filter", label: "Filter", icon: "\u2637", color: "#14b8a6" },
  { type: "merge", label: "Merge", icon: "\u2216", color: "#f97316" },
  { type: "timer", label: "Timer", icon: "\u23F2", color: "#64748b" },
  { type: "conditional", label: "Conditional", icon: "\u2696", color: "#ef4444" },
];

const TEMPLATES = [
  {
    name: "Simple LLM Pipeline",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 100, y: 200 }, data: { id: "customInput-1", nodeType: "customInput" } },
      { id: "llm-1", type: "llm", position: { x: 400, y: 200 }, data: { id: "llm-1", nodeType: "llm" } },
      { id: "customOutput-1", type: "customOutput", position: { x: 700, y: 200 }, data: { id: "customOutput-1", nodeType: "customOutput" } },
    ],
    edges: [
      { id: "e-1", source: "customInput-1", sourceHandle: "customInput-1-value", target: "llm-1", targetHandle: "llm-1-prompt", type: "smoothstep", animated: true },
      { id: "e-2", source: "llm-1", sourceHandle: "llm-1-response", target: "customOutput-1", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
    nodeIDs: { customInput: 1, llm: 1, customOutput: 1 },
  },
  {
    name: "Filter + Merge",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 100, y: 150 }, data: { id: "customInput-1", nodeType: "customInput" } },
      { id: "filter-1", type: "filter", position: { x: 400, y: 150 }, data: { id: "filter-1", nodeType: "filter" } },
      { id: "merge-1", type: "merge", position: { x: 700, y: 150 }, data: { id: "merge-1", nodeType: "merge" } },
      { id: "customOutput-1", type: "customOutput", position: { x: 1000, y: 150 }, data: { id: "customOutput-1", nodeType: "customOutput" } },
    ],
    edges: [
      { id: "e-1", source: "customInput-1", sourceHandle: "customInput-1-value", target: "filter-1", targetHandle: "filter-1-data", type: "smoothstep", animated: true },
      { id: "e-2", source: "filter-1", sourceHandle: "filter-1-pass", target: "merge-1", targetHandle: "merge-1-input_a", type: "smoothstep", animated: true },
      { id: "e-3", source: "merge-1", sourceHandle: "merge-1-merged", target: "customOutput-1", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
    nodeIDs: { customInput: 1, filter: 1, merge: 1, customOutput: 1 },
  },
  {
    name: "API + Conditional",
    nodes: [
      { id: "api-1", type: "api", position: { x: 100, y: 200 }, data: { id: "api-1", nodeType: "api" } },
      { id: "conditional-1", type: "conditional", position: { x: 450, y: 200 }, data: { id: "conditional-1", nodeType: "conditional" } },
      { id: "customOutput-1", type: "customOutput", position: { x: 800, y: 100 }, data: { id: "customOutput-1", nodeType: "customOutput" } },
      { id: "customOutput-2", type: "customOutput", position: { x: 800, y: 300 }, data: { id: "customOutput-2", nodeType: "customOutput" } },
    ],
    edges: [
      { id: "e-1", source: "api-1", sourceHandle: "api-1-response", target: "conditional-1", targetHandle: "conditional-1-left", type: "smoothstep", animated: true },
      { id: "e-2", source: "conditional-1", sourceHandle: "conditional-1-true", target: "customOutput-1", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
      { id: "e-3", source: "conditional-1", sourceHandle: "conditional-1-false", target: "customOutput-2", targetHandle: "customOutput-2-value", type: "smoothstep", animated: true },
    ],
    nodeIDs: { api: 1, conditional: 1, customOutput: 2 },
  },
];

export const PipelineToolbar = () => {
  const {
    toolbarFilter,
    undo,
    redo,
    deleteSelected,
    clearAll,
    copySelectedNodes,
    pasteNodes,
    savePipeline,
    loadPipeline,
    deletePipeline,
    getSavedPipelines,
    exportPipeline,
    importPipeline,
    loadTemplate,
    snapToGrid,
    toggleSnapToGrid,
  } = useStore(
    (s) => ({
      toolbarFilter: s.toolbarFilter,
      undo: s.undo,
      redo: s.redo,
      deleteSelected: s.deleteSelected,
      clearAll: s.clearAll,
      copySelectedNodes: s.copySelectedNodes,
      pasteNodes: s.pasteNodes,
      savePipeline: s.savePipeline,
      loadPipeline: s.loadPipeline,
      deletePipeline: s.deletePipeline,
      getSavedPipelines: s.getSavedPipelines,
      exportPipeline: s.exportPipeline,
      importPipeline: s.importPipeline,
      loadTemplate: s.loadTemplate,
      snapToGrid: s.snapToGrid,
      toggleSnapToGrid: s.toggleSnapToGrid,
    }),
    shallow
  );

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [saveName, setSaveName] = useState("");

  const filteredNodes = ALL_NODES.filter(
    (n) =>
      !toolbarFilter ||
      n.label.toLowerCase().includes(toolbarFilter.toLowerCase()) ||
      n.type.toLowerCase().includes(toolbarFilter.toLowerCase())
  );

  const handleSave = () => {
    if (!saveName.trim()) return;
    savePipeline(saveName.trim());
    setSaveName("");
    setShowSaveModal(false);
  };

  const handleLoad = (name) => {
    loadPipeline(name);
    setShowLoadModal(false);
  };

  const handleExport = () => {
    const json = exportPipeline();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipeline.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importPipeline(ev.target.result);
        if (!success) alert("Invalid pipeline file");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportImage = () => {
    const canvas = document.querySelector(".react-flow__viewport");
    if (!canvas) return;
    import("html-to-image").then(({ toPng }) => {
      toPng(canvas, { backgroundColor: "#0f172a" }).then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "pipeline.png";
        a.click();
      }).catch(() => {
        alert("Failed to export image. Make sure html-to-image is installed.");
      });
    }).catch(() => {
      alert("Install html-to-image: npm install html-to-image");
    });
  };

  const savedPipelines = showLoadModal ? getSavedPipelines() : {};

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__brand">
          <span className="toolbar__logo">&#9670;</span>
          <span className="toolbar__title">Pipeline Builder</span>
        </div>

        {/* <div className="toolbar__search">
          <input
            className="toolbar__search-input"
            type="text"
            placeholder="Search nodes..."
            value={toolbarFilter}
            onChange={(e) => setToolbarFilter(e.target.value)}
          />
        </div> */}

        <div className="toolbar__nodes">
          {filteredNodes.map((n) => (
            <DraggableNode key={n.type} type={n.type} label={n.label} icon={n.icon} color={n.color} />
          ))}
        </div>

        <div className="toolbar__actions">
          <button className="toolbar__btn" onClick={undo} title="Undo (Ctrl+Z)">&#8630;</button>
          <button className="toolbar__btn" onClick={redo} title="Redo (Ctrl+Y)">&#8631;</button>
          <span className="toolbar__separator" />
          <button className="toolbar__btn" onClick={copySelectedNodes} title="Copy (Ctrl+C)">&#9776;</button>
          <button className="toolbar__btn" onClick={pasteNodes} title="Paste (Ctrl+V)">&#10066;</button>
          <button className="toolbar__btn toolbar__btn--danger" onClick={deleteSelected} title="Delete Selected (Del)">&#10005;</button>
          <span className="toolbar__separator" />
          <button className="toolbar__btn" onClick={() => setShowSaveModal(true)} title="Save Pipeline">&#128190;</button>
          <button className="toolbar__btn" onClick={() => setShowLoadModal(true)} title="Load Pipeline">&#128194;</button>
          <button className="toolbar__btn" onClick={handleExport} title="Export JSON">&#8681;</button>
          <button className="toolbar__btn" onClick={handleImport} title="Import JSON">&#8679;</button>
          <button className="toolbar__btn" onClick={handleExportImage} title="Export as Image">&#128247;</button>
          <span className="toolbar__separator" />
          <button className="toolbar__btn" onClick={() => setShowTemplateModal(true)} title="Templates">&#9733;</button>
          <button
            className={`toolbar__btn ${snapToGrid ? "toolbar__btn--active" : ""}`}
            onClick={toggleSnapToGrid}
            title="Toggle Snap to Grid"
          >
            &#9638;
          </button>
          <button className="toolbar__btn toolbar__btn--danger" onClick={() => { if (window.confirm("Clear entire pipeline?")) clearAll(); }} title="Clear All">&#9888;</button>
        </div>

        <SubmitButton />
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">Save Pipeline</div>
            <div className="modal__body">
              <input
                className="modal__input"
                type="text"
                placeholder="Pipeline name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
            <div className="modal__footer">
              <button className="modal__btn modal__btn--secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="modal__btn modal__btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">Load Pipeline</div>
            <div className="modal__body">
              {Object.keys(savedPipelines).length === 0 ? (
                <p className="modal__empty">No saved pipelines</p>
              ) : (
                <div className="modal__list">
                  {Object.entries(savedPipelines).map(([name, data]) => (
                    <div key={name} className="modal__list-item">
                      <div className="modal__list-info">
                        <span className="modal__list-name">{name}</span>
                        <span className="modal__list-meta">
                          {data.nodes?.length || 0} nodes &middot; {new Date(data.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="modal__list-actions">
                        <button className="modal__btn modal__btn--primary modal__btn--sm" onClick={() => handleLoad(name)}>Load</button>
                        <button className="modal__btn modal__btn--danger modal__btn--sm" onClick={() => { deletePipeline(name); setShowLoadModal(false); setTimeout(() => setShowLoadModal(true), 0); }}>&#10005;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="modal__btn modal__btn--secondary" onClick={() => setShowLoadModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">Pipeline Templates</div>
            <div className="modal__body">
              <div className="modal__list">
                {TEMPLATES.map((tpl) => (
                  <div key={tpl.name} className="modal__list-item">
                    <div className="modal__list-info">
                      <span className="modal__list-name">{tpl.name}</span>
                      <span className="modal__list-meta">{tpl.nodes.length} nodes &middot; {tpl.edges.length} edges</span>
                    </div>
                    <button className="modal__btn modal__btn--primary modal__btn--sm" onClick={() => { loadTemplate(tpl); setShowTemplateModal(false); }}>Use</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal__footer">
              <button className="modal__btn modal__btn--secondary" onClick={() => setShowTemplateModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
