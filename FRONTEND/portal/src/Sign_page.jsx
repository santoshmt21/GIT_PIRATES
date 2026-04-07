import { useState } from "react";
import { Link } from "react-router-dom";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const StethoscopeIllustration = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
    <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", width: "160px", height: "40px", background: "linear-gradient(180deg, #5fd4e3 0%, #00bcd4 100%)", borderRadius: "50%", boxShadow: "0 10px 30px rgba(0,188,212,0.45)" }} />
    <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)", width: "130px", height: "16px", background: "rgba(0,151,167,0.22)", borderRadius: "50%", filter: "blur(8px)" }} />
    <svg viewBox="0 0 120 140" width="140" height="160" style={{ position: "absolute", bottom: "50px" }} fill="none">
      <rect x="30" y="10" width="60" height="8" rx="4" fill="#2d2d2d" />
      <circle cx="30" cy="14" r="7" fill="#3a3a3a" />
      <circle cx="90" cy="14" r="7" fill="#3a3a3a" />
      <path d="M30 21 Q28 55 40 75 Q52 95 60 100" stroke="#2d2d2d" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M90 21 Q92 55 80 75 Q68 95 60 100" stroke="#2d2d2d" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M60 100 Q62 115 60 128" stroke="#2d2d2d" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <circle cx="60" cy="128" r="14" fill="#2d2d2d" />
      <circle cx="60" cy="128" r="9" fill="#0097a7" opacity="0.85"/>
      <circle cx="60" cy="128" r="5" fill="#00bcd4" />
      <circle cx="60" cy="128" r="2" fill="#80deea" />
    </svg>
  </div>
);

export default function MediCareSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient"); // "patient" or "doctor"
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    doctorId: "", hospitalName: ""
  });

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all required fields!");
      return;
    }

    // Create the payload according to the required structure
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully registered as ${role}!`);
        // Reset form
        setFormData({ name: "", email: "", password: "", doctorId: "", hospitalName: "" });
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        .medicare-card { font-family: 'DM Sans', sans-serif; }
        .medicare-title { font-family: 'Playfair Display', serif; }
        .input-field { border: none; border-bottom: 1.5px solid #b2ebf2; outline: none; background: transparent; width: 100%; padding: 13px 2px; font-size: 19px; color: #333; transition: border-color 0.3s; font-family: 'DM Sans', sans-serif; }
        .input-field::placeholder { color: #aaa; font-size: 18px; }
        .input-field:focus { border-bottom-color: #00bcd4; }
        .social-btn { display: flex; align-items: center; gap: 12px; padding: 13px 24px; border: 1.5px solid #d9f3f6; border-radius: 12px; background: white; cursor: pointer; font-size: 18px; color: #444; font-weight: 500; transition: box-shadow 0.2s, border-color 0.2s; white-space: nowrap; }
        .social-btn:hover { border-color: #80deea; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
        .create-btn { width: 100%; padding: 18px; background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); color: white; border: none; border-radius: 14px; font-size: 20px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 18px rgba(0,151,167,0.35); letter-spacing: 0.3px; }
        .create-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,151,167,0.45); }
        .create-btn:active { transform: translateY(0); }
        .role-btn { flex: 1; padding: 13px; border: 1.5px solid #d9f3f6; background: white; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .role-btn.active { background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; border-color: transparent; }
        .role-btn:first-child { border-radius: 8px 0 0 8px; }
        .role-btn:last-child { border-radius: 0 8px 8px 0; }
        .doctor-fields { overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease; }
        .doctor-fields.show { max-height: 240px; opacity: 1; }
        .doctor-fields.hide { max-height: 0; opacity: 0; }
      `}</style>

      <div className="medicare-card" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", maxWidth: "1150px", width: "100%", borderRadius: "31px", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,151,167,0.18), 0 8px 24px rgba(0,0,0,0.1)", background: "white" }}>

        {/* Left panel */}
        <div style={{ background: "linear-gradient(160deg, #d7f4f8 0%, #9de3ed 100%)", padding: "50px 38px 0", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", minHeight: "768px" }}>
          <div style={{ width: "53px", height: "53px", background: "rgba(255,255,255,0.9)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "29px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="#00bcd4"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="#00bcd4" opacity="0.6"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="#00bcd4" opacity="0.6"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="#00bcd4" opacity="0.3"/>
            </svg>
          </div>
          <p style={{ color: "white", fontSize: "23px", lineHeight: "1.7", fontWeight: "400", maxWidth: "264px" }}>
            We at <strong>Medilink</strong> are always fully focused on helping you wit great effort.
          </p>
          <div style={{ flex: 1, position: "relative" }}>
            <StethoscopeIllustration />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ padding: "41px 58px 48px", position: "relative", overflowY: "auto" }}>
          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <span style={{ fontSize: "17px", color: "#888", cursor: "pointer" }}>English(US) ▾</span>
          </div>

          <h2 className="medicare-title" style={{ fontSize: "36px", fontWeight: "600", color: "#1a1a2e", marginBottom: "22px" }}>
            Create Account
          </h2>

          {/* Social buttons */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "22px" }}>
            <button className="social-btn"><GoogleIcon /> Sign up with Google</button>
            <button className="social-btn"><FacebookIcon /> Sign up with Facebook</button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e8e8f0" }} />
            <span style={{ fontSize: "17px", color: "#aaa" }}>–OR–</span>
            <div style={{ flex: 1, height: "1px", background: "#e8e8f0" }} />
          </div>

          {/* ✅ Role Selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "8px" }}>I am a:</label>
            <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #e0e0ec" }}>
              <button
                type="button"
                className={`role-btn ${role === "patient" ? "active" : ""}`}
                onClick={() => setRole("patient")}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                Patient
              </button>
              <button
                type="button"
                className={`role-btn ${role === "doctor" ? "active" : ""}`}
                onClick={() => setRole("doctor")}
                style={{ borderLeft: "1.5px solid #d9f3f6" }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                Doctor
              </button>
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "19px", marginBottom: "22px" }}>
              <div>
                <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "6px" }}>Full Name:</label>
                <input className="input-field" type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "6px" }}>Email:</label>
                <input className="input-field" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "6px" }}>Password:</label>
                <div style={{ position: "relative" }}>
                  <input className="input-field" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" style={{ paddingRight: "28px" }} value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: "2px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "0", fontSize: "17px" }}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* ✅ Doctor-only fields */}
              <div className={`doctor-fields ${role === "doctor" ? "show" : "hide"}`}>
                <div style={{ display: "flex", flexDirection: "column", gap: "19px" }}>
                  <div>
                    <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "6px" }}>Doctor ID:</label>
                    <input
                      className="input-field"
                      type="text"
                      name="doctorId"
                      placeholder="Enter your Doctor ID"
                      value={formData.doctorId}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "17px", color: "#aaa", display: "block", marginBottom: "6px" }}>Hospital Name:</label>
                    <input
                      className="input-field"
                      type="text"
                      name="hospitalName"
                      placeholder="Enter your Hospital Name"
                      value={formData.hospitalName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="create-btn">Create Account</button>
          </form>

          <p style={{ textAlign: "center", marginTop: "19px", fontSize: "18px", color: "#888" }}>
            Already have an Account?{" "}
            <Link to="/login" style={{ color: "#00bcd4", fontWeight: "600", textDecoration: "none" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
