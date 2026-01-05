
import React, { useMemo } from 'react';
import { Region, WeeklyStats, MonthlyStats, ViewMode, METRIC_LABELS } from '../types';
import { formatCurrency, formatNumber, calculateChange } from '../utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';

interface InfographicProps {
  region: Region;
  viewMode: ViewMode;
  currentData: WeeklyStats | MonthlyStats | undefined;
  previousData: WeeklyStats | MonthlyStats | undefined;
  history: (WeeklyStats | MonthlyStats)[];
}

const TrendItem: React.FC<{ label: string; value: string; change: number }> = ({ label, value, change }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const colorClass = isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-500';
  
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
      <div className={`flex items-center mt-2 text-sm font-medium ${colorClass}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : 
         isNegative ? <ArrowDownRight className="w-4 h-4 mr-1" /> : 
         <Minus className="w-4 h-4 mr-1" />}
        <span>{Math.abs(change).toFixed(1)}%</span>
        <span className="text-gray-400 ml-1 font-normal text-xs">vs prev</span>
      </div>
    </div>
  );
};

const Infographic: React.FC<InfographicProps> = ({ region, viewMode, currentData, previousData, history }) => {
  
  const chartData = useMemo(() => {
    // Take last 12 periods, reverse to show oldest to newest
    return [...history].slice(0, 12).reverse().map(d => ({
      name: viewMode === 'Weekly' ? (d as WeeklyStats).weekRange.split(' - ')[0] : (d as MonthlyStats).month.substring(0, 3),
      price: d.avgPrice
    }));
  }, [history, viewMode]);

  const dateLabel = useMemo(() => {
    if (!currentData) return '';
    if (viewMode === 'Weekly') return (currentData as WeeklyStats).weekRange;
    const m = currentData as MonthlyStats;
    return `${m.month} ${m.year}`;
  }, [currentData, viewMode]);

  if (!currentData) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div id="infographic-container" className="bg-white w-[600px] min-h-[750px] flex flex-col relative overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-kw-red text-white p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <TrendingUp size={200} color="white" />
         </div>
         <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2 opacity-90">
                <span className="uppercase tracking-widest text-xs font-bold bg-white/20 px-2 py-1 rounded">
                    {viewMode} Update
                </span>
                <span className="text-xs font-medium">{dateLabel}</span>
            </div>
            <h1 className="text-4xl font-bold mb-1 tracking-tight">{region}</h1>
            <p className="text-white/80 font-light text-lg">Real Estate Market Intelligence</p>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-8 grid grid-cols-2 gap-4">
         <TrendItem 
            label="Avg Sale Price" 
            value={formatCurrency(currentData.avgPrice)} 
            change={calculateChange(currentData.avgPrice, previousData?.avgPrice ?? null)} 
         />
         <TrendItem 
            label="Sales Volume" 
            value={formatNumber(currentData.salesVolume)} 
            change={calculateChange(currentData.salesVolume, previousData?.salesVolume ?? null)} 
         />
         <TrendItem 
            label="Months of Inventory" 
            value={currentData.moi?.toFixed(2) || 'N/A'} 
            change={calculateChange(currentData.moi, previousData?.moi ?? null)} 
         />
         <TrendItem 
            label="Sold / List %" 
            value={`${currentData.soldListRatio}%`} 
            change={calculateChange(currentData.soldListRatio, previousData?.soldListRatio ?? null)} 
         />
      </div>

      {/* Chart Section */}
      <div className="px-8 pb-4 flex-grow">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center">
            Price Trend <span className="text-gray-400 font-normal text-sm ml-2">(Last 12 Periods)</span>
        </h3>
        <div className="h-48 w-full bg-gray-50 rounded-xl p-2 border border-gray-100">
           {/* Note: Using Recharts in standard HTML/Canvas export can sometimes be tricky with animations. 
               We disable animations for snapshot stability. */}
           <AreaChart width={530} height={170} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CE011F" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#CE011F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6B7280'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis hide domain={['auto', 'auto']} />
              <Area type="monotone" dataKey="price" stroke="#CE011F" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
           </AreaChart>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto bg-gray-900 text-white p-6 flex justify-between items-center">
        <div>
            <p className="font-bold text-lg">MarketPulse</p>
            <p className="text-gray-400 text-xs">Intelligence Dashboard</p>
        </div>
        <div className="text-right">
            <p className="text-gray-400 text-[10px] leading-tight max-w-[200px]">
                Data sourced from local real estate board statistics. 
                Not intended to solicit properties already listed.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Infographic;
