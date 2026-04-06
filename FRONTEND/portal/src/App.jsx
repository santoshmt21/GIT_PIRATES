import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./Login_page";
import Sign_page from "./Sign_page";
import Home_page from "./Home_page";
import Landing from "./Landing";
import HealthDashboard from "./H_Track.jsx";
import AppointmentBooking from "./Booking.jsx";
import CalendarUI from "./schedule.jsx";
import PatientProfile from "./profile.jsx";
import TextExtractor from "./Upload.jsx";
import BioAge from "./BioAge.jsx";
import ResourceLibrary from "./ResourceLibrary.jsx";

function withNavigation(Page, mapProps = {}) {
  return function RoutedPage() {
    const navigate = useNavigate();
    const props = Object.fromEntries(
      Object.entries(mapProps).map(([key, path]) => [key, () => navigate(path)])
    );

    return <Page {...props} />;
  };
}

const RoutedHealthDashboard = withNavigation(HealthDashboard, {
  onBack: "/home",
  onNavigateToSchedule: "/schedule",
  onNavigateToProfile: "/profile",
  onNavigateToUpload: "/upload",
  onNavigateToBooking: "/booking",
});

const RoutedAppointmentBooking = withNavigation(AppointmentBooking, {
  onNavigateToMain: "/home",
  onNavigateToHealth: "/health",
  onNavigateToUpload: "/upload",
  onNavigateToSchedule: "/schedule",
  onNavigateToProfile: "/profile",
});

const RoutedCalendarUI = withNavigation(CalendarUI, {
  onBack: "/home",
  onNavigateToHealth: "/health",
  onNavigateToProfile: "/profile",
  onNavigateToUpload: "/upload",
  onNavigateToBooking: "/booking",
});

const RoutedPatientProfile = withNavigation(PatientProfile, {
  onBack: "/home",
  onNavigateToHealth: "/health",
  onNavigateToSchedule: "/schedule",
  onNavigateToUpload: "/upload",
  onNavigateToBooking: "/booking",
  onNavigateToMain: "/home",
});

const RoutedTextExtractor = withNavigation(TextExtractor, {
  onBack: "/home",
});

const RoutedBioAge = withNavigation(BioAge, {
  onBack: "/home",
});

const RoutedResourceLibrary = withNavigation(ResourceLibrary, {
  onBack: "/home",
});

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
        <Route path="/health" element={<RoutedHealthDashboard />} />
        <Route path="/upload" element={<RoutedTextExtractor />} />
        <Route path="/library" element={<RoutedResourceLibrary />} />
        <Route path="/bioage" element={<RoutedBioAge />} />
        <Route path="/booking" element={<RoutedAppointmentBooking />} />
        <Route path="/schedule" element={<RoutedCalendarUI />} />
        <Route path="/profile" element={<RoutedPatientProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;