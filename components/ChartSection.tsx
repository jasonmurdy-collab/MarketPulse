import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { MetricType, METRIC_LABELS, Region, REGION_COLORS, WeeklyStats, MonthlyStats, ViewMode } from '../types';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils';

interface ChartSectionProps {
  historicalData: (WeeklyStats | MonthlyStats)[];
  latestPeriodData: (WeeklyStats | MonthlyStats)[]; // Data for all regions for the latest period
  selectedRegion: Region;
  viewMode: ViewMode;
}

const ChartSection: React.FC<ChartSectionProps> = ({ historicalData, latestPeriodData, selectedRegion, viewMode }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('avgPrice');

  const chartHistory = useMemo(() => {
    // historicalData is sorted newest-to-oldest. Reverse it for charting (oldest-to-newest).
    const oldestToNewest = [...historicalData].reverse();

    if (viewMode === 'Weekly') {
        const uniqueWeeks = [...new Set((oldestToNewest as WeeklyStats[]).map(d => d.weekEndDate))];
        const recentWeeks = uniqueWeeks.slice(-52); // Last year
        const recentWeeksSet = new Set(recentWeeks);
        return (oldestToNewest as WeeklyStats[]).filter(d => recentWeeksSet.has(d.weekEndDate));
    } else {
        const uniqueMonths = [...new Set((oldestToNewest as MonthlyStats[]).map(d => d.date))];
        const recentMonths = uniqueMonths.slice(-24); // Last 2 years
        const recentMonthsSet = new Set(recentMonths);
        return (oldestToNewest as MonthlyStats[]).filter(d => recentMonthsSet.has(d.date));
    }
  }, [historicalData, viewMode]);

  const lineChartData = useMemo(() => {
    const timePoints = Array.from(new Set(
      chartHistory.map(d => viewMode === 'Weekly' ? (d as WeeklyStats).weekRange : (d as MonthlyStats).date)
    ));

    return timePoints.map(point => {
      const entry: Record<string, any> = { name: point };

      if (viewMode === 'Weekly') {
        // Fix: Explicitly cast 'point' to 'string' as 'split' method is only available on strings.
        entry.displayName = (point as string).split(' - ')[0]; // Show only start of week
      } else {
        const d = new Date(point as string);
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
        entry.displayName = adjustedDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      }

      Object.values(Region).forEach(r => {
        const dataPoint = chartHistory.find(d => {
            const pointValue = viewMode === 'Weekly' ? (d as WeeklyStats).weekRange : (d as MonthlyStats).date;
            return pointValue === point && d.region === r;
        });
        if (dataPoint) {
          entry[r] = dataPoint[activeMetric];
        }
      });
      return entry;
    });
  }, [chartHistory, viewMode, activeMetric]);


  const dateRangeLabel = useMemo(() => {
    if (chartHistory.length === 0) return viewMode === 'Weekly' ? 'Last 52 Weeks' : 'Last 24 Months';
    
    const firstEntry = chartHistory[0];
    const lastEntry = chartHistory[chartHistory.length - 1];
    
    // Helper to format an ISO date string to "Month Year" (e.g., "Jan 2023") or "N/A"
    const formatYearMonth = (dateStr: string): string => {
        const date = new Date(dateStr + 'T00:00:00'); // Ensure it's parsed as local start of day
        if (isNaN(date.getTime())) return 'N/A'; // Handle invalid dates gracefully
        return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    };

    if (viewMode === 'Weekly') {
        const wFirst = firstEntry as WeeklyStats;
        const wLast = lastEntry as WeeklyStats;
        return `${formatYearMonth(wFirst.weekEndDate)} - ${formatYearMonth(wLast.weekEndDate)}`;
    } else {
        const mFirst = firstEntry as MonthlyStats;
        const mLast = lastEntry as MonthlyStats;
        return `${mFirst.month} ${mFirst.year} - ${mLast.month} ${mLast.year}`;
    }
    // FIX: Corrected typo from `viewMoe` to `viewMode` in the dependency array.
  }, [chartHistory, viewMode]);

  // Data for Bar Chart
  const barChartData = latestPeriodData.map(d => ({
    name: d.region,
    value: d[activeMetric],
    color: REGION_COLORS[d.region]
  }));

  const formatYAxis = (val: number | null) => {
    if (val === null) return '';
    if (activeMetric === 'avgPrice') return `$${Math.round(val / 1000)}k`;
    if (activeMetric === 'soldListRatio') return `${val}%`;
    return val.toString();
  };

  const formatTooltip = (val: number | null) => {
    if (val === null) return 'N/A';
    if (activeMetric === 'avgPrice') return formatCurrency(val);
    if (activeMetric === 'soldListRatio') return `${val}%`;
    return formatNumber(val);
  };

  return (
    <section className="py-12 bg-kw-light-gray/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-2 bg-kw-red/10 rounded-lg text-kw-red">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-kw-black">
                {viewMode} Market Trends
            </h2>
          </div>

          <div className="flex bg-kw-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            {(Object.keys(METRIC_LABELS) as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeMetric === metric 
                    ? 'bg-kw-red text-kw-white shadow-sm' 
                    : 'text-kw-dark-gray hover:bg-gray-50 hover:text-kw-black'
                }`}
              >
                {METRIC_LABELS[metric]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trend Line Chart */}
          <div className="lg:col-span-2 bg-kw-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-kw-black mb-6 flex items-center">
              {METRIC_LABELS[activeMetric]} Trend
              <span className="ml-2 text-xs font-normal text-kw-dark-gray bg-kw-light-gray/50 px-2 py-1 rounded">
                {dateRangeLabel}
              </span>
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="kw-light-gray/50" />
                  <XAxis 
                    dataKey="displayName"
                    tick={{fill: 'kw-main-gray', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                    minTickGap={40}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickFormatter={formatYAxis} 
                    tick={{fill: 'kw-main-gray', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | null, name: string) => {
                        if (value === null) return [null, null];
                        return [formatTooltip(value), name];
                    }}
                    labelFormatter={(label) => `${viewMode === 'Weekly' ? 'Week' : 'Month'}: ${label}`}
                  />
                  {/* Render lines for all regions */}
                  {Object.values(Region).map((region) => (
                    <Line
                      key={region}
                      type="monotone"
                      dataKey={region}
                      name={region}
                      stroke={REGION_COLORS[region]}
                      strokeWidth={region === selectedRegion ? 3 : 1.5}
                      strokeOpacity={region === selectedRegion ? 1 : 0.4}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      connectNulls={false} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 justify-center">
              {Object.values(Region).map(r => (
                <div key={r} className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: REGION_COLORS[r], opacity: r === selectedRegion ? 1 : 0.4 }}
                  ></span>
                  <span className={`text-xs ${r === selectedRegion ? 'font-bold text-kw-black' : 'text-kw-dark-gray'}`}>
                    {r}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Comparison Bar Chart */}
          <div className="bg-kw-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-kw-black mb-2">Regional Comparison</h3>
            <p className="text-sm text-kw-dark-gray mb-6">
                {viewMode === 'Weekly' ? 'Latest Week' : 'Latest Month'}
            </p>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="kw-light-gray/50" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{fill: 'kw-main-gray', fontSize: 11}} 
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | null, name: string) => [formatTooltip(value), METRIC_LABELS[activeMetric]]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-4 bg-kw-red/10 rounded-lg border border-kw-red/20">
               <div className="flex items-start">
                 <div className="flex-shrink-0 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-kw-red rounded-full"></div>
                 </div>
                 <p className="ml-2 text-xs text-kw-red-dark leading-5">
                   <strong>Insight:</strong> Tracking {METRIC_LABELS[activeMetric].toLowerCase()} is vital for understanding {selectedRegion}'s immediate market velocity relative to its neighbors.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartSection;