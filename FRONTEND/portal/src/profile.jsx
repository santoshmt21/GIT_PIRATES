import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Heart,
  Activity,
  Pill,
  Phone,
  Mail,
  BookUser,
  MessageSquare,
  Clock,
  AlertCircle,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  Plus,
  Home,
  Upload,
  CreditCard,
  Video,
  Pencil,
  X,
  Save,
  LogOut,
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar.jsx';

export default function PatientProfile({ onBack, onNavigateToHealth, onNavigateToSchedule, onNavigateToUpload, onNavigateToBooking, onNavigateToMain }) {
  const navigate = useNavigate();

  // Default static data fallback
  const defaultData = {
    email: '',
    contactNumber: '',
    dob: '',
    age: '',
    bloodType: '',
    allergies: '',
    lastVisit: 'March, 2024',
    status: 'Under Treatment',
    nextAppointment: {
      date: 'April 15, 2024',
      time: '10:00 AM',
      type: 'Follow-up Consultation'
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultations, setConsultations] = useState([]);
  const [activeIcon, setActiveIcon] = useState(0);
  const [userName, setUserName] = useState('User');
  const [profileData, setProfileData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medications, setMedications] = useState([]);

  // ── Edit modal state ──────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    contact_number: '',
    dob: '',
    blood_type: '',
    allergies: '',
    sex: '',
    age: '',
    height: '',
    weight: '',
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: profileData?.name || userName || '',
      contact_number: profileData?.contactNumber || '',
      dob: profileData?.dob || '',
      blood_type: profileData?.bloodType || '',
      allergies: profileData?.allergies || '',
      sex: profileData?.sex || '',
      age: profileData?.age || '',
      height: profileData?.height || '',
      weight: profileData?.weight || '',
    });
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const encodedEmail = encodeURIComponent(userEmail);
      const payload = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age) : null,
        height: editForm.height ? parseFloat(editForm.height) : null,
        weight: editForm.weight ? parseFloat(editForm.weight) : null,
      };
      const res = await fetch(`http://127.0.0.1:8000/users/profile?gmail=${encodedEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setProfileData(updated);
      if (updated.name) setUserName(updated.name);
      setEditSuccess(true);
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Profile component mounted');
    
    const fetchProfileData = async () => {
      try {
        const savedUserName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        
        console.log('📧 Email from localStorage:', userEmail);
        console.log('👤 Name from localStorage:', savedUserName);
        console.log('Current profileData state:', profileData);
        
        if (savedUserName) {
          setUserName(savedUserName);
        }

        if (userEmail) {
          const encodedEmail = encodeURIComponent(userEmail);
          const apiUrl = `http://127.0.0.1:8000/users/profile?gmail=${encodedEmail}`;
          console.log('🔗 API URL:', apiUrl);
          
          const response = await fetch(apiUrl);
          console.log('📊 Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Raw API response:', data);
            console.log('Setting profileData to:', data);
            setProfileData(data);
            console.log('profileData state should now be updated');

            // Fetch Medications
            try {
              const medResponse = await fetch(`http://127.0.0.1:8000/medications/?gmail=${encodedEmail}`);
              if (medResponse.ok) {
                const medData = await medResponse.json();
                if (medData.success) {
                  const activeMeds = medData.data.filter(m => m.status === 'active');
                  console.log('💊 Active medications:', activeMeds);
                  setMedications(activeMeds);
                }
              }
            } catch (mErr) {
              console.error('Error fetching medications:', mErr);
            }

            // Fetch Consultations
            try {
              const consultResponse = await fetch(`http://127.0.0.1:8000/consultations/?gmail=${encodedEmail}`);
              if (consultResponse.ok) {
                const consultData = await consultResponse.json();
                if (consultData.success) {
                  console.log('📅 Consultations:', consultData.data);
                  setConsultations(consultData.data);
                }
              }
            } catch (cErr) {
              console.error('Error fetching consultations:', cErr);
            }
          } else {
            console.warn('❌ API returned non-200 status:', response.status);
          }
        } else {
          console.warn('⚠️ No email in localStorage');
        }
      } catch (err) {
        console.error('💥 Fetch error:', err);
        console.error('Error stack:', err.stack);
      } finally {
        setLoading(false);
      }
    };

    console.log('Calling fetchProfileData...');
    fetchProfileData();
    console.log('fetchProfileData call completed');
  }, []);

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getTimingIcons = (timing) => {
    const timingStr = timing?.toLowerCase() || '';
    const icons = [];
    if (timingStr.includes('morning')) icons.push({ label: 'M', color: 'from-blue-400 to-blue-600' });
    if (timingStr.includes('afternoon')) icons.push({ label: 'A', color: 'from-yellow-400 to-yellow-600' });
    if (timingStr.includes('evening')) icons.push({ label: 'E', color: 'from-purple-400 to-purple-600' });
    if (timingStr.includes('night')) icons.push({ label: 'N', color: 'from-gray-700 to-gray-900' });
    return icons;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

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

  // Map consultations to days for highlighting
  const appointmentsByDay = {};
  consultations.forEach(c => {
    const cDate = new Date(c.consultation_date);
    // Use local time comparison to avoid timezone shifts
    if (cDate.getUTCMonth() === currentDate.getMonth() && cDate.getUTCFullYear() === currentDate.getFullYear()) {
      const day = cDate.getUTCDate();
      if (!appointmentsByDay[day]) appointmentsByDay[day] = [];
      appointmentsByDay[day].push(c);
    }
  });

  const getAppointmentColor = (type) => {
    const colors = {
      'Cardiology': 'bg-red-500',
      'General Checkup': 'bg-blue-500',
      'Lab Test': 'bg-purple-600',
      'Routine': 'bg-yellow-500',
      'Specialist': 'bg-cyan-500',
      'Follow-up': 'bg-green-500'
    };
    return colors[type] || 'bg-gray-700';
  };

  const sidebarIcons = [
    { icon: Home },
    { icon: Heart },
    { icon: Upload },
    { icon: BookUser },
    { icon: CreditCard },
    { icon: User },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-400 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6 pl-40 gap-6">
      <DashboardSidebar activePath="/profile" />

      {/* Main Content Container */}
      <div className="flex-1 bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col h-full">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                Patient Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
                {profileData?.status || 'Under Treatment'}
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600">
                Last Visit: {profileData?.lastVisit || 'March, 2024'}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="space-y-6">
            {/* Patient Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    RS
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userName}
                    </h2>
                    <p className="text-gray-500">
                      Patient ID: {profileData?.patientId ? `#${profileData.patientId}` : 'Not provided'}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2.5 rounded-lg hover:bg-gray-200">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2.5 rounded-lg hover:bg-gray-200">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2.5 rounded-lg hover:bg-gray-200">
                  <Video className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Next Appointment</span>
                  <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    {profileData?.nextAppointment?.date} - {profileData?.nextAppointment?.time || 'TBA'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 mt-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {profileData?.nextAppointment?.type || 'Follow-up Consultation'}
                  </span>
                  <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-800">
                      {userName}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-800">
                      {profileData?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Contact Number</p>
                    <p className="font-semibold text-gray-800">
                      {profileData?.contactNumber || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-semibold text-gray-800">
                      {profileData?.dob ? `${profileData.dob} ${profileData.age ? `(Age: ${profileData.age})` : ''}` : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Blood Type</p>
                    <p className="font-semibold text-gray-800">{profileData?.bloodType || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Allergies</p>
                    <p className="font-semibold text-gray-800">
                      {profileData?.allergies || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Medications & Calendar */}
          <div className="space-y-6">
            {/* Ongoing Medications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Ongoing Medications
                  </button>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {medications.length > 0 ? (
                  medications.map((med, index) => {
                    const daysLeft = calculateDaysLeft(med.end_date);
                    const timingIcons = getTimingIcons(med.timing_in_day);
                    
                    const themes = [
                      { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100', icon: AlertCircle, iconColor: 'text-yellow-600', leftBadge: 'bg-yellow-200 text-yellow-800' },
                      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100', icon: Activity, iconColor: 'text-blue-600', leftBadge: 'bg-blue-200 text-blue-800' },
                      { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100', icon: Heart, iconColor: 'text-red-600', leftBadge: 'bg-red-200 text-red-800' },
                    ];
                    const theme = themes[index % themes.length];
                    const StatusIcon = theme.icon;

                    return (
                      <div key={med.id || index} className={`${theme.bg} border ${theme.border} rounded-xl p-4 transition-all hover:shadow-sm`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-800">
                                {med.pill_name}
                              </h4>
                              <StatusIcon className={`w-4 h-4 ${theme.iconColor}`} />
                            </div>
                            <p className={`text-sm ${theme.text} ${theme.badge} inline-block px-2 py-0.5 rounded`}>
                              {med.medication_for || 'Ongoing'}
                            </p>
                          </div>
                          <button className="p-1 hover:bg-black/5 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex -space-x-2">
                            {timingIcons.map((icon, i) => (
                              <div key={i} title={med.timing_in_day} className={`w-7 h-7 bg-gradient-to-br ${icon.color} rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                                {icon.label}
                              </div>
                            ))}
                            {timingIcons.length === 0 && (
                              <div className="w-7 h-7 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-gray-400 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                          {daysLeft !== null && (
                            <span className={`text-xs ${theme.leftBadge} px-2 py-1 rounded-full font-medium`}>
                              {daysLeft} days left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-50" />
                    <p className="text-gray-500 text-sm">No active medications</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Calendar
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h4 className="text-xl font-bold text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-semibold text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const dayAppointments = day ? appointmentsByDay[day] : null;
                  const hasAppointment = dayAppointments && dayAppointments.length > 0;
                  const primaryType = hasAppointment ? dayAppointments[0].consultation_type || 'General Checkup' : null;
                  const bgColor = hasAppointment ? getAppointmentColor(primaryType) : '';

                  return (
                    <div
                      key={i}
                      title={hasAppointment ? dayAppointments.map(a => `${a.doctor} - ${a.consultation_time}`).join('\n') : ''}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                        hasAppointment
                          ? `${bgColor} text-white font-bold shadow-sm scale-95`
                          : day
                          ? 'hover:bg-gray-100 text-gray-700'
                          : ''
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                {Array.from(new Set(consultations.map(c => c.consultation_type || 'General Checkup'))).slice(0, 5).map((type, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 ${getAppointmentColor(type)} rounded`} />
                    <span className="text-gray-600">{type}</span>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <p className="text-[10px] text-gray-400 italic">No scheduled appointments</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Messages & Alerts */}
          <div className="space-y-6">
            {/* Messages */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Messages
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    3
                  </span>
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Message 1 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      DC
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-800">
                          Dr. Catherine
                        </h4>
                        <button className="p-1 hover:bg-blue-100 rounded">
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        Your latest blood test results are ready. Please check
                        the attached report.
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="bg-gray-900 text-white rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      NP
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold">Nurse Patricia</h4>
                        <button className="p-1 hover:bg-gray-800 rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        Reminder: Please take your medication before 9 PM today
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        5 hours ago
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message 3 */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      RX
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-800">Pharmacy</h4>
                        <button className="p-1 hover:bg-green-100 rounded">
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        Your prescription refill is ready for pickup at our main
                        location
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        Yesterday
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Alerts */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Health Alerts
                </h3>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Medication Reminder
                      </p>
                      <p className="text-xs text-gray-600">
                        Lisinopril - Due in 2 hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Upcoming Appointment
                      </p>
                      <p className="text-xs text-gray-600">
                        Cardiology - April 15, 10:00 AM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Lab Results Available
                      </p>
                      <p className="text-xs text-gray-600">
                        Blood panel - View results
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Vital Signs
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                      <p className="font-bold text-gray-800">120/80 mmHg</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Normal
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Heart Rate</p>
                      <p className="font-bold text-gray-800">72 bpm</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Normal
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Blood Sugar</p>
                      <p className="font-bold text-gray-800">95 mg/dL</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Normal
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-bold text-gray-800">165 lbs</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    {/* ── Edit Profile Modal ───────────────────────────────────── */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
           style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Edit Patient Details</h2>
            </div>
            <button onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <input name="name" value={editForm.name} onChange={handleEditChange}
                     placeholder="Santosh"
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
              <input name="contact_number" value={editForm.contact_number} onChange={handleEditChange}
                     placeholder="9880736838"
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            {/* DOB + Age row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                <input type="date" name="dob" value={editForm.dob} onChange={handleEditChange}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                <input type="number" name="age" value={editForm.age} onChange={handleEditChange}
                       placeholder="23" min="0" max="150"
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            {/* Sex + Blood Type row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sex</label>
                <select name="sex" value={editForm.sex} onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Blood Type</label>
                <select name="blood_type" value={editForm.blood_type} onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height + Weight row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Height (cm)</label>
                <input type="number" step="0.01" name="height" value={editForm.height} onChange={handleEditChange}
                       placeholder="175.50"
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                <input type="number" step="0.01" name="weight" value={editForm.weight} onChange={handleEditChange}
                       placeholder="50.20"
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Allergies</label>
              <textarea name="allergies" value={editForm.allergies} onChange={handleEditChange}
                        placeholder="None / Penicillin / Peanuts …"
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>

            {/* Success banner */}
            {editSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                <Save className="w-4 h-4" />
                Profile saved successfully!
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
            <button onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleEditSave} disabled={editSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {editSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
