import React, { useState, useEffect } from 'react';
import { Heart, Activity, Weight, Droplet, Menu, X, Home, BarChart2, Calendar, Settings, User, Bell, Plus, ChevronRight, Upload, BookUser, CreditCard } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  ZAxis,
  ReferenceArea,
  Label,
  ReferenceLine,
} from 'recharts';
import heartBeat from './heart_beat.png';
import BP from './BP.png';
import Weight_1 from './Weight.png';
import Oxygen_Level from './Oxygen_Level.png';
import DashboardSidebar from './DashboardSidebar.jsx';


export default function HealthDashboard({ onBack, onNavigateToSchedule, onNavigateToProfile, onNavigateToUpload, onNavigateToBooking }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeIcon, setActiveIcon] = useState(1);
  const [currentView, setCurrentView] = useState("health");

  // Heart Rate Data State
  const [heartRateData, setHeartRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7D');
  const [ageTrendData, setAgeTrendData] = useState([]);
  const [ageTrendLoading, setAgeTrendLoading] = useState(true);
  const [ageTrendError, setAgeTrendError] = useState(null);
  const [ageTrendCondition, setAgeTrendCondition] = useState('');
  const [ageTrendBadge, setAgeTrendBadge] = useState(null);
  
  // Blood Pressure Data State
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [bpLoading, setBpLoading] = useState(true);
  const [bpError, setBpError] = useState(null);
  
  // Weight Data State
  const [weightData, setWeightData] = useState([]);
  const [weightLoading, setWeightLoading] = useState(true);
  const [weightError, setWeightError] = useState(null);

  // CBC Data State
  const [cbcData, setCbcData] = useState(null);
  const [cbcLoading, setCbcLoading] = useState(true);
  const [cbcError, setCbcError] = useState(null);
  
  const [latestMetrics, setLatestMetrics] = useState({
    heartRate: null,
    heartRateDate: null,
    heartRateUpdated: null,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    bloodPressureDate: null,
    bloodPressureUpdated: null,
    weight: null,
    weightDate: null,
    weightUpdated: null
  });

  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [showAddWeightModal, setShowAddWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [bodyMetrics, setBodyMetrics] = useState({
    age: 30,
    height: 178,
    bmi: 23.7,
    bodyFat: 18.5,
    muscleMass: 62,
    water: 58,
  });
  const [bodyReadingDraft, setBodyReadingDraft] = useState(bodyMetrics);

  const sidebarIcons = [
    { icon: Home },
    { icon: Heart },
    { icon: Upload },
    { icon: BookUser },
    { icon: CreditCard },
    { icon: User },
  ];

  // Fetch heart rate data on mount and when time range changes
  useEffect(() => {
    fetchHeartRateData();
    fetchBloodPressureData();
    fetchWeightData();
    fetchCbcData();
    fetchAgeTrendData();
  }, [selectedTimeRange]);

  const fetchHeartRateData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch data from backend API
      const response = await fetch(
        `http://127.0.0.1:8000/reports/heart-rate-reports?gmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        // Get the latest entry (last item in the array since it's sorted ascending)
        const latestEntry = responseData.data[responseData.data.length - 1];
        
        // Update latest metrics state
        if (latestEntry) {
          const latestDate = new Date(latestEntry.record_date);
          const now = new Date();
          const minutesAgo = Math.floor((now - latestDate) / (1000 * 60));
          let updatedText = '';
          
          if (minutesAgo < 1) {
            updatedText = 'Just now';
          } else if (minutesAgo < 60) {
            updatedText = `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
          } else if (minutesAgo < 1440) {
            const hoursAgo = Math.floor(minutesAgo / 60);
            updatedText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else {
            const daysAgo = Math.floor(minutesAgo / 1440);
            updatedText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
          }
          
          setLatestMetrics(prev => ({
            ...prev,
            heartRate: latestEntry.heart_rate,
            heartRateDate: latestEntry.record_date,
            heartRateUpdated: updatedText
          }));
        }
        
        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(responseData.data, selectedTimeRange, 'record_date');
        
        // Transform data for the chart
        const chartData = filteredData.map(item => ({
          name: formatDate(item.record_date),
          value: item.heart_rate,
          fullDate: item.record_date
        }));

        setHeartRateData(chartData);
      } else {
        setHeartRateData([]);
      }
    } catch (err) {
      console.error('Error fetching heart rate data:', err);
      setError(err.message || 'Failed to load heart rate data');
      setHeartRateData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodPressureData = async () => {
    setBpLoading(true);
    setBpError(null);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setBpError('User email not found. Please log in again.');
        setBpLoading(false);
        return;
      }

      // Fetch data from backend API
      const response = await fetch(
        `http://127.0.0.1:8000/reports/blood-pressure-reports?gmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        // Get the latest entry (last item in the array since it's sorted ascending)
        const latestEntry = responseData.data[responseData.data.length - 1];
        
        // Update latest metrics state
        if (latestEntry) {
          const latestDate = new Date(latestEntry.bp_date);
          const now = new Date();
          const minutesAgo = Math.floor((now - latestDate) / (1000 * 60));
          let updatedText = '';
          
          if (minutesAgo < 1) {
            updatedText = 'Just now';
          } else if (minutesAgo < 60) {
            updatedText = `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
          } else if (minutesAgo < 1440) {
            const hoursAgo = Math.floor(minutesAgo / 60);
            updatedText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else {
            const daysAgo = Math.floor(minutesAgo / 1440);
            updatedText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
          }
          
          setLatestMetrics(prev => ({
            ...prev,
            bloodPressureSystolic: latestEntry.systolic,
            bloodPressureDiastolic: latestEntry.diastolic,
            bloodPressureDate: latestEntry.bp_date,
            bloodPressureUpdated: updatedText
          }));
        }
        
        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(responseData.data, selectedTimeRange, 'bp_date');
        
        // Transform data for the chart
        const chartData = filteredData.map(item => ({
          diastolic: item.diastolic,
          systolic: item.systolic,
          date: formatDate(item.bp_date),
          fullDate: item.bp_date
        }));

        setBloodPressureData(chartData);
      } else {
        setBloodPressureData([]);
      }
    } catch (err) {
      console.error('Error fetching blood pressure data:', err);
      setBpError(err.message || 'Failed to load blood pressure data');
      setBloodPressureData([]);
    } finally {
      setBpLoading(false);
    }
  };

  const fetchWeightData = async () => {
    setWeightLoading(true);
    setWeightError(null);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setWeightError('User email not found. Please log in again.');
        setWeightLoading(false);
        return;
      }

      // Fetch data from backend API
      const response = await fetch(
        `http://127.0.0.1:8000/reports/weight-records?gmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data) {
        // Get the latest entry (last item in the array since it's sorted ascending)
        const latestEntry = responseData.data[responseData.data.length - 1];
        
        // Update latest metrics state
        if (latestEntry) {
          const latestDate = new Date(latestEntry.record_date + 'T00:00:00');
          const now = new Date();
          const minutesAgo = Math.floor((now - latestDate) / (1000 * 60));
          let updatedText = '';
          
          if (minutesAgo < 1) {
            updatedText = 'Just now';
          } else if (minutesAgo < 60) {
            updatedText = `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
          } else if (minutesAgo < 1440) {
            const hoursAgo = Math.floor(minutesAgo / 60);
            updatedText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else {
            const daysAgo = Math.floor(minutesAgo / 1440);
            updatedText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
          }
          
          setLatestMetrics(prev => ({
            ...prev,
            weight: latestEntry.weight,
            weightDate: latestEntry.record_date,
            weightUpdated: updatedText
          }));
        }
        
        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(responseData.data, selectedTimeRange, 'record_date');
        
        // Transform data for the chart
        const chartData = filteredData.map(item => ({
          time: formatDate(item.record_date),
          value: parseFloat(item.weight),
          fullDate: item.record_date
        }));

        setWeightData(chartData);
      } else {
        setWeightData([]);
      }
    } catch (err) {
      console.error('Error fetching weight data:', err);
      setWeightError(err.message || 'Failed to load weight data');
      setWeightData([]);
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchCbcData = async () => {
    setCbcLoading(true);
    setCbcError(null);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setCbcError('User email not found. Please log in again.');
        setCbcLoading(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/reports/cbc-report?gmail=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('CBC response:', responseData);

      if (responseData?.data) {
        setCbcData(responseData.data);
      } else {
        setCbcData(null);
        if (responseData?.message) {
          setCbcError(responseData.message);
        }
      }
    } catch (err) {
      console.error('Error fetching CBC data:', err);
      setCbcError(err.message || 'Failed to load CBC data');
      setCbcData(null);
    } finally {
      setCbcLoading(false);
    }
  };

  const filterDataByTimeRange = (data, timeRange, dateField = 'record_date') => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let startDate = new Date(now);

    switch (timeRange) {
      case '7D':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30D':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90D':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    startDate.setHours(0, 0, 0, 0);

    return data.filter(item => {
      const dateString = item[dateField];
      const itemDate = new Date(dateString + 'T00:00:00');
      return itemDate >= startDate && itemDate <= now;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone parsing
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getTimeRangeLabel = () => {
    switch (selectedTimeRange) {
      case '7D':
        return 'Last 7 days';
      case '30D':
        return 'Last 30 days';
      case '90D':
        return 'Last 90 days';
      default:
        return 'Last 7 days';
    }
  };

  const getShortTrendSummary = () => {
    if (!ageTrendData || ageTrendData.length < 2) {
      return 'Add one more reading to get a clear trend summary.';
    }

    const first = ageTrendData[0];
    const latest = ageTrendData[ageTrendData.length - 1];
    const bioDelta = Number(latest.biologicalAge) - Number(first.biologicalAge);
    const gapDelta = Number(latest.gap) - Number(first.gap);

    if (bioDelta < 0 && gapDelta <= 0) {
      return `Biological age decreased by ${Math.abs(bioDelta).toFixed(1)} years. This is a good trend - great job, keep going.`;
    }

    if (bioDelta > 0 || gapDelta > 0) {
      return `Biological age increased by ${Math.abs(bioDelta).toFixed(1)} years. This trend needs attention, but with consistent habits you can improve it.`;
    }

    return 'Your aging trend is stable. Good consistency - continue your current healthy routine.';
  };

  const fetchAgeTrendData = async () => {
    setAgeTrendLoading(true);
    setAgeTrendError(null);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setAgeTrendError('User email not found. Please log in again.');
        setAgeTrendLoading(false);
        return;
      }

      const daysMap = { '7D': 7, '30D': 30, '90D': 90 };
      const days = daysMap[selectedTimeRange] || 30;

      const response = await fetch(
        `http://127.0.0.1:8000/reports/heabo-reports/age-trend?user_email=${encodeURIComponent(userEmail)}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch age trend: ${response.status}`);
      }

      const responseData = await response.json();
      const rows = responseData?.data || [];

      const chartData = rows.map((item) => ({
        date: formatDate(item.report_date),
        fullDate: item.report_date,
        chronologicalAge: Number(item.chronological_age),
        biologicalAge: Number(item.biological_age),
        gap: Number(item.age_gap),
      }));

      setAgeTrendData(chartData);

      if (chartData.length >= 2) {
        const prev = chartData[chartData.length - 2].gap;
        const curr = chartData[chartData.length - 1].gap;
        const delta = curr - prev;
        const base = Math.max(0.1, Math.abs(prev));
        const pct = Math.abs((delta / base) * 100);

        if (delta < 0) {
          setAgeTrendCondition(`Aging gap decreased by ${pct.toFixed(1)}% vs previous reading. Current condition is improving.`);
          setAgeTrendBadge({
            text: `Improved ${pct.toFixed(1)}%`,
            className: 'bg-emerald-100 text-emerald-700',
          });
        } else if (delta > 0) {
          setAgeTrendCondition(`Aging gap increased by ${pct.toFixed(1)}% vs previous reading. Current condition needs attention.`);
          setAgeTrendBadge({
            text: `Declined ${pct.toFixed(1)}%`,
            className: 'bg-red-100 text-red-700',
          });
        } else {
          setAgeTrendCondition('Aging gap is unchanged from previous reading. Condition is stable.');
          setAgeTrendBadge({
            text: 'Stable 0.0%',
            className: 'bg-slate-100 text-slate-700',
          });
        }
      } else if (chartData.length === 1) {
        setAgeTrendCondition('Only one age reading available. Add another report to see trend change.');
        setAgeTrendBadge({
          text: 'Need Previous Data',
          className: 'bg-amber-100 text-amber-700',
        });
      } else {
        setAgeTrendCondition('No age trend data available for this period.');
        setAgeTrendBadge(null);
      }
    } catch (err) {
      console.error('Error fetching age trend data:', err);
      setAgeTrendError(err.message || 'Failed to load age trend data');
      setAgeTrendData([]);
      setAgeTrendCondition('');
      setAgeTrendBadge(null);
    } finally {
      setAgeTrendLoading(false);
    }
  };

  const getAgeReferenceMetrics = (age) => {
    if (age < 30) {
      return { height: 172, bmi: 22.0, bodyFat: 17.0, muscleMass: 66, water: 60 };
    }
    if (age < 45) {
      return { height: 171, bmi: 23.5, bodyFat: 20.0, muscleMass: 62, water: 58 };
    }
    if (age < 60) {
      return { height: 170, bmi: 24.5, bodyFat: 23.0, muscleMass: 58, water: 56 };
    }
    return { height: 168, bmi: 25.5, bodyFat: 26.0, muscleMass: 54, water: 54 };
  };

  const bodyMetricConfig = [
    { key: 'height', label: 'Height', unit: 'cm', color: 'bg-blue-500', rangeMax: 220 },
    { key: 'bmi', label: 'BMI', unit: '', color: 'bg-green-500', rangeMax: 40 },
    { key: 'bodyFat', label: 'Body Fat', unit: '%', color: 'bg-yellow-500', rangeMax: 45 },
    { key: 'muscleMass', label: 'Muscle Mass', unit: 'kg', color: 'bg-purple-500', rangeMax: 100 },
    { key: 'water', label: 'Water %', unit: '%', color: 'bg-cyan-500', rangeMax: 80 },
  ];

  const ageAverages = getAgeReferenceMetrics(bodyMetrics.age);

  const clampPercent = (value) => Math.max(0, Math.min(100, value));

  const formatMetricValue = (key, value) => {
    if (key === 'height') return `${Math.round(value)} cm`;
    if (key === 'bmi') return value.toFixed(1);
    if (key === 'bodyFat') return `${value.toFixed(1)}%`;
    if (key === 'muscleMass') return `${value.toFixed(1)} kg`;
    if (key === 'water') return `${value.toFixed(1)}%`;
    return `${value}`;
  };

  const openAddReadingModal = () => {
    setBodyReadingDraft({ ...bodyMetrics });
    setShowAddReadingModal(true);
  };

  const handleDraftChange = (key, value) => {
    setBodyReadingDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveBodyReading = () => {
    const normalized = {
      age: Number(bodyReadingDraft.age) || bodyMetrics.age,
      height: Number(bodyReadingDraft.height) || bodyMetrics.height,
      bmi: Number(bodyReadingDraft.bmi) || bodyMetrics.bmi,
      bodyFat: Number(bodyReadingDraft.bodyFat) || bodyMetrics.bodyFat,
      muscleMass: Number(bodyReadingDraft.muscleMass) || bodyMetrics.muscleMass,
      water: Number(bodyReadingDraft.water) || bodyMetrics.water,
    };
    setBodyMetrics(normalized);
    setShowAddReadingModal(false);
  };

  const openAddWeightModal = () => {
    setNewWeight(latestMetrics.weight ? String(parseFloat(latestMetrics.weight).toFixed(1)) : '');
    setShowAddWeightModal(true);
  };

  const saveWeightEntry = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setWeightError('User email not found. Please log in again.');
      return;
    }

    const parsedWeight = Number(newWeight);
    if (!parsedWeight || parsedWeight <= 0) {
      setWeightError('Please enter a valid weight value.');
      return;
    }

    setSavingWeight(true);
    setWeightError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/reports/weight-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: userEmail,
          weight: parsedWeight,
        }),
      });

      const responseData = await response.json();
      if (!response.ok || !responseData?.success) {
        throw new Error(responseData?.detail || responseData?.message || 'Failed to save weight record');
      }

      setShowAddWeightModal(false);
      setNewWeight('');
      await fetchWeightData();
    } catch (err) {
      setWeightError(err.message || 'Failed to save weight record');
    } finally {
      setSavingWeight(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar activePath="/health" />

      {/* Main Content */}
      <div className="flex-1 ml-40 transition-all duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your vital signs and health metrics</p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center justify-end mb-8">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">December 2024</span>
              <button
                onClick={openAddReadingModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                + Add Reading
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<Heart className="text-red-500" size={32} />}
              title="Heart Rate"
              value={latestMetrics.heartRate || "—"}
              unit="bpm"
              status={latestMetrics.heartRate ? (latestMetrics.heartRate < 60 ? "Low" : latestMetrics.heartRate <= 100 ? "Normal" : "High") : "No Data"}
              statusColor={latestMetrics.heartRate ? (latestMetrics.heartRate < 60 ? "text-blue-600" : latestMetrics.heartRate <= 100 ? "text-green-600" : "text-orange-600") : "text-gray-600"}
              bgColor="bg-red-50"
              updated={latestMetrics.heartRateUpdated || "No data"}
              bgImage={heartBeat}
            />
            <MetricCard
              icon={<Activity className="text-purple-500" size={32} />}
              title="Blood Pressure"
              value={latestMetrics.bloodPressureSystolic && latestMetrics.bloodPressureDiastolic ? `${latestMetrics.bloodPressureSystolic}/${latestMetrics.bloodPressureDiastolic}` : "—"}
              unit="mmHg"
              status={
                latestMetrics.bloodPressureSystolic && latestMetrics.bloodPressureDiastolic
                  ? latestMetrics.bloodPressureSystolic < 120 && latestMetrics.bloodPressureDiastolic < 80
                    ? "Normal"
                    : latestMetrics.bloodPressureSystolic <= 129 && latestMetrics.bloodPressureDiastolic < 80
                    ? "Elevated"
                    : latestMetrics.bloodPressureSystolic <= 139 || latestMetrics.bloodPressureDiastolic <= 89
                    ? "Stage 1 HTN"
                    : "Stage 2 HTN"
                  : "No Data"
              }
              statusColor={
                latestMetrics.bloodPressureSystolic && latestMetrics.bloodPressureDiastolic
                  ? latestMetrics.bloodPressureSystolic < 120 && latestMetrics.bloodPressureDiastolic < 80
                    ? "text-green-600"
                    : latestMetrics.bloodPressureSystolic <= 129 && latestMetrics.bloodPressureDiastolic < 80
                    ? "text-yellow-600"
                    : latestMetrics.bloodPressureSystolic <= 139 || latestMetrics.bloodPressureDiastolic <= 89
                    ? "text-orange-600"
                    : "text-red-600"
                  : "text-gray-600"
              }
              bgColor="bg-purple-50"
              updated={latestMetrics.bloodPressureUpdated || "No data"}
              bgImage={BP}
            />
            <MetricCard
              icon={<Weight className="text-blue-500" size={32} />}
              title="Weight"
              value={latestMetrics.weight ? parseFloat(latestMetrics.weight).toFixed(1) : "—"}
              unit="kg"
              status={
                latestMetrics.weight 
                  ? latestMetrics.weight < 70 
                    ? "Underweight" 
                    : latestMetrics.weight <= 80 
                    ? "Healthy" 
                    : "Overweight"
                  : "No Data"
              }
              statusColor={
                latestMetrics.weight 
                  ? latestMetrics.weight < 70 
                    ? "text-blue-600" 
                    : latestMetrics.weight <= 80 
                    ? "text-green-600" 
                    : "text-orange-600"
                  : "text-gray-600"
              }
              bgColor="bg-blue-50"
              updated={latestMetrics.weightUpdated || "No data"}
              bgImage={Weight_1}
            />
            <MetricCard
              icon={<Droplet className="text-green-500" size={32} />}
              title="Oxygen Level"
              value="98"
              unit="%"
              status="Excellent"
              statusColor="text-green-600"
              bgColor="bg-green-50"
              updated="5 mins ago"
              bgImage={Oxygen_Level}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Aging Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Aging Trend (Chronological vs Biological)</h3>
                  <p className="text-gray-600 text-sm">{getTimeRangeLabel()}</p>
                  {ageTrendCondition && <p className="text-xs mt-1 text-indigo-700 font-medium">{ageTrendCondition}</p>}
                </div>
                <div className="flex gap-2">
                  {ageTrendBadge && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ageTrendBadge.className}`}>
                      {ageTrendBadge.text}
                    </span>
                  )}
                  <button 
                    onClick={() => setSelectedTimeRange('7D')}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedTimeRange === '7D' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    7D
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('30D')}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedTimeRange === '30D' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    30D
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('90D')}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedTimeRange === '90D' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    90D
                  </button>
                </div>
              </div>
              
              {/* Loading State */}
              {ageTrendLoading && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500">Loading age trend data...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {ageTrendError && !ageTrendLoading && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-600 text-sm font-medium">Failed to load data</p>
                    <p className="text-gray-500 text-xs mt-1">{ageTrendError}</p>
                    <button 
                      onClick={fetchAgeTrendData}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!ageTrendLoading && !ageTrendError && ageTrendData.length === 0 && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">No age trend data available for this period</p>
                  </div>
                </div>
              )}

              {/* Chart */}
              {!ageTrendLoading && !ageTrendError && ageTrendData.length > 0 && (
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={ageTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ccc', fontSize: 12 }} 
                        dy={10}
                      />
                      
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ccc', fontSize: 12 }} 
                      />

                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />

                    <Line
                      type="monotone"
                      dataKey="chronologicalAge"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      name="Chronological Age"
                    />

                    <Line
                      type="monotone"
                      dataKey="biologicalAge"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f97316' }}
                      name="Biological Age"
                    />

                    <ReferenceLine y={0} stroke="#f3f4f6" />
                  </ComposedChart>
                </ResponsiveContainer>
                </div>
              )}

              {!ageTrendLoading && !ageTrendError && ageTrendData.length > 0 && (
                <div className="mt-3 flex items-center gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                    Chronological Age
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
                    Biological Age
                  </div>
                </div>
              )}

              {!ageTrendLoading && !ageTrendError && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
                  <p className="text-base md:text-lg font-bold leading-relaxed text-blue-900">Trend Summary: {getShortTrendSummary()}</p>
                </div>
              )}
            </div>

            {/* Body Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Body Metrics</h3>
              <div className="space-y-6">
                {bodyMetricConfig.map((metric) => {
                  const currentValue = bodyMetrics[metric.key];
                  const avgValue = ageAverages[metric.key];
                  const currentPct = clampPercent((currentValue / metric.rangeMax) * 100);
                  const avgPct = clampPercent((avgValue / metric.rangeMax) * 100);
                  const isAboveAverage = currentValue > avgValue;
                  const excessPct = isAboveAverage ? Math.max(0, currentPct - avgPct) : 0;

                  return (
                    <BodyMetric
                      key={metric.key}
                      label={metric.label}
                      value={formatMetricValue(metric.key, currentValue)}
                      averageValue={formatMetricValue(metric.key, avgValue)}
                      color={metric.color}
                      percentage={currentPct}
                      averagePercentage={avgPct}
                      excessPercentage={excessPct}
                      isAboveAverage={isAboveAverage}
                      age={bodyMetrics.age}
                    />
                  );
                })}
              </div>
              <button className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50">
                View Full Report
              </button>
            </div>
          </div>

          {/* Blood Pressure and Weight Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Blood Pressure Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Blood Pressure</h3>
                  <p className="text-gray-600 text-sm">Weekly average</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <BloodPressureZoneChart data={bloodPressureData} loading={bpLoading} error={bpError} />
            </div>

            {/* Weight Progress Chart */}
            <WeightTrendChart
              data={weightData}
              loading={weightLoading}
              error={weightError}
              latestWeight={latestMetrics.weight}
              latestDate={latestMetrics.weightDate}
              onAddEntry={openAddWeightModal}
            />
          </div>

          {/* Latest Lab Results */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Latest Lab Results</h3>
                <p className="text-gray-600 text-sm">Blood test - December 15, 2024</p>
              </div>
              <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50">
                View All Reports
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <LabResult
                icon="🩸"
                label="WBC"
                value={cbcData?.wbc_count ?? '—'}
                unit="10³/μL"
                status={cbcData?.wbc_status ?? 'No Data'}
                bgColor="bg-red-50"
              />
              <LabResult
                icon="🩸"
                label="RBC"
                value={cbcData?.rbc_count ?? '—'}
                unit="10⁶/μL"
                status={cbcData?.rbc_status ?? 'No Data'}
                bgColor="bg-red-50"
              />
              <LabResult
                icon="🩹"
                label="Hemoglobin"
                value={cbcData?.hemoglobin ?? '—'}
                unit="g/dL"
                status={cbcData?.hb_status ?? 'No Data'}
                bgColor="bg-blue-50"
              />
              <LabResult
                icon="🧪"
                label="Platelets"
                value={cbcData?.platelet_count ?? '—'}
                unit="10³/μL"
                status={cbcData?.platelet_status ?? 'No Data'}
                bgColor="bg-purple-50"
              />
              <LabResult
                icon="🧬"
                label="PCV"
                value={cbcData?.pcv ?? '—'}
                unit="%"
                status={cbcData?.pcv_status ?? 'No Data'}
                bgColor="bg-yellow-50"
              />
              <LabResult
                icon="🔬"
                label="MCV"
                value={cbcData?.mcv ?? '—'}
                unit="fL"
                status={cbcData?.mcv_status ?? 'No Data'}
                bgColor="bg-orange-50"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button className="text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                icon={<Heart className="text-blue-500" size={24} />}
                title="Heart Rate Reading"
                description="Recorded heart rate: 72 bpm - Normal range"
                time="2 mins ago"
                bgColor="bg-blue-50"
              />
              <ActivityItem
                icon={<Weight className="text-purple-500" size={24} />}
                title="Weight Update"
                description="New weight recorded: 75.2 kg - Down 0.3 kg"
                time="1 hour ago"
                bgColor="bg-purple-50"
              />
              <ActivityItem
                icon={<Activity className="text-red-500" size={24} />}
                title="Blood Pressure Check"
                description="BP reading: 128/82 mmHg - Slightly elevated"
                time="3 hours ago"
                bgColor="bg-red-50"
              />
              <ActivityItem
                icon={<Droplet className="text-green-500" size={24} />}
                title="Lab Results Available"
                description="Complete blood count results are ready to view"
                time="Yesterday"
                bgColor="bg-green-50"
              />
            </div>
          </div>
        </div>

        {showAddReadingModal && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Add Body Reading</h3>
                <button
                  onClick={() => setShowAddReadingModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={bodyReadingDraft.age}
                    onChange={(e) => handleDraftChange('age', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    value={bodyReadingDraft.height}
                    onChange={(e) => handleDraftChange('height', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="50"
                    value={bodyReadingDraft.bmi}
                    onChange={(e) => handleDraftChange('bmi', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="60"
                    value={bodyReadingDraft.bodyFat}
                    onChange={(e) => handleDraftChange('bodyFat', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="120"
                    value={bodyReadingDraft.muscleMass}
                    onChange={(e) => handleDraftChange('muscleMass', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="80"
                    value={bodyReadingDraft.water}
                    onChange={(e) => handleDraftChange('water', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddReadingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBodyReading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Reading
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddWeightModal && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Weight Entry</h3>
                <button
                  onClick={() => setShowAddWeightModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter weight"
                />
                <p className="text-xs text-gray-500 mt-2">Date will be saved as today.</p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddWeightModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWeightEntry}
                  disabled={savingWeight}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingWeight ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, sidebarOpen }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-green-600 text-white' : 'text-green-50 hover:bg-green-600'
      }`}
    >
      {icon}
      {sidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );
}

