import { useState } from "react";
import { DraggableNode } from "./draggableNode";
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

export const Sidebar = () => {
  const toolbarFilter = useStore((s) => s.toolbarFilter, shallow);
  const [search, setSearch] = useState("");

  const query = search || toolbarFilter || "";
  const filteredNodes = ALL_NODES.filter(
    (n) =>
      !query ||
      n.label.toLowerCase().includes(query.toLowerCase()) ||
      n.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__header-icon">&#9674;</span>
        <span className="sidebar__header-title">Components</span>
        <span className="sidebar__header-count">{filteredNodes.length}</span>
      </div>
      <div className="sidebar__search">
        <input
          className="sidebar__search-input"
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="sidebar__nodes">
        {filteredNodes.map((n) => (
          <DraggableNode key={n.type} type={n.type} label={n.label} icon={n.icon} color={n.color} />
        ))}
        {filteredNodes.length === 0 && (
          <div className="sidebar__empty">No matching nodes</div>
        )}
      </div>
      <div className="sidebar__footer">
        Drag to canvas
      </div>
    </div>
  );
};
