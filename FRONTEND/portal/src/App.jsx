import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Login_page";
import Sign_page from "./Sign_page";
import Home_page from "./Home_page";
import Landing from "./Landing";
import { useMouseTracker } from "./hooks/useMouseTracker";

function App() {
  useMouseTracker({
    onImageReady: async (dataURL) => {
      console.log("Mouse art generated, saving to backend (10-min interval)");
      try {
        const userEmail = localStorage.getItem("userEmail") || "anonymous";
        // Use the user's integration endpoint here.
        const response = await fetch("http://127.0.0.1:8000/mouse_art/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, image_data: dataURL }),
        });

        if (response.ok) {
          console.log("Mouse art successfully saved!");
        } else {
          console.error("Failed to save mouse art:", response.status);
        }
      } catch (error) {
        console.error("Error saving mouse art:", error);
      }
    }
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Sign_page />} />

        {/* Home Dashboard */}
        <Route path="/home" element={<Home_page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;