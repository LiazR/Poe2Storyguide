import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GuidePage } from "@/pages/GuidePage";
import { HomePage } from "@/pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide/:chapterId" element={<GuidePage />} />
      </Routes>
    </BrowserRouter>
  );
}
