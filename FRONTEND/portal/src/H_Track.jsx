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
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">Today</button>
              <button className="px-6 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50">This Week</button>
              <button className="px-6 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50">This Month</button>
              <button className="px-6 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50">Custom</button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">December 2024</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">+ Add Reading</button>
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
            {/* Heart Rate Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Heart Rate Trend</h3>
                  <p className="text-gray-600 text-sm">{getTimeRangeLabel()}</p>
                </div>
                <div className="flex gap-2">
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
              {loading && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500">Loading heart rate data...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-600 text-sm font-medium">Failed to load data</p>
                    <p className="text-gray-500 text-xs mt-1">{error}</p>
                    <button 
                      onClick={fetchHeartRateData}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && heartRateData.length === 0 && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">No heart rate data available for this period</p>
                  </div>
                </div>
              )}

              {/* Chart */}
              {!loading && !error && heartRateData.length > 0 && (
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heartRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      
                      <XAxis 
                        dataKey="name" 
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

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      style={{ filter: 'drop-shadow(0px 4px 4px rgba(59, 130, 246, 0.2))' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Body Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Body Metrics</h3>
              <div className="space-y-6">
                <BodyMetric label="Height" value="178 cm" color="bg-blue-500" percentage={90} />
                <BodyMetric label="BMI" value="23.7" color="bg-green-500" percentage={65} />
                <BodyMetric label="Body Fat" value="18.5%" color="bg-yellow-500" percentage={40} />
                <BodyMetric label="Muscle Mass" value="62 kg" color="bg-purple-500" percentage={85} />
                <BodyMetric label="Water %" value="58%" color="bg-cyan-500" percentage={58} />
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
            <WeightTrendChart data={weightData} loading={weightLoading} error={weightError} latestWeight={latestMetrics.weight} latestDate={latestMetrics.weightDate} />
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

function BodyMetric({ label, value, color, percentage }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
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

const WeightTrendChart = ({ data = [], loading = false, error = null, latestWeight = null, latestDate = null }) => {
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
      <div style={{ marginBottom: '15px', fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>Weight {latestWeight ? parseFloat(latestWeight).toFixed(2) : '—'} kg</span>
        <div style={{ color: '#888', fontSize: '12px' }}>{latestDate ? formatDateTime(latestDate) : 'No data'}</div>
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