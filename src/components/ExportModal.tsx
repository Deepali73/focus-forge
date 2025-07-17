import React, { useState } from 'react';
import { Download, FileText, Database, X, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { generateExportData, exportToJSON, exportToCSV, exportToPDF } from '../utils/exportData';

interface ExportModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ user, isOpen, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const data = generateExportData(user);
      
      switch (format) {
        case 'json':
          exportToJSON(data);
          break;
        case 'csv':
          exportToCSV(data);
          break;
        case 'pdf':
          await exportToPDF(data);
          break;
      }
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-white/80 via-white/60 to-indigo-100/80 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-2xl p-8 w-full max-w-md animate-slideUp relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-pulse-slow" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 drop-shadow">Export Your Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {exportSuccess ? (
          <div className="text-center py-10">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce animate-glow" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Successful!</h3>
            <p className="text-gray-700">Your data has been downloaded successfully.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-6 text-base">
              Choose a format to download your focus tracking data and activity history.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="w-full flex items-center p-4 border border-indigo-200 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-100/80 hover:from-blue-100 hover:to-indigo-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 disabled:opacity-50 group focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <div className="bg-blue-200/60 p-3 rounded-xl mr-4 group-hover:bg-blue-300/80 shadow-md">
                  <Database className="w-6 h-6 text-blue-700 drop-shadow" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">JSON Format</h3>
                  <p className="text-sm text-gray-600">Complete data with all details</p>
                </div>
                <Download className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="w-full flex items-center p-4 border border-green-200 rounded-2xl bg-gradient-to-r from-green-50/80 to-green-100/80 hover:from-green-100 hover:to-green-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 disabled:opacity-50 group focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <div className="bg-green-200/60 p-3 rounded-xl mr-4 group-hover:bg-green-300/80 shadow-md">
                  <FileText className="w-6 h-6 text-green-700 drop-shadow" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">CSV Format</h3>
                  <p className="text-sm text-gray-600">Session data for spreadsheets</p>
                </div>
                <Download className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="w-full flex items-center p-4 border border-purple-200 rounded-2xl bg-gradient-to-r from-purple-50/80 to-pink-100/80 hover:from-purple-100 hover:to-pink-200 hover:shadow-lg hover:border-purple-400 transition-all duration-200 disabled:opacity-50 group focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <div className="bg-purple-200/60 p-3 rounded-xl mr-4 group-hover:bg-purple-300/80 shadow-md">
                  <FileText className="w-6 h-6 text-purple-700 drop-shadow" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">Report Format</h3>
                  <p className="text-sm text-gray-600">Formatted activity report</p>
                </div>
                <Download className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>

            {exporting && (
              <div className="mt-8 text-center">
                <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-lg"></div>
                <p className="text-base text-gray-700">Preparing your export...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};