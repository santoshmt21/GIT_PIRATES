import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Star, MapPin, Bell, Home, Heart, Upload, BookUser, CreditCard, User, Loader2 } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar.jsx';

export default function AppointmentBooking({ 
  onNavigateToMain, 
  onNavigateToHealth, 
  onNavigateToUpload, 
  onNavigateToSchedule, 
  onNavigateToProfile 
}) {
  const [userName, setUserName] = useState("Sarah");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIcon, setActiveIcon] = useState(3); // BookUser icon at index 3

  // Search filter states
  const [filterType, setFilterType] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterExperience, setFilterExperience] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    reason: '',
  });

  const sidebarIcons = [
    { icon: Home },
    { icon: Heart },
    { icon: Upload },
    { icon: BookUser },
    { icon: CreditCard },
    { icon: User },
  ];

  useEffect(() => {
    // Fetch user name if stored
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
    
    // Fetch doctors
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/consultation_booking/");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDoctors(result.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    // Reset form
    setBookingForm({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      reason: '',
    });
  };

  const handleSaveBooking = async () => {
    if (!bookingForm.date || !bookingForm.time) {
      alert("Please select both date and time.");
      return;
    }

    setBookingSaving(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("User email not found. Please login again.");
        return;
      }

      const payload = {
        consult_reason: bookingForm.reason,
        consultation_date: bookingForm.date,
        consultation_time: bookingForm.time,
        doctor: selectedDoctor.doctor_name,
        hospital: selectedDoctor.city + " Health Center", // Defaulting as example
        consultation_mode: selectedDoctor.mode.toLowerCase() === 'both' ? 'online' : selectedDoctor.mode.toLowerCase(),
        consultation_type: selectedDoctor.doctor_type.toLowerCase()
      };

      const encodedEmail = encodeURIComponent(userEmail);
      const url = `http://127.0.0.1:8000/consultations/?gmail=${encodedEmail}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Consultation booked successfully!");
        setShowBookingModal(false);
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to book consultation");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error: " + err.message);
    } finally {
      setBookingSaving(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6 pl-40 gap-6">
      <DashboardSidebar activePath="/booking" />

      <div className="flex-1 bg-white rounded-3xl shadow-lg p-8 overflow-y-auto h-full">
      {/* Hero / Filter Block */}
      <div className="bg-[#f3f4f6] p-8 rounded-3xl mb-12 shadow-sm relative">
        <p className="text-gray-600 font-medium mb-8 max-w-xl text-[15px] leading-relaxed">
          Find the best psychologist for yourself! Our specialists will help you to find the best decisions for solving your problems!
        </p>
        
        <div className="flex flex-wrap md:flex-nowrap items-center bg-white p-2.5 rounded-2xl shadow-md border border-gray-100">
          <div className="flex-1 px-5 py-2 border-r border-gray-100 min-w-[140px]">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">Type of counseling</label>
            <div className="relative">
              <select 
                className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All types</option>
                {[...new Set(doctors.map(d => d.doctor_type))].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 px-5 py-2 border-r border-gray-100 min-w-[140px]">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">City</label>
            <div className="relative">
              <select 
                className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {[...new Set(doctors.map(d => d.city))].map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 px-5 py-2 border-r border-gray-100 min-w-[140px]">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">Experience</label>
            <div className="relative">
              <select 
                className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
              >
                <option value="All">Any Experience</option>
                <option value="0-5">0 - 5 Years</option>
                <option value="5-10">5 - 10 Years</option>
                <option value="10+">10+ Years</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 px-5 py-2 min-w-[140px]">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">Mode</label>
            <div className="relative">
              <select 
                className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
              >
                <option value="All">Any Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          {/* Decorative Search Button (Filtering is real-time above) */}
          <button className="bg-[#e0e7ff] hover:bg-[#c7d2fe] transition p-4 rounded-xl ml-2 flex-shrink-0">
            <Search className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Filter Application Logic */}
      {(() => {
        const filteredDoctors = doctors.filter(doc => {
          if (filterType !== 'All' && doc.doctor_type !== filterType) return false;
          if (filterCity !== 'All' && doc.city !== filterCity) return false;
          
          if (filterExperience !== 'All') {
            if (filterExperience === '0-5' && doc.experience_years > 5) return false;
            if (filterExperience === '5-10' && (doc.experience_years <= 5 || doc.experience_years > 10)) return false;
            if (filterExperience === '10+' && doc.experience_years <= 10) return false;
          }
          
          if (filterMode !== 'All' && doc.mode !== filterMode && doc.mode !== 'Both') return false;
          
          return true;
        });
        
        return (
          <>
            {/* Best For You Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-[22px] font-bold text-[#374151]">Best for you</h2>
                <span className="bg-[#e5e7eb] text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{filteredDoctors.length}</span>
              </div>
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-[#e5e7eb] px-5 py-2 rounded-full hover:bg-gray-300 transition">
                See all
                <span className="text-lg leading-none mb-0.5">›</span>
              </button>
            </div>

            {/* Doctor Cards Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-500 font-medium">No doctors found matching your criteria.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition duration-300">
            {/* Header Info */}
            <div className="flex items-start gap-4 mb-5">
              <div className="pt-1">
                <h3 className="font-bold text-[17px] text-[#1f2937] leading-tight">{doc.doctor_name}</h3>
                <p className="text-xs font-medium text-gray-400 mt-1.5">{doc.specialization}</p>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`flex items-center gap-1 ${doc.rating >= 4.5 ? 'bg-green-500' : 'bg-yellow-500'} text-white px-2 py-1 rounded-md text-xs font-bold`}>
                <Star className="w-3.5 h-3.5 fill-current" />
                {Number(doc.rating).toFixed(1)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {doc.city}, {doc.country}
              </div>
            </div>
            
            {/* Experience */}
            <div className="mb-6 space-y-1">
              <p className="text-xs font-medium text-gray-500">{doc.experience_years} yrs of exp.</p>
              <p className="text-xs font-medium text-gray-500">Mode: {doc.mode}</p>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-[#f3f4f6] text-gray-500 font-medium text-[11px] px-3.5 py-1.5 rounded-full whitespace-nowrap">
                {doc.doctor_type}
              </span>
            </div>
            
            {/* Footer Info & Button */}
            <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50">
              <div className="pr-4">
                <p className="font-bold text-[17px] text-[#1f2937]">${doc.consultation_fee}<span className="text-[13px] text-gray-400 font-medium">/h</span></p>
                <p className="text-[11px] font-medium text-gray-400 mt-1">{doc.mode}</p>
              </div>
              <button 
                onClick={() => handleBookClick(doc)}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition shadow-sm whitespace-nowrap"
              >
                Book Consultation
              </button>
            </div>
          </div>
              ))}
            </div>
            )}
          </>
        );
      })()}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Book Consultation</h2>
                <p className="text-blue-50 text-xs font-medium mt-0.5">With {selectedDoctor?.doctor_name}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Date</label>
                  <input 
                    type="date" 
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Time</label>
                  <input 
                    type="time" 
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Consultation</label>
                <textarea 
                  placeholder="Tell us about your problem..."
                  rows="3"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({...bookingForm, reason: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                />
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium whitespace-nowrap">Consultation Fee</span>
                  <span className="text-[#3b82f6] font-bold">${selectedDoctor?.consultation_fee}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBooking}
                disabled={bookingSaving}
                className="flex-[3] px-8 py-3.5 bg-[#3b82f6] text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {bookingSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}