import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Bell, User, Plus, Clock, X, ChevronDown, Home, Heart, Upload, BookUser, CreditCard } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar.jsx';

const CalendarUI = ({ onBack, onNavigateToHealth, onNavigateToProfile, onNavigateToUpload, onNavigateToBooking }) => {
  const todayDate = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [showFilters, setShowFilters] = useState(true);
  const [activeIcon, setActiveIcon] = useState(4);
  const [filters, setFilters] = useState({
    doctorVisits: true,
    labTests: true,
    dentalAppts: true,
    therapy: true,
    imaging: true,
    followUps: true
  });
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const encodedEmail = encodeURIComponent(userEmail);
        const url = `http://127.0.0.1:8000/consultations/?gmail=${encodedEmail}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && Array.isArray(data.data)) {
            setConsultations(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch consultations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const sidebarIcons = [
    { icon: Home },
    { icon: Heart },
    { icon: Upload },
    { icon: BookUser },
    { icon: CreditCard },
    { icon: User },
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let weeks = [];
    let currentWeek = Array(7).fill(null);
    let currentDayOfWeek = firstDay;
    
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek[currentDayOfWeek] = day;
      currentDayOfWeek++;
      if (currentDayOfWeek === 7) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
        currentDayOfWeek = 0;
      }
    }
    if (currentDayOfWeek > 0) weeks.push(currentWeek);
    return weeks;
  };

  const calendarDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="h-screen bg-gray-50 flex p-6 pl-40 gap-6">
      <DashboardSidebar activePath="/schedule" />

      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col">
        {/* Mini Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((week, weekIdx) => (
              <React.Fragment key={weekIdx}>
                {week.map((day, dayIdx) => {
                  const isToday = day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear();
                  const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer
                        ${!day ? 'invisible' : ''}
                        ${isSelected ? 'bg-teal-500 text-white font-semibold' : ''}
                        ${day && !isSelected && isToday ? 'bg-teal-100 text-teal-700 font-semibold' : ''}
                        ${day && !isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
                      `}
                    >
                      {day}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Appointment Reminder Card */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-4 mb-6 text-white">
          <div className="text-xs mb-1 opacity-90">Upcoming Appointment</div>
          <h3 className="font-semibold mb-2">Cardiology Consultation</h3>
          <div className="flex items-center gap-1 text-sm mb-3">
            <Clock className="w-4 h-4" />
            <span>09:00 - 09:30 AM</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-pink-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-red-300 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-white flex items-center justify-center text-xs font-semibold">+2</div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-700" />
              </button>
              <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <div className="space-y-2">
              {Object.entries(filters).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setFilters({...filters, [key]: !value})}
                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Other Calendars */}
        <div>
          <button className="flex items-center justify-between w-full font-semibold text-gray-800">
            <span>Other Calendars</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {monthNames[selectedDate.getMonth()]}, {selectedDate.getDate()} {selectedDate.getFullYear()}
              </h1>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button className="px-4 py-1.5 text-sm text-gray-600 hover:bg-white rounded-md">Daily</button>
                <button className="px-4 py-1.5 text-sm bg-white text-gray-900 rounded-md shadow-sm font-medium">Weekly</button>
                <button className="px-4 py-1.5 text-sm text-gray-600 hover:bg-white rounded-md">Monthly</button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium">
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="grid grid-cols-4 gap-4 p-6 min-h-64">
            {loading ? (
              <div className="col-span-4 flex items-center justify-center p-12 text-gray-400">Loading consultations...</div>
            ) : (
              [0, 1, 2, 3].map((offset) => {
                const colDate = new Date(selectedDate);
                colDate.setDate(colDate.getDate() + offset);
                
                const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][colDate.getDay()];
                const dateString = `${colDate.getFullYear()}-${String(colDate.getMonth() + 1).padStart(2, '0')}-${String(colDate.getDate()).padStart(2, '0')}`;
                
                // Filter consultations for this date AND apply left sidebar filters
                const dayConsultations = consultations.filter(c => {
                  if (c.consultation_date !== dateString) return false;
                  
                  const reason = (c.consult_reason || c.consultation_reason || "").toLowerCase();
                  let show = false;
                  
                  if (filters.doctorVisits && (reason.includes("checkup") || reason.includes("general") || reason.includes("fever") || reason.includes("consult") || reason.includes("skin"))) show = true;
                  if (filters.labTests && (reason.includes("blood") || reason.includes("test") || reason.includes("lab"))) show = true;
                  if (filters.dentalAppts && (reason.includes("dental") || reason.includes("tooth"))) show = true;
                  if (filters.therapy && (reason.includes("therapy") || reason.includes("session"))) show = true;
                  if (filters.imaging && (reason.includes("x-ray") || reason.includes("imaging") || reason.includes("scan"))) show = true;
                  if (filters.followUps && (reason.includes("follow") || reason.includes("review"))) show = true;
                  if (!reason) show = true; 
                  
                  // fallback: if no direct keywords matched but the generic doctorVisits is on
                  if (!show && filters.doctorVisits) show = true; 
                  
                  return show;
                });

                return (
                  <div key={offset} className="flex flex-col">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-500">{dayName}</div>
                      <div className="text-2xl font-semibold text-gray-800">{colDate.getDate()}</div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      {dayConsultations.length > 0 ? (
                        dayConsultations.map((consult, i) => {
                          // Pastel shade cycler for dynamic cards
                          const colors = [
                            "bg-[#fecdd3] border border-[#fca5a5] text-red-900", // Soft Pink/Red
                            "bg-[#bfdbfe] border border-[#93c5fd] text-blue-900", // Soft Blue
                            "bg-[#bbf7d0] border border-[#86efac] text-green-900", // Soft Green
                            "bg-[#fef08a] border border-[#fde047] text-yellow-900", // Soft Yellow
                            "bg-[#e9d5ff] border border-[#d8b4fe] text-purple-900"  // Soft Purple
                          ];
                          const colorCls = colors[(i + offset) % colors.length];

                          return (
                            <div key={consult.id || i} className={`${colorCls} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                              {/* Background overlay on hover */}
                              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              <div className="relative z-10">
                                <h3 className="font-bold text-sm mb-1 line-clamp-2">
                                  {consult.consult_reason || consult.consultation_reason || "Consultation"}
                                </h3>
                                
                                <div className="text-xs mb-3 font-medium opacity-80 line-clamp-1">{consult.hospital}</div>
                                
                                <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/40 rounded-full px-2 py-1 w-fit mb-3">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{consult.consultation_time}</span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center gap-1.5 opacity-90">
                                    <div className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-[10px] font-bold border border-white/50">
                                      {consult.doctor ? consult.doctor.replace("Dr. ", "").charAt(0) : "D"}
                                    </div>
                                    <span className="text-xs font-medium italic">Dr. {consult.doctor?.replace("Dr. ", "")}</span>
                                  </div>
                                  
                                  {consult.consultation_mode && (
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-black/5 text-current border border-black/10">
                                      {consult.consultation_mode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                          <span className="text-xs text-gray-400 font-medium">No appointments</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarUI;