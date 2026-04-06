import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Loader2,
  Bell,
  Settings,
  Plus,
  ChevronRight,
  Home,
  Heart,
  Upload,
  BookOpen,
  BookUser,
  CreditCard,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import doctorImage from './doctorooo.jpeg';
import doctorImage_1 from './Anya........png';
import doctorImage_3 from './Lufy.png';
import doctorImage_2 from './doctereeeee......png';
import my_consultation from './consultation.png';
import my_consultation1 from './clip_board_resize.png';
import pills from './pills.png';
import tabi from './Tablet.jpg';
import Reports from './Reports.jpg';
import tabu from './Capsule_01.png';
import volunteerImg from './volunteer_2.jpg';
import HealthDashboard from './H_Track.jsx';
import CalendarUI from './schedule.jsx';
import PatientProfile from './profile.jsx';
import TextExtractor from './Upload.jsx';
import BioAge from './BioAge.jsx';
import AppointmentBooking from './Booking.jsx';
import ConsultationChat from './ConsultationChat.jsx';
import ResourceLibrary from './ResourceLibrary.jsx';
import DashboardSidebar from './DashboardSidebar.jsx';


const MourUI = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultations, setConsultations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [activeIcon, setActiveIcon] = useState(0);
  const [currentView, setCurrentView] = useState("main");
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reports Modal State
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  // Medications Modal State
  const [showMedsModal, setShowMedsModal] = useState(false);
  const [medsData, setMedsData] = useState([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [medsError, setMedsError] = useState(null);

  // Add Medication Modal State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [addMedSaving, setAddMedSaving] = useState(false);
  const [addMedForm, setAddMedForm] = useState({
    pill_name: '',
    start_date: '',
    end_date: '',
    duration: '',
    timing_in_day: 'morning',
    medication_for: '',
  });

  // Consultations Modal State
  const [showConsultsModal, setShowConsultsModal] = useState(false);
  const [consultsData, setConsultsData] = useState([]);
  const [consultsLoading, setConsultsLoading] = useState(false);
  const [consultsError, setConsultsError] = useState(null);
  const [chatConsultation, setChatConsultation] = useState(null);

  const defaultProfileData = {
    sex: "Female",
    age: 19,
    height: "168 cm",
    weight: "52 kg",
    bloodType: "B+",
    fitzpatrick: "3rd type"
  };

  const [profileData, setProfileData] = useState(defaultProfileData);

  const scheduleItems = [
    { id: 1, title: "Hirurgy", doctor: "Ann Curgy", color: "bg-red-100", icon: "🏥" },
    { id: 2, title: "Cardiology", doctor: "Alise Prensh", color: "bg-blue-100", icon: "💙" },
    { id: 3, title: "Teraphy", doctor: "Andry Willon", color: "bg-yellow-100", icon: "🧠" },
  ];

  const sidebarIcons = [
    { icon: Home },
    { icon: Heart },
    { icon: Upload },
    { icon: BookOpen },
    { icon: Sparkles },
    { icon: BookUser },
    { icon: CreditCard },
    { icon: User },
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    // Adjusted for Mon-Sun grid (original code used Mon start)
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 (Mon) to 6 (Sun)
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Highlight appointments
  const appointmentsByDay = {};
  consultations.forEach(c => {
    const cDate = new Date(c.consultation_date);
    if (cDate.getUTCMonth() === currentDate.getMonth() && cDate.getUTCFullYear() === currentDate.getFullYear()) {
      const day = cDate.getUTCDate();
      if (!appointmentsByDay[day]) appointmentsByDay[day] = [];
      appointmentsByDay[day].push(c);
    }
  });

  const NavBtn = ({ children, onClick }) => (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition"
    >
      {children}
    </button>
  );

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUserName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");

        console.log('📧 User email:', userEmail);
        console.log('👤 User name:', savedUserName);

        if (savedUserName) {
          setUserName(savedUserName);
        } else {
          setUserName("Guest");
        }

        // Fetch profile data
        if (userEmail) {
          const encodedEmail = encodeURIComponent(userEmail);
          const apiUrl = `http://127.0.0.1:8000/users/profile?gmail=${encodedEmail}`;
          console.log('🔗 Fetching from:', apiUrl);

          const response = await fetch(apiUrl);
          console.log('📊 Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Full API response:', data);
            console.log('Age from API:', data.age);
            console.log('Blood type from API:', data.bloodType);
            setProfileData(data);
            console.log('profileData state updated with:', data);
          } else {
            console.warn('❌ Failed to fetch profile (status:', response.status, ')');
            setProfileData(defaultProfileData);
          }
        } else {
          console.warn('⚠️ No email in localStorage');
          setProfileData(defaultProfileData);
        }

        // Fetch Consultations
        if (userEmail) {
          const encodedEmail = encodeURIComponent(userEmail);
          try {
            const consultResponse = await fetch(`http://127.0.0.1:8000/consultations/?gmail=${encodedEmail}`);
            if (consultResponse.ok) {
              const consultData = await consultResponse.json();
              if (consultData.success) {
                console.log('📅 Home Consultations:', consultData.data);
                setConsultations(consultData.data);
              }
            }
          } catch (cErr) {
            console.error('Error fetching consultations:', cErr);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("💥 Fetch error:", err);
        setUserName("Guest");
        setProfileData(defaultProfileData);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Even if error, try to navigate
      navigate("/login", { replace: true });
    }
  };

  const handleReportsClick = async () => {
    setShowReportsModal(true);
    setReportsLoading(true);
    setReportsError(null);
    setReportsData([]);

    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("User email not found. Please login again.");
      }

      const encodedEmail = encodeURIComponent(userEmail);
      const url = `http://127.0.0.1:8000/reports/?gmail=${encodedEmail}`;
      console.log('Fetching reports from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch reports. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reports data:', data);

      // The API returns an array under the "data" key
      if (data && data.data && Array.isArray(data.data)) {
        setReportsData(data.data);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReportsError(err.message);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleMedicationsClick = async () => {
    setShowMedsModal(true);
    setMedsLoading(true);
    setMedsError(null);
    setMedsData([]);

    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("User email not found. Please login again.");
      }

      const encodedEmail = encodeURIComponent(userEmail);
      const url = `http://127.0.0.1:8000/medications/?gmail=${encodedEmail}`;
      console.log('Fetching medications from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch medications. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Medications data:', data);

      if (Array.isArray(data)) {
        setMedsData(data);
      } else if (data && Array.isArray(data.data)) {
        setMedsData(data.data);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Error fetching medications:", err);
      setMedsError(err.message);
    } finally {
      setMedsLoading(false);
    }
  };

  const handleAddMedChange = (e) => {
    setAddMedForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddMedSave = async () => {
    if (!addMedForm.pill_name.trim()) {
      alert('Please enter a medication name.');
      return;
    }
    setAddMedSaving(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const encodedEmail = encodeURIComponent(userEmail);
      const payload = {
        ...addMedForm,
        duration: addMedForm.duration ? parseInt(addMedForm.duration) : null,
      };
      const res = await fetch(`http://127.0.0.1:8000/medications/?gmail=${encodedEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      // Append to existing list
      if (result.data) {
        setMedsData(prev => [...prev, result.data]);
      }
      setShowAddMedModal(false);
      setAddMedForm({ pill_name: '', start_date: '', end_date: '', duration: '', timing_in_day: 'morning', medication_for: '' });
    } catch (err) {
      alert('Failed to add medication: ' + err.message);
    } finally {
      setAddMedSaving(false);
    }
  };

  const handleConsultationsClick = async () => {
    setShowConsultsModal(true);
    setConsultsLoading(true);
    setConsultsError(null);
    setConsultsData([]);

    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("User email not found. Please login again.");
      }

      const encodedEmail = encodeURIComponent(userEmail);
      const url = `http://127.0.0.1:8000/consultations/?gmail=${encodedEmail}`;
      console.log('Fetching consultations from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch consultations. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Consultations data:', data);

      if (data && data.data && Array.isArray(data.data)) {
        setConsultsData(data.data);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Error fetching consultations:", err);
      setConsultsError(err.message);
    } finally {
      setConsultsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-400 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNavigation = (index) => {
    setActiveIcon(index);
    const routes = ['/home', '/health', '/upload', '/library', '/bioage', '/booking', '/schedule', '/profile'];
    const route = routes[index] || '/home';
    navigate(route);
  };

  const renderView = () => {
    switch (currentView) {
      case 'health':
        return (
          <HealthDashboard
            onBack={() => setCurrentView("main")}
            onNavigateToSchedule={() => setCurrentView('schedule')}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToUpload={() => setCurrentView('upload')}
            onNavigateToBooking={() => setCurrentView('booking')}
          />
        );
      case 'schedule':
        return (
          <CalendarUI
            onBack={() => setCurrentView("main")}
            onNavigateToHealth={() => setCurrentView('health')}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToUpload={() => setCurrentView('upload')}
            onNavigateToBooking={() => setCurrentView('booking')}
          />
        );
      case 'profile':
        return (
          <PatientProfile
            onBack={() => setCurrentView("main")}
            onNavigateToHealth={() => setCurrentView('health')}
            onNavigateToSchedule={() => setCurrentView('schedule')}
            onNavigateToUpload={() => setCurrentView('upload')}
            onNavigateToBooking={() => setCurrentView('booking')}
            onNavigateToMain={() => setCurrentView("main")}
          />
        );
      case 'upload':
        return <TextExtractor onBack={() => setCurrentView("main")} />;
      case 'bioage':
        return <BioAge onBack={() => setCurrentView("main")} />;
      case 'resource_library':
        return <ResourceLibrary onBack={() => setCurrentView("main")} />;
      case 'booking':
        return (
          <AppointmentBooking
            onNavigateToMain={() => setCurrentView("main")}
            onNavigateToHealth={() => setCurrentView('health')}
            onNavigateToUpload={() => setCurrentView('upload')}
            onNavigateToSchedule={() => setCurrentView('schedule')}
            onNavigateToProfile={() => setCurrentView('profile')}
          />
        );
      default:
        return null;
    }
  };

  // Render sub-views with error boundary fallback
  if (currentView !== 'main') {
    try {
      const view = renderView();
      if (view) return view;
    } catch (err) {
      console.error("View render error:", err);
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-red-500 mb-4 font-medium">Something went wrong loading this page.</p>
            <button
              onClick={() => setCurrentView("main")}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6 pl-40 gap-6">

      <DashboardSidebar activePath="/home" />

      {/* MAIN PANEL */}
      <div className="flex-1 bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col h-full">

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-gray-700">{userName}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-w-md mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-5 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition shadow-sm">
              Create an encounter
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex gap-6 p-8 overflow-hidden">

          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-auto">

            {/* PATIENT BANNER */}
            <div className="relative rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <img
                src={tabu}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20"></div>
              <div className="relative flex items-center p-8 gap-8">
                <img
                  src={profileData?.sex?.toLowerCase() === "male" ? doctorImage_3 : doctorImage_1}
                  alt="Patient"
                  className="w-40 h-40 object-cover rounded-3xl flex-shrink-0 bg-gray-200"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Hello, {userName}, here your main indexes:
                  </h2>
                  <div className="grid grid-cols-6 gap-6">
                    <IndexItem label="Sex" value={profileData?.sex || "Female"} />
                    <IndexItem label="Age" value={profileData?.age ? `${profileData.age} y/o` : "19 y/o"} />
                    <IndexItem label="Height" value={profileData?.height || "168 cm"} />
                    <IndexItem label="Weight" value={profileData?.weight || "52 kg"} />
                    <IndexItem label="Blood type" value={profileData?.bloodType || "B+"} />
                    <IndexItem label="Fitzpatrick" value={profileData?.fitzpatrick || "3rd type"} />
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-8 border-b border-gray-100">
              {["info", "chat", "doctor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab
                    ? "border-teal-500 text-gray-800"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab === "doctor" ? "Doctor Page" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* INFO CARDS */}
            <div className="grid grid-cols-3 gap-3 justify-items-start max-w-full">
              <InfoCard
                image={tabi}
                title="Pills schedule"
                subtitle="View your medications"
                onClick={handleMedicationsClick}
                clickable={true}
              />
              <InfoCard
                image={Reports}
                title="My reports"
                subtitle="View your files"
                onClick={handleReportsClick}
                clickable={true}
              />
              <InfoCard
                image={my_consultation1}
                title="My consultation"
                subtitle="View your past consultations"
                onClick={handleConsultationsClick}
                clickable={true}
              />
            </div>

            {/* BOTTOM SECTION */}
            <div className="flex-1 grid grid-cols-[45%_55%] gap-6">

              {/* COMMUNITY CARD */}
              <div className="relative rounded-3xl p-6 flex flex-col shadow-sm border border-teal-100 overflow-hidden min-h-full">
                <img
                  src={volunteerImg}
                  alt="Volunteer Background"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 to-cyan-100/90 hover:from-teal-50/60 hover:to-cyan-100/70 transition-all"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <p className="text-xs uppercase tracking-wider text-teal-700 mb-2 font-bold drop-shadow-sm">Community</p>
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-6 drop-shadow-sm">
                    Join to our<br />medicine volunteer
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                    <CommunityRow label="Place" value="Monday" icon="📍" />
                    <CommunityRow label="Time" value="3 pm" icon="🕒" />
                    <CommunityRow label="Goals" value="help to people" icon="🎯" />
                    <CommunityRow label="Condition" value="be available" icon="✅" />
                  </div>
                  <button className="bg-teal-500 text-white rounded-2xl px-8 py-3 text-sm font-medium hover:bg-teal-600 transition shadow-md mt-auto">
                    Join
                  </button>
                </div>
              </div>

              {/* SCHEDULE LIST */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">View all schedule</h3>
                  <button className="text-2xl text-gray-400 hover:text-gray-600">•••</button>
                </div>
                <div className="space-y-3 flex-1">
                  {consultations
                    .filter(c => new Date(c.consultation_date) >= new Date().setHours(0, 0, 0, 0))
                    .sort((a, b) => new Date(a.consultation_date) - new Date(b.consultation_date))
                    .slice(0, 3)
                    .map((item, index) => {
                      const themes = [
                        { color: "bg-red-100", icon: "🏥" },
                        { color: "bg-blue-100", icon: "💙" },
                        { color: "bg-yellow-100", icon: "🧠" },
                        { color: "bg-green-100", icon: "🌿" },
                        { color: "bg-purple-100", icon: "🧬" },
                      ];
                      const theme = themes[index % themes.length];
                      
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-5 py-4 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 ${theme.color} rounded-2xl flex items-center justify-center text-2xl`}>
                              {item.consultation_type?.toLowerCase().includes('cardio') ? "❤️" : 
                               item.consultation_type?.toLowerCase().includes('therap') ? "🧠" :
                               item.consultation_type?.toLowerCase().includes('lab') ? "🔬" : 
                               theme.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-0.5">
                                {item.consultation_type || item.consult_reason || "Consultation"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.doctor} • {new Date(item.consultation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      );
                    })}
                  {consultations.filter(c => new Date(c.consultation_date) >= new Date().setHours(0, 0, 0, 0)).length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm italic">No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-6">

            {/* CALENDAR */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <NavBtn onClick={handlePrevMonth}>{"<"}</NavBtn>
                  <NavBtn onClick={handleNextMonth}>{">"}</NavBtn>
                </div>
              </div>
              <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-3 font-medium">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm text-center">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="w-10 h-10" />;
                  
                  const date = day;
                  const isSelected = date === selectedDate && 
                                   new Date().getMonth() === currentDate.getMonth() && 
                                   new Date().getFullYear() === currentDate.getFullYear();
                  
                  const hasAppointment = appointmentsByDay[date] && appointmentsByDay[date].length > 0;
                  const isToday = date === new Date().getDate() && 
                                 new Date().getMonth() === currentDate.getMonth() && 
                                 new Date().getFullYear() === currentDate.getFullYear();

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      title={hasAppointment ? appointmentsByDay[date].map(a => `${a.doctor} - ${a.consultation_time}`).join('\n') : ''}
                      className={`w-10 h-10 rounded-xl font-medium transition ${
                        isSelected
                          ? "bg-teal-500 text-white shadow-md scale-105"
                          : hasAppointment
                          ? "bg-pink-100 text-pink-600 border border-pink-200"
                          : "text-gray-700 hover:bg-gray-100"
                      } ${isToday ? "ring-2 ring-teal-200" : ""}`}
                    >
                      {isToday ? "🌸" : date}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DOCTOR IMAGE */}
            <div className="flex-1 rounded-3xl overflow-hidden shadow-lg bg-gray-200">
              <img
                src={doctorImage_2}
                alt="Doctor"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.backgroundColor = '#e5e7eb'; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* REPORTS MODAL */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">My Reports</h2>
              <button
                onClick={() => setShowReportsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {reportsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading your reports...</p>
                </div>
              ) : reportsError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                  <p className="font-medium mb-2">Oops!</p>
                  <p>{reportsError}</p>
                </div>
              ) : reportsData && reportsData.length > 0 ? (
                <div className="space-y-4">
                  {reportsData.map((report) => (
                    <a
                      key={report.id}
                      href={report.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 rounded-2xl border border-gray-100 bg-white hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-teal-700">{report.report_title}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{report.date}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="text-teal-500">🏥</span> {report.hospital_name}</span>
                        <span className="flex items-center gap-1.5"><span className="text-blue-500">👨‍⚕️</span> {report.doctor_name}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📄</div>
                  <p className="text-gray-500 font-medium text-lg">No reports found.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later or upload a new one.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEDICATIONS MODAL */}
      {showMedsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">💊 My Medications</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMedModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-600 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
                <button
                  onClick={() => setShowMedsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {medsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading your medications...</p>
                </div>
              ) : medsError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                  <p className="font-medium mb-2">Oops!</p>
                  <p>{medsError}</p>
                </div>
              ) : medsData && medsData.length > 0 ? (
                <div className="space-y-3">
                  {medsData.map((med, index) => {
                    // Cycle card colors like the reference image
                    const cardStyles = [
                      { bg: "#fffde7", border: "#f9e84a", tagBg: "#fef08a", tagText: "#854d0e", avatarColors: ["#a855f7", "#22c55e"], daysStyle: "bg-yellow-200 text-yellow-800" },
                      { bg: "#eff6ff", border: "#bfdbfe", tagBg: "#dbeafe", tagText: "#1e40af", avatarColors: ["#a855f7", "#22c55e"], daysStyle: "bg-blue-200 text-blue-800" },
                      { bg: "#fff1f2", border: "#fecdd3", tagBg: "#fecdd3", tagText: "#9f1239", avatarColors: ["#22c55e", "#f97316"], daysStyle: "bg-rose-200 text-rose-800" },
                    ];
                    const style = cardStyles[index % cardStyles.length];

                    // Auto-compute status from end_date
                    const today = new Date().toISOString().slice(0, 10);
                    const computedStatus = (med.end_date && med.end_date < today) ? "completed" : "active";
                    const statusVal = computedStatus;
                    const statusStyle =
                      statusVal === "active" ? "bg-green-100 text-green-700" :
                        statusVal === "completed" ? "bg-gray-100 text-gray-600" :
                          "bg-green-100 text-green-700";

                    // Build avatar initials from timing_in_day
                    const timings = (med.timing_in_day || med.frequency || "morning-evening").split("-");
                    const avatar1 = timings[0] ? timings[0][0].toUpperCase() : "M";
                    const avatar2 = timings[1] ? timings[1][0].toUpperCase() : "";

                    return (
                      <div
                        key={med.id ?? index}
                        style={{ backgroundColor: style.bg, borderColor: style.border }}
                        className="rounded-2xl p-5 border"
                      >
                        {/* Row 1: Name + three-dot */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-base">
                              {med.pill_name ?? med.medicine_name ?? med.name ?? "Medication"}
                              {med.dosage ? ` ${med.dosage}` : ""}
                            </h3>
                            <span className="text-gray-400 text-sm">ⓘ</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Status badge */}
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyle}`}>
                              {statusVal === "completed" ? "Completed" : "Active"}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 text-xl leading-none">⋯</button>
                          </div>
                        </div>

                        {/* Row 2: Condition tag */}
                        {(med.medication_for ?? med.condition ?? med.category ?? med.instructions) && (
                          <div className="mb-3">
                            <span
                              style={{ backgroundColor: style.tagBg, color: style.tagText }}
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                            >
                              {med.medication_for ?? med.condition ?? med.category ?? med.instructions}
                            </span>
                          </div>
                        )}

                        {/* Row 3: Avatar circles + days left */}
                        <div className="flex items-center gap-2">
                          {/* Avatar stack */}
                          <div className="flex -space-x-2">
                            {avatar1 && (
                              <div
                                style={{ backgroundColor: style.avatarColors[0] }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white z-10"
                              >
                                {avatar1}
                              </div>
                            )}
                            {avatar2 && (
                              <div
                                style={{ backgroundColor: style.avatarColors[1] }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                              >
                                {avatar2}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-400 font-bold text-sm">+</span>

                          {/* Days left */}
                          {(med.duration ?? med.days_left) != null && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ml-1 ${style.daysStyle}`}>
                              {med.duration ?? med.days_left}
                            </span>
                          )}

                          {/* Doctor name (small) */}
                          {med.doctor_name && (
                            <span className="ml-auto text-xs text-gray-400 italic">Dr. {med.doctor_name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💊</div>
                  <p className="text-gray-500 font-medium text-lg">No medications found.</p>
                  <p className="text-sm text-gray-400 mt-1">Your prescribed medications will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICATION MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">💊 Add New Medication</h2>
              <button onClick={() => setShowAddMedModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition">
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Medication Name *</label>
                <input name="pill_name" value={addMedForm.pill_name} onChange={handleAddMedChange}
                       placeholder="e.g. Paracetamol"
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input type="date" name="start_date" value={addMedForm.start_date} onChange={handleAddMedChange}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input type="date" name="end_date" value={addMedForm.end_date} onChange={handleAddMedChange}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration (days)</label>
                  <input type="number" name="duration" value={addMedForm.duration} onChange={handleAddMedChange}
                         placeholder="Auto-calculated" min="1"
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Timing</label>
                  <select name="timing_in_day" value={addMedForm.timing_in_day} onChange={handleAddMedChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <option value="morning">Morning</option>
                    <option value="morning-evening">Morning & Evening</option>
                    <option value="morning-afternoon-evening">Morning, Afternoon & Evening</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Medication For</label>
                <input name="medication_for" value={addMedForm.medication_for} onChange={handleAddMedChange}
                       placeholder="e.g. fever, infection, vitamin deficiency"
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddMedModal(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleAddMedSave} disabled={addMedSaving}
                      className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-600 disabled:opacity-60 transition shadow-sm">
                {addMedSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {addMedSaving ? 'Adding…' : 'Add Medication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSULTATIONS MODAL */}
      {showConsultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">📋 My Consultations</h2>
              <button
                onClick={() => setShowConsultsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {consultsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading your consultations...</p>
                </div>
              ) : consultsError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                  <p className="font-medium mb-2">Oops!</p>
                  <p>{consultsError}</p>
                </div>
              ) : consultsData && consultsData.length > 0 ? (
                <div className="space-y-4">
                  {consultsData.map((consult) => (
                    <div
                      key={consult.id}
                      className="p-5 rounded-2xl border border-gray-100 bg-white hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">🩺 {consult.consult_reason || "Consultation"}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {consult.consultation_date}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-blue-500">👨‍⚕️</span>
                          <span className="font-medium">Doctor:</span> {consult.doctor}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-teal-500">🕒</span>
                          <span className="font-medium">Time:</span> {consult.consultation_time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 col-span-2">
                          <span className="text-red-500">🏥</span>
                          <span className="font-medium">Hospital:</span> {consult.hospital}
                        </div>
                        {consult.consultation_mode && (
                          <div className="flex items-center gap-2 text-gray-600 col-span-2 capitalize">
                            <span className="text-gray-400">🌐</span>
                            <span className="font-medium">Mode:</span> {consult.consultation_mode}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => setChatConsultation(consult)}
                          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 transition shadow-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat with Doctor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🩺</div>
                  <p className="text-gray-500 font-medium text-lg">No consultations found.</p>
                  <p className="text-sm text-gray-400 mt-1">Your past consultations will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHAT OVERLAY */}
      {chatConsultation && (
        <ConsultationChat
          consultation={chatConsultation}
          onClose={() => setChatConsultation(null)}
          userEmail={localStorage.getItem("userEmail")}
        />
      )}

    </div>
  );
};

const InfoCard = ({ bg, icon, title, subtitle, dark, tall, image, onClick, clickable }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`${image && !imageError ? 'relative' : bg} rounded-3xl p-6 shadow-md border ${dark ? 'border-teal-400' : 'border-gray-100'} min-h-80 w-full max-w-xs overflow-hidden ${clickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group' : ''}`}
    >
      {image && !imageError ? (
        <>
          <img
            src={image}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover ${clickable ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
          <div className="relative flex flex-col h-full justify-end">
            <h3 className="text-sm font-semibold mb-1 text-white">{title}</h3>
            <p className="text-xs text-white/80">{subtitle}</p>
          </div>
        </>
      ) : (
        <>
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-white" : "text-gray-800"}`}>{title}</h3>
          <p className={`text-xs ${dark ? "text-white/80" : "text-gray-500"}`}>{subtitle}</p>
        </>
      )}
    </div>
  );
};

const IndexItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
    <p className="text-base text-gray-800 font-semibold">{value}</p>
  </div>
);

const CommunityRow = ({ label, value, icon }) => (
  <div>
    <p className="text-xs uppercase text-gray-400 mb-1.5">{label}</p>
    <p className="text-sm text-gray-700 font-medium">
      {icon} {value}
    </p>
  </div>
);

const NavBtn = ({ children }) => (
  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 transition">
    {children}
  </button>
);

export default MourUI;