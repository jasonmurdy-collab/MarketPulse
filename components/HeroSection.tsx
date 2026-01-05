import React, { useMemo } from 'react';
import { Region, WeeklyStats, MonthlyStats, ViewMode } from '../types';
import { formatCurrency, formatNumber, formatPercentage, calculateChange } from '../utils';
import { ChevronDown, ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock } from 'lucide-react';

interface HeroSectionProps {
  currentData: WeeklyStats | MonthlyStats | undefined;
  previousData: WeeklyStats | MonthlyStats | undefined;
  allRegions: Region[];
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const TrendBadge: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const colorClass = isPositive ? 'text-green-600 bg-green-50' : isNegative ? 'text-red-600 bg-red-50' : 'text-kw-main-gray bg-kw-light-gray/50';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass} ml-2`}>
      {isPositive && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
      {isNegative && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
      {!isPositive && !isNegative && <Minus className="w-3 h-3 mr-0.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ 
  currentData, 
  previousData, 
  allRegions, 
  selectedRegion, 
  onRegionChange,
  viewMode,
  onViewModeChange
}) => {

  const stats = useMemo(() => {
    if (!currentData) return null;

    let soldListSubValue = 'Based on latest data';
    if (viewMode === 'Weekly') {
        const wData = currentData as WeeklyStats;
        const aboveAskPct = wData.aboveListPricePct;
        soldListSubValue = aboveAskPct !== null && typeof aboveAskPct !== 'undefined'
            ? `Above Ask: ${aboveAskPct.toFixed(1)}%` 
            : `Based on latest weekly data`;
    } else {
        soldListSubValue = 'Monthly Average';
    }

    return [
      {
        label: 'Avg Sale Price',
        value: formatCurrency(currentData.avgPrice),
        subValue: `Median: ${formatCurrency(currentData.medPrice)}`,
        change: calculateChange(currentData.avgPrice, previousData?.avgPrice)
      },
      {
        label: 'Sales Volume',
        value: formatNumber(currentData.salesVolume),
        subValue: 'Verified',
        isVerified: true,
        change: calculateChange(currentData.salesVolume, previousData?.salesVolume)
      },
      {
        label: 'Months of Inventory',
        value: currentData.moi !== null ? currentData.moi.toFixed(2) : 'N/A',
        subValue: `Active Listings: ${formatNumber(currentData.activeListings)}`,
        change: calculateChange(currentData.moi, previousData?.moi)
      },
      {
        label: 'Sold / List Price',
        value: formatPercentage(currentData.soldListRatio),
        subValue: soldListSubValue,
        change: calculateChange(currentData.soldListRatio, previousData?.soldListRatio)
      }
    ];
  }, [currentData, previousData, viewMode]);

  const dateLabel = useMemo(() => {
      if (!currentData) return 'Loading...';
      if (viewMode === 'Weekly') return (currentData as WeeklyStats).weekRange;
      const mData = currentData as MonthlyStats;
      return `${mData.month} ${mData.year}`;
  }, [currentData, viewMode]);

  const compareLabel = viewMode === 'Weekly' ? 'vs Previous Week' : 'vs Previous Month';

  return (
    <section className="bg-kw-black text-kw-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Title & Selector */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {viewMode} Market Intelligence
            </h1>
            <p className="text-kw-main-gray text-lg mb-8 max-w-xl">
              Comprehensive performance analysis for Kingston, Frontenac, Belleville, Hastings, and Prince Edward County.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
               {/* Region Selector */}
               <div className="relative inline-block w-full sm:w-64">
                <label className="block text-xs font-semibold text-kw-main-gray uppercase tracking-wider mb-2">
                  Focus Area
                </label>
                <div className="relative">
                  <select 
                    value={selectedRegion}
                    onChange={(e) => onRegionChange(e.target.value as Region)}
                    className="block w-full appearance-none bg-kw-black/50 border border-kw-dark-gray hover:border-kw-main-gray text-kw-white py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-kw-red focus:border-transparent cursor-pointer transition-all"
                  >
                    {allRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-kw-main-gray">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-kw-main-gray uppercase tracking-wider mb-2">
                  Timeframe
                </label>
                <div className="flex bg-kw-black/50 p-1 rounded-lg border border-kw-dark-gray">
                  <button
                    onClick={() => onViewModeChange('Weekly')}
                    className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'Weekly' 
                        ? 'bg-kw-red text-kw-white shadow-sm' 
                        : 'text-kw-main-gray hover:text-kw-white hover:bg-kw-black/30'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Weekly
                  </button>
                  <button
                    onClick={() => onViewModeChange('Monthly')}
                    className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'Monthly' 
                        ? 'bg-kw-red text-kw-white shadow-sm' 
                        : 'text-kw-main-gray hover:text-kw-white hover:bg-kw-black/30'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Monthly
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Stats Grid */}
          <div className="bg-kw-white rounded-2xl p-6 shadow-xl text-kw-black">
            {stats ? (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4">
                  <div className="mb-2 sm:mb-0">
                    <span className="inline-block px-2 py-1 rounded bg-kw-light-gray/50 text-kw-dark-gray text-xs font-bold uppercase tracking-wide">
                      {viewMode === 'Weekly' ? 'Latest Week' : 'Latest Month'} ({dateLabel})
                    </span>
                    <span className="ml-2 text-xs text-green-600 font-medium">{compareLabel}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-kw-black">{selectedRegion}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-8">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-sm font-medium text-kw-main-gray mb-1">{stat.label}</span>
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-kw-black">{stat.value}</span>
                        <TrendBadge value={stat.change} />
                      </div>
                      <div className="flex items-center mt-1">
                        {stat.isVerified && (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                        )}
                        <span className="text-xs text-kw-dark-gray font-medium">{stat.subValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
               <div className="flex items-center justify-center h-64 text-kw-main-gray">
                 No data available for this selection.
               </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;