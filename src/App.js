import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <PipelineToolbar />
      <PipelineUI />
    </div>
  );
}

export default App;
