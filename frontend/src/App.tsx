import TestStyle from "./pages/TestStyle";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teststyle" element={<TestStyle />} />
      </Routes>
    </Router>
  );
}

export default App;
