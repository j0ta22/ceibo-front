// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
import Marketplace from "./components/Marketplace";
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <div className="pb-16"> {/* espacio para no tapar con la navbar */}
      <Routes>
        <Route path="/" element={<Navigate to="/profile" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
