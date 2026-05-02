import { BaseNode } from "./BaseNode";

export const LLMNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      title="LLM"
      icon="&#9881;"
      color="#8b5cf6"
      inputs={[
        { id: "system", label: "" },
        { id: "prompt", label: "" },
      ]}
      outputs={[{ id: "response", label: "" }]}
    >
      <p className="base-node__description">
        Processes input through a large language model and returns the generated
        response.
      </p>
    </BaseNode>
  );
};
