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
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_34%),linear-gradient(180deg,_#f7fbff_0%,_#eef5fb_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <DashboardSidebar activePath="/upload" />
      <div className="ml-0 lg:ml-24 xl:ml-28">
        <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.45em] text-cyan-600">Core Interface</p>
              <h1 className="mt-1 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Precision Bio-Data
                <span className="block text-cyan-600">Ingestion</span>
              </h1>
            </div>
            <div className="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">System Status</p>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-800">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                NEURAL_LINK ACTIVE
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
              <p className="text-sm font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mb-4 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3 text-slate-700">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                <span className="text-sm font-medium">{progress || 'Processing...'}</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.95fr)]">
            <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
              <label
                htmlFor="file-upload"
                className="group flex min-h-[560px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-sky-100 bg-slate-50/70 px-8 py-12 text-center transition duration-200 hover:border-sky-300 hover:bg-sky-50/80"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_18px_40px_rgba(2,132,199,0.18)] ring-1 ring-sky-100">
                  <Upload className="h-12 w-12 text-cyan-500 transition group-hover:scale-105" />
                </div>
                <h2 className="mt-10 text-3xl font-semibold text-slate-800 sm:text-4xl">Drop Medical Records</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                  Securely ingest image reports. Our clinical prism engine will automatically parse your biomarkers for analysis.
                </p>
                <div className="mt-10 inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition group-hover:shadow-md">
                  Browse Files
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
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    {file.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <Image className="h-5 w-5 text-cyan-500" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      onClick={clearFile}
                      className="rounded-full p-2 transition hover:bg-slate-200"
                    >
                      <X className="h-4 w-4 text-slate-600" />
                    </button>
                  )}
                </div>
              )}

              {extractedText && !loading && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-slate-800">Extracted Text</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button
                        onClick={downloadText}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[460px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <pre className="whitespace-pre-wrap text-base leading-7 text-slate-800">
                      {extractedText}
                    </pre>
                  </div>
                  <div className="text-center text-xs text-slate-500">
                    {extractedText.split(' ').filter(w => w.length > 0).length} words • {extractedText.length} characters
                  </div>
                </div>
              )}

              {summary && !loading && (
                <div className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-6">
                  <h2 className="text-xl font-semibold text-slate-800">Medical Report Summary</h2>
                  <pre className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-800">
                    {summary}
                  </pre>
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200/80 bg-[#111c33] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                <div className="mb-12 flex items-start justify-between">
                  <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[2]">
                      <path d="M3 12h4l2-5 4 10 2-5h6" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
                    Analysis Metric
                  </span>
                </div>
                <h3 className="text-3xl font-semibold text-cyan-300">Biological Age Calculation</h3>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Cross-referencing biomarkers from your uploaded report to estimate your system&apos;s physiological age.
                </p>
                <div className="mt-10 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
                </div>
              </div>

              <div className="rounded-[32px] border border-amber-100 bg-amber-50 p-8 shadow-sm">
                <p className="text-2xl font-semibold text-amber-900">Biological Age Rules</p>
                <p className="mt-4 text-lg leading-8 text-amber-800">
                  Blood marker values will be used to calculate your biological age. If some values are missing, average population values will be used as defaults.
                </p>
              </div>
            </aside>
          </div>

          {!file && !loading && (
            <div className="mt-8 text-sm text-slate-500">
              Supports image-based medical reports with OCR extraction and biomarker inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}