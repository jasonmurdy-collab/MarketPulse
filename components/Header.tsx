
import React, { useState, useMemo } from 'react';
import { BarChart2, Phone, Calendar, ArrowUpRight, Share2 } from 'lucide-react';
import { WeeklyStats, MonthlyStats, ViewMode } from '../types';
import Modal from './Modal';

interface HeaderProps {
  currentData: WeeklyStats | MonthlyStats | undefined;
  viewMode: ViewMode;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentData, viewMode, onExport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const liveDataLabel = useMemo(() => {
    if (!currentData) return null;
    
    if (viewMode === 'Weekly') {
        return (currentData as WeeklyStats).weekRange;
    } else {
        const d = currentData as MonthlyStats;
        return `${d.month} ${d.year}`;
    }
  }, [currentData, viewMode]);

  return (
    <>
      <header className="bg-kw-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-kw-red p-1.5 rounded-md shadow-sm">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-kw-black">MarketPulse</span>
              <span className="text-xl font-light text-kw-main-gray ml-1 hidden sm:inline">Kingston</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {liveDataLabel && (
              <div className="hidden lg:flex items-center text-sm font-medium text-kw-main-gray bg-kw-light-gray/30 px-3 py-1 rounded-full border border-kw-light-gray/50">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Data: {liveDataLabel}
              </div>
            )}
            
            <button 
                onClick={onExport}
                className="flex items-center text-sm font-medium text-kw-dark-gray bg-white border border-kw-light-gray hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all"
                title="Export Infographic"
            >
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export Report</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center text-sm font-bold text-white bg-kw-red hover:bg-kw-red-dark px-3 sm:px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:transform active:scale-95">
              <Phone className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Book Consultation</span>
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book a Consultation"
      >
        <div className="space-y-6">
          <p className="text-kw-dark-gray text-center">
            Ready to make your next move? Reach out directly or book a time that works for you.
          </p>
          <a
            href="tel:905-320-5570"
            className="group w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-kw-red hover:bg-kw-red-dark transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kw-red"
          >
            <Phone className="w-5 h-5 mr-3" />
            Call (905) 320-5570
          </a>
          <a
            href="https://calendar.app.google/haexYSA5cZqPN1b7A"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full flex items-center justify-center px-4 py-3 border border-kw-light-gray text-base font-medium rounded-lg text-kw-dark-gray bg-kw-white hover:bg-kw-light-gray/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kw-red"
          >
            <Calendar className="w-5 h-5 mr-3" />
            Book in my Calendar
            <ArrowUpRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </Modal>
    </>
  );
};

export default Header;
