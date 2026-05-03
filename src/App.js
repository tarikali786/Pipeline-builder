import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { Sidebar } from "./sidebar";

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <PipelineToolbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <PipelineUI />
      </div>
    </div>
  );
}

export default App;
