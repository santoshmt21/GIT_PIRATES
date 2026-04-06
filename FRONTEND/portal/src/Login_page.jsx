import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("patient");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.email || !form.password) {
      alert("Please fill in all required fields!");
      return;
    }

    // Create the payload according to the required structure
    const payload = {
      email: form.email,
      password: form.password,
      role: role
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful!");
        // Save user info to localStorage
        if (data.name) {
          localStorage.setItem("userName", data.name);
        }
        // Save email from form input (not from API response)
        localStorage.setItem("userEmail", form.email);
        localStorage.setItem("userRole", role);

        // Navigate to Home_page
        navigate("/home");
        // Clear form
        setForm({ email: "", password: "" });
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)" }}>
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-30 blur-3xl" style={{ background: "#00bcd4" }}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "#0097a7" }}></div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative z-10" style={{ minHeight: "500px" }}>

        {/* Left Illustration */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 60%, #80deea 100%)" }}>

          {/* Floating badge top left */}
          <div className="absolute top-8 left-6 bg-white rounded-2xl shadow-lg p-3 w-36 z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#00bcd4" }}>+</div>
              <span className="text-xs font-semibold text-gray-600">500+ Doctors</span>
            </div>
            <div className="h-1.5 rounded w-full" style={{ background: "#e0f7fa" }}></div>
          </div>

          {/* Floating badge bottom right */}
          <div className="absolute bottom-10 right-4 bg-white rounded-2xl shadow-lg px-4 py-2 z-10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm" style={{ background: "#00bcd4" }}>✓</div>
            <span className="text-xs font-semibold text-gray-600">Trusted Care</span>
          </div>

          {/* Doctor image from Unsplash - reliable */}
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&crop=top"
            alt="Doctor"
            className="w-72 h-72 object-cover rounded-full shadow-2xl border-4 border-white"
          />
        </div>

        {/* Right: Login Form */}
        <div className="w-full max-w-sm flex flex-col justify-center px-10 py-12">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00bcd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span className="text-xl font-bold" style={{ color: "#00bcd4" }}>Medilink</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-1">Hello,</h1>
          <p className="text-gray-400 text-sm mb-7">Welcome back! Please login to continue.</p>

          {/* Role Selector */}
          <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: "#b2ebf2" }}>
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${role === "patient" ? "text-white" : "bg-white text-gray-400"}`}
              style={role === "patient" ? { background: "linear-gradient(135deg, #00bcd4, #0097a7)" } : {}}
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${role === "doctor" ? "text-white" : "bg-white text-gray-400"}`}
              style={role === "doctor" ? { background: "linear-gradient(135deg, #00bcd4, #0097a7)" } : {}}
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Username or email"
                className="w-full outline-none py-2 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-b-2 transition-colors"
                style={{ borderColor: "#b2ebf2" }}
                onFocus={e => e.target.style.borderColor = "#00bcd4"}
                onBlur={e => e.target.style.borderColor = "#b2ebf2"}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full outline-none py-2 text-sm text-gray-700 placeholder-gray-400 bg-transparent pr-12 border-b-2 transition-colors"
                style={{ borderColor: "#b2ebf2" }}
                onFocus={e => e.target.style.borderColor = "#00bcd4"}
                onBlur={e => e.target.style.borderColor = "#b2ebf2"}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-2 text-xs font-semibold" style={{ color: "#00bcd4" }}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="w-4 h-4" style={{ accentColor: "#00bcd4" }} />
                Remember me
              </label>
              <a href="#" className="text-sm font-semibold" style={{ color: "#00bcd4" }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full text-white font-bold text-sm tracking-wide hover:opacity-90 hover:shadow-lg active:scale-95 mt-2 shadow transition-all"
              style={{ background: "linear-gradient(135deg, #00bcd4, #0097a7)" }}
            >
              Login
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-5">
            Don't have an account?{" "}
            {/* <a href="/signup" className="font-bold" style={{ color: "#00bcd4" }}>Sign up</a> */}
            <p className="text-sm text-gray-500 text-center mt-4">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/signup")}
    className="font-bold text-gray-700 hover:text-purple-600 transition-colors cursor-pointer"
  >
    Click here
  </span>
</p>
          </p>
        </div>
      </div>
    </div>
  );
}
