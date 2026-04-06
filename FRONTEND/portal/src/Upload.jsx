import React, { useState } from 'react';
import { Upload, FileText, Image, Loader2, Copy, Download, X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar.jsx';

export default function TextExtractor({ onBack }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');



  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setExtractedText('');
    setSummary('');
    setLoading(true);
    setProgress('');

    try {
      if (selectedFile.type.startsWith('image/')) {
        await extractTextFromFile(selectedFile);
      } else {
        setError('Please upload an image report (PNG, JPG, JPEG, WEBP, BMP).');
        setLoading(false);
      }
    } catch (err) {
      setError('Error extracting text: ' + err.message);
      setLoading(false);
    }
  };

  const extractTextFromFile = async (file) => {
    try {
      setProgress('Uploading report to backend...');
      const userEmail = localStorage.getItem('userEmail') || '';
      if (!userEmail) {
        throw new Error('User email not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_email', userEmail);

      setProgress('Running OCR extraction...');

      const response = await fetch('http://127.0.0.1:8000/reports/ocr-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.detail || errorData.error?.message || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const extracted = data?.data?.extracted_text || 'No text could be extracted';
      const extractedValues = data?.data?.extracted_values || {};

      const summaryText = Object.keys(extractedValues).length
        ? Object.entries(extractedValues)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        : 'No structured lab values found.';

      setExtractedText(extracted);
      setSummary(summaryText);
    } catch (err) {
      throw new Error('Extraction failed: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${file?.name || 'text'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setExtractedText('');
    setSummary('');
    setError('');
    setProgress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pl-36 overflow-x-hidden">
      <DashboardSidebar activePath="/upload" />
      <div className="max-w-[90rem] mx-auto">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        )}
        <div className="max-w-3xl mx-auto">
          {/* Left Column: Medical Report Upload and Analysis */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              MEDICAL REPORT UPLOAD AND  ANALYSIS
            </h1>
            <p className="text-gray-600">
              
            </p>
          </div>

          <div className="mb-8">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Image files (PNG, JPG, JPEG, WEBP, BMP)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : (
                    <Image className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                {!loading && (
                  <button
                    onClick={clearFile}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <span className="text-gray-600 text-center px-4">{progress || 'Processing...'}</span>
            </div>
          )}

          {extractedText && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Extracted Text</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadText}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {extractedText}
                </pre>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {extractedText.split(' ').filter(w => w.length > 0).length} words • {extractedText.length} characters
              </div>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-semibold text-gray-800">Medical Report Summary</h2>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {summary}
                </pre>
              </div>
            </div>
          )}

          {!file && !loading && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>How to use:</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal mt-2">
                <li>Click the upload area above or drag and drop your file</li>
                <li>Select an image report (PNG, JPG, JPEG, WEBP, BMP)</li>
                <li>Wait for OCR.py to extract the text</li>
                <li>Copy or download the extracted text</li>
              </ol>
              <p className="text-xs text-blue-700 mt-3">
                ✨ Supports medical reports with OCR-based value extraction
              </p>
            </div>
          )}
        </div>
          
        </div>
      </div>
    </div>
  );
}