function MetricCard({ icon, title, value, unit, status, statusColor, bgColor, updated, bgImage }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-6"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
        <span className={`${statusColor} font-semibold text-sm`}>{status}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-gray-500 text-lg">{unit}</span>
      </div>
      <p className="text-gray-500 text-xs">Last updated: {updated}</p>
    </div>
  );
}

function BodyMetric({ label, value, averageValue, color, percentage, averagePercentage, excessPercentage, isAboveAverage, age }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-bold">{value}</span>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-visible">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        {isAboveAverage && excessPercentage > 0 && (
          <div
            className="absolute top-0 h-2 bg-red-500 rounded-r-full"
            style={{ left: `${averagePercentage}%`, width: `${excessPercentage}%` }}
          ></div>
        )}
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${averagePercentage}%`, top: '-30px' }}
          title={`Age average: ${averageValue}`}
        >
          <div className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow">
            AVG
          </div>
          <div className="mx-auto mt-0.5 w-2 h-2 rounded-full bg-violet-600 border border-white shadow-sm"></div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs">
        <span className="text-gray-500">Avg at age {age}: {averageValue}</span>
        {isAboveAverage ? <span className="text-red-600 font-semibold">Above avg</span> : <span className="text-green-600 font-semibold">At/Below avg</span>}
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, description, time, bgColor }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          </div>
          <span className="text-gray-500 text-sm">{time}</span>
        </div>
      </div>
    </div>
  );
}

function LabResult({ icon, label, value, unit, status, bgColor }) {
  return (
    <div className="text-center">
      <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs mb-2">{unit}</p>
      <span className="text-green-600 text-sm font-semibold">{status}</span>
    </div>
  );
}

const WeightTrendChart = ({ data = [], loading = false, error = null, latestWeight = null, latestDate = null, onAddEntry }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone parsing
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateMinMax = (data) => {
    if (!data || data.length === 0) return { min: 70, max: 80 };
    const values = data.map(d => d.value);
    const min = Math.floor(Math.min(...values) - 2);
    const max = Math.ceil(Math.max(...values) + 2);
    return { min, max };
  };

  const { min, max } = calculateMinMax(data);

  return (
    <div style={{ width: '100%', height: 500, background: '#f9fbfd', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: '15px', fontFamily: 'sans-serif', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>Weight {latestWeight ? parseFloat(latestWeight).toFixed(2) : '—'} kg</span>
          <div style={{ color: '#888', fontSize: '12px' }}>{latestDate ? formatDateTime(latestDate) : 'No data'}</div>
        </div>
        <button
          onClick={onAddEntry}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Add Entry
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-500">Loading weight data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-sm font-medium">Failed to load data</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No weight data available</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2db494" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2db494" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="time" tick={{fontSize: 12, fill: '#999'}} />
            <YAxis domain={[min, max]} axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#2db494" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorWeight)" 
              dot={{ r: 5, fill: '#2db494', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const BloodPressureZoneChart = ({ data = [], loading = false, error = null }) => {
  return (
    <div style={{ width: '100%', height: 500, backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '20px' }}>
      <h2 style={{ fontFamily: 'sans-serif', textAlign: 'center', color: '#2c3e50' }}>Blood Pressure Health Map</h2>
      
      {/* Loading State */}
      {loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-500">Loading blood pressure data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-sm font-medium">Failed to load data</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No blood pressure data available</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            {/* Health Zones */}
            <ReferenceArea x1={60} x2={80} y1={90} y2={120} fill="#e6f4ea" fillOpacity={0.5} stroke="none">
              <Label value="NORMAL" position="insideBottomLeft" fill="#34a853" fontSize={10} />
            </ReferenceArea>
            <ReferenceArea x1={80} x2={89} y1={120} y2={139} fill="#fff7e6" fillOpacity={0.5} stroke="none">
              <Label value="ELEVATED" position="insideBottomLeft" fill="#fbbc04" fontSize={10} />
            </ReferenceArea>
            <ReferenceArea x1={90} x2={110} y1={140} y2={180} fill="#fce8e6" fillOpacity={0.5} stroke="none">
              <Label value="HYPERTENSION" position="insideBottomLeft" fill="#ea4335" fontSize={10} />
            </ReferenceArea>

            <XAxis 
              type="number" 
              dataKey="diastolic" 
              name="Diastolic" 
              unit="mmHg" 
              domain={[60, 110]} 
              tick={{fontSize: 12}}
            >
              <Label value="Diastolic (Bottom Number)" offset={-10} position="insideBottom" />
            </XAxis>
            
            <YAxis 
              type="number" 
              dataKey="systolic" 
              name="Systolic" 
              unit="mmHg" 
              domain={[90, 180]} 
              tick={{fontSize: 12}}
            >
              <Label value="Systolic (Top Number)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>

            <ZAxis type="number" range={[100, 100]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>
                        {data.diastolic}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#555' }}>
                        Diastolic: {data.diastolic}mmHg
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#555' }}>
                        Systolic: {data.systolic}mmHg
                      </p>
                      <p style={{ margin: '0', fontSize: '10px', color: '#999' }}>
                        {data.date}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Chronological connection line */}
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#95a5a6" 
              strokeWidth={1} 
              dot={false} 
              activeDot={false} 
              strokeDasharray="5 5"
            />

            {/* Actual Blood Pressure readings */}
            <Scatter 
              name="Readings" 
              data={data} 
              fill="#e74c3c" 
              line={{ stroke: '#e74c3c', strokeWidth: 2 }} 
              shape="circle"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};