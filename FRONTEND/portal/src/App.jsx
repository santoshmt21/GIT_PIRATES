import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Login_page";
import Sign_page from "./Sign_page";
import Home_page from "./Home_page";
import Landing from "./Landing";

function App() {
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