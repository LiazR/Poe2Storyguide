import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GuidePage } from "@/pages/GuidePage";
import { HomePage } from "@/pages/HomePage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide/:chapterId" element={<GuidePage />} />
      </Routes>
    </BrowserRouter>
  );
}
