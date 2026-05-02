import { DraggableNode } from "./draggableNode";
import { SubmitButton } from "./submit";

export const PipelineToolbar = () => {
  return (
    <div className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__logo">&#9670;</span>
        <span className="toolbar__title">Pipeline Builder</span>
      </div>
      <div className="toolbar__nodes">
        <DraggableNode
          type="customInput"
          label="Input"
          icon="&#8615;"
          color="#10b981"
        />
        <DraggableNode type="llm" label="LLM" icon="&#9881;" color="#8b5cf6" />
        <DraggableNode
          type="customOutput"
          label="Output"
          icon="&#8614;"
          color="#f59e0b"
        />
        <DraggableNode
          type="text"
          label="Text"
          icon="&#9998;"
          color="#3b82f6"
        />
        <DraggableNode
          type="api"
          label="API Call"
          icon="&#8633;"
          color="#ec4899"
        />
        <DraggableNode
          type="filter"
          label="Filter"
          icon="&#9783;"
          color="#14b8a6"
        />
        <DraggableNode
          type="merge"
          label="Merge"
          icon="&#8726;"
          color="#f97316"
        />
        <DraggableNode
          type="timer"
          label="Timer"
          icon="&#9202;"
          color="#64748b"
        />
        <DraggableNode
          type="conditional"
          label="Conditional"
          icon="&#9878;"
          color="#ef4444"
        />
      </div>
      <SubmitButton />
    </div>
  );
};
