
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ChartSection from './components/ChartSection';
import RegionCards from './components/RegionCards';
import DataTable from './components/DataTable';
import LeadGenBanner from './components/LeadGenBanner';
import ExportModal from './components/ExportModal';
import { Region, WeeklyStats, MonthlyStats, ViewMode } from './types';
import { useMarketData } from './hooks/useMarketData';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.Kingston);
  const [viewMode, setViewMode] = useState<ViewMode>('Weekly');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { allWeeklyData, allMonthlyData, loading, error } = useMarketData();
  
  const allRegions = Object.values(Region);

  const activeDataset = viewMode === 'Weekly' ? allWeeklyData : allMonthlyData;

  const sortedDataset = useMemo(() => {
    return [...activeDataset].sort((a, b) => {
        const dateA = viewMode === 'Weekly' ? (a as WeeklyStats).weekEndDate : (a as MonthlyStats).date;
        const dateB = viewMode === 'Weekly' ? (b as WeeklyStats).weekEndDate : (b as MonthlyStats).date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [activeDataset, viewMode]);

  const regionHistory = useMemo(() => {
    return sortedDataset.filter(d => d.region === selectedRegion) as (WeeklyStats | MonthlyStats)[];
  }, [selectedRegion, sortedDataset]);

  const currentRegionData = useMemo(() => {
    return regionHistory.length > 0 ? regionHistory[0] : undefined;
  }, [regionHistory]);

  const previousRegionData = useMemo(() => {
    return regionHistory.length > 1 ? regionHistory[1] : undefined;
  }, [regionHistory]);

  const latestDataByRegion = useMemo(() => {
    if (sortedDataset.length === 0) return [];
    const latestEntries = new Map<Region, WeeklyStats | MonthlyStats>();
    for (const entry of sortedDataset) {
        if (!latestEntries.has(entry.region)) {
            latestEntries.set(entry.region, entry);
        }
        if (latestEntries.size === allRegions.length) break;
    }
    return Array.from(latestEntries.values());
  }, [sortedDataset, allRegions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-kw-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-kw-red mb-4"></div>
          <p className="text-lg font-semibold text-kw-dark-gray">Fetching Market Data...</p>
        </div>
      </div>
    );
  }

  if (error && allWeeklyData.length === 0 && allMonthlyData.length === 0) {
     return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-900">
        <div className="text-center p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Data Fetching Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-red-700">Please check console for details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kw-white font-sans text-kw-black">
      {error && (
        <div className="bg-yellow-100 text-yellow-800 text-center p-2 text-sm font-medium">
          {error}
        </div>
      )}
      <Header 
        currentData={currentRegionData} 
        viewMode={viewMode} 
        onExport={() => setIsExportModalOpen(true)}
      />
      
      <HeroSection 
        currentData={currentRegionData}
        previousData={previousRegionData}
        allRegions={allRegions}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ChartSection 
        historicalData={sortedDataset} 
        latestPeriodData={latestDataByRegion}
        selectedRegion={selectedRegion}
        viewMode={viewMode}
      />

      <RegionCards 
        selectedRegion={selectedRegion}
        onSelect={setSelectedRegion}
      />

      <LeadGenBanner region={selectedRegion} />

      <DataTable 
        data={sortedDataset} 
        allRegions={allRegions}
        viewMode={viewMode}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        region={selectedRegion}
        viewMode={viewMode}
        currentData={currentRegionData}
        previousData={previousRegionData}
        history={regionHistory}
      />
      
      <footer className="bg-kw-black text-kw-main-gray py-8 text-center text-sm border-t border-kw-black">
        <p className="font-medium text-kw-white">&copy; 2024 MarketPulse Intelligence. All rights reserved.</p>
        <p className="mt-2 text-kw-dark-gray max-w-2xl mx-auto px-4">Data sourced from local real estate board statistics. Not intended to solicit properties already listed for sale. This tool is for informational purposes only.</p>
        <p className="mt-4 text-xs text-kw-main-gray">Each office is independently owned and operated.</p>
      </footer>
    </div>
  );
};

export default App;
