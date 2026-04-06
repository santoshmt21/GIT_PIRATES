import React, { useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar.jsx';

export default function ResourceLibrary({ onBack }) {
  // Resource Library Form State
  const [libTitle, setLibTitle] = useState('');
  const [libDoctorName, setLibDoctorName] = useState('');
  const [libHospitalName, setLibHospitalName] = useState('');
  const [libDate, setLibDate] = useState('');
  const [libSubject, setLibSubject] = useState('');
  const [libType, setLibType] = useState('');
  const [libFile, setLibFile] = useState(null);
  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState('');
  const [libSuccess, setLibSuccess] = useState('');

  const handleResourceLibrarySubmit = async (e) => {
    e.preventDefault();
    if (!libTitle || !libDoctorName || !libHospitalName || !libDate || !libFile) {
      setLibError('Please fill in all required fields and select a file.');
      return;
    }

    setLibLoading(true);
    setLibError('');
    setLibSuccess('');

    try {
      const username = localStorage.getItem('userEmail') || 'unknown@guest.com';
      const formData = new FormData();
      formData.append('title', libTitle);
      formData.append('username', username);
      formData.append('doctor_name', libDoctorName);
      formData.append('hospital_name', libHospitalName);
      formData.append('date', libDate);
      if (libSubject) formData.append('subject', libSubject);
      if (libType) formData.append('type', libType);
      formData.append('file', libFile);

      const response = await fetch('http://127.0.0.1:8000/reports/resource_library', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload report');
      }

      setLibSuccess('Report uploaded successfully to Resource Library!');
      
      // Reset form
      setLibTitle('');
      setLibDoctorName('');
      setLibHospitalName('');
      setLibDate('');
      setLibSubject('');
      setLibType('');
      setLibFile(null);
      
      const fileInput = document.getElementById('lib-file');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setLibError(err.message);
    } finally {
      setLibLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pl-36 overflow-x-hidden">
      <DashboardSidebar activePath="/library" />
      <div className="max-w-2xl mx-auto">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        )}
        
        {/* Resource Library Upload */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              RESOURCE LIBRARY
            </h1>
            <p className="text-gray-600">Upload reports directly to the library</p>
          </div>

          {libError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium mb-1">Error</p>
              <p className="text-sm">{libError}</p>
            </div>
          )}

          {libSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <p className="font-medium mb-1">Success</p>
              <p className="text-sm">{libSuccess}</p>
            </div>
          )}

          <form onSubmit={handleResourceLibrarySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" required value={libTitle} onChange={(e) => setLibTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. X_RAY_01" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
              <input type="text" disabled value={localStorage.getItem('userEmail') || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" placeholder="e.g. user@example.com" />
              <p className="text-xs text-gray-500 mt-1">Automatically filled from logged-in user.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name <span className="text-red-500">*</span></label>
              <input type="text" required value={libDoctorName} onChange={(e) => setLibDoctorName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Swathi" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name <span className="text-red-500">*</span></label>
              <input type="text" required value={libHospitalName} onChange={(e) => setLibHospitalName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. BGS" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" required value={libDate} onChange={(e) => setLibDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" value={libSubject} onChange={(e) => setLibSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. subject" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input type="text" value={libType} onChange={(e) => setLibType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. type" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File <span className="text-red-500">*</span></label>
              <input id="lib-file" type="file" required onChange={(e) => setLibFile(e.target.files[0])} className="w-full border border-gray-300 rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>

            <button type="submit" disabled={libLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center mt-6">
              {libLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload to Library'
              )}
            </button>
          </form>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How to use:</strong>
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal mt-2">
              <li>Fill in all required fields (marked with *)</li>
              <li>Select a file to upload</li>
              <li>Click "Upload to Library"</li>
              <li>Your report will be saved to your personal resource library</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
