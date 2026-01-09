
import React, { useMemo } from 'react';
import { Region, WeeklyStats, MonthlyStats, ViewMode } from '../types';
import { formatCurrency, formatNumber, calculateChange } from '../utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Home, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface InfographicProps {
  region: Region;
  viewMode: ViewMode;
  currentData: WeeklyStats | MonthlyStats | undefined;
  previousData: WeeklyStats | MonthlyStats | undefined;
  history: (WeeklyStats | MonthlyStats)[];
}

const KpiCard: React.FC<{ 
  label: string; 
  value: string; 
  change: number; 
  icon: React.ElementType 
}> = ({ label, value, change, icon: Icon }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  // KW Colors: Positive doesn't always have to be green in high-end design, 
  // but for clarity we keep it. We use a darker, more professional green/red.
  const trendColor = isPositive ? 'text-emerald-700' : isNegative ? 'text-red-700' : 'text-gray-500';
  const TrendIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
  
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={48} className="text-kw-black" />
      </div>
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">{label}</p>
        <h4 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h4>
      </div>
      <div className={`flex items-center mt-3 text-sm font-semibold ${trendColor} bg-gray-50 w-fit px-2 py-1 rounded`}>
        <TrendIcon className="w-4 h-4 mr-1" />
        <span>{Math.abs(change).toFixed(1)}%</span>
        <span className="text-gray-400 ml-1.5 font-normal text-[10px] uppercase">vs prev</span>
      </div>
    </div>
  );
};

const Infographic: React.FC<InfographicProps> = ({ region, viewMode, currentData, previousData, history }) => {
  
  const chartData = useMemo(() => {
    // Take last 12 periods
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
    // Fixed width 600px matches the export modal logic. 
    // Min-height ensures it looks like a vertical poster/flyer.
    <div id="infographic-container" className="bg-white w-[600px] min-h-[800px] flex flex-col relative overflow-hidden font-sans text-kw-black">
      
      {/* High-End Header */}
      <div className="bg-kw-black text-white p-8 relative">
         {/* Decorative red accent line */}
         <div className="absolute top-0 left-0 w-full h-1.5 bg-kw-red"></div>
         
         <div className="flex justify-between items-end relative z-10">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                  <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-gray-300">
                      Market Intelligence Report
                  </span>
                  <div className="h-px w-8 bg-kw-red"></div>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-1">{region}</h1>
              <p className="text-gray-400 font-light text-sm">{viewMode} Overview • {dateLabel}</p>
            </div>
            
            {/* Logo Placeholder / Brand Mark */}
            <div className="bg-white/10 p-2 rounded backdrop-blur-sm border border-white/10">
                <TrendingUp size={32} className="text-kw-red" />
            </div>
         </div>
         
         {/* Abstract background pattern */}
         <div className="absolute -bottom-12 -right-12 opacity-5">
             <div className="w-48 h-48 rounded-full border-[16px] border-white"></div>
         </div>
      </div>

      <div className="p-8 flex-grow bg-gray-50/50">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <KpiCard 
              label="Avg Sale Price" 
              value={formatCurrency(currentData.avgPrice)} 
              change={calculateChange(currentData.avgPrice, previousData?.avgPrice ?? null)}
              icon={DollarSign}
           />
           <KpiCard 
              label="Sales Volume" 
              value={formatNumber(currentData.salesVolume)} 
              change={calculateChange(currentData.salesVolume, previousData?.salesVolume ?? null)}
              icon={BarChart3}
           />
           <KpiCard 
              label="Inventory (MOI)" 
              value={currentData.moi?.toFixed(2) || 'N/A'} 
              change={calculateChange(currentData.moi, previousData?.moi ?? null)}
              icon={Home}
           />
           <KpiCard 
              label="Sold / List Ratio" 
              value={`${currentData.soldListRatio}%`} 
              change={calculateChange(currentData.soldListRatio, previousData?.soldListRatio ?? null)}
              icon={PieChart}
           />
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Price Trend</h3>
                <p className="text-xs text-gray-500 mt-1">Market movement over the last 12 periods</p>
             </div>
             <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-kw-red"></div>
                <span className="text-[10px] text-gray-500 uppercase">Avg Price</span>
             </div>
          </div>
          
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CE011F" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#CE011F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 500}} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                        interval="preserveStartEnd" 
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#CE011F" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        isAnimationActive={false} 
                    />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-6 border-t border-gray-100 mt-auto">
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-kw-red flex items-center justify-center text-white font-bold text-lg rounded">
                    KW
                </div>
                <div>
                    <p className="font-bold text-sm text-kw-black leading-tight">KELLER WILLIAMS</p>
                    <p className="text-[10px] text-gray-400 tracking-wider">INSPIRE REALTY</p>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-[9px] text-gray-400 leading-tight max-w-[250px]">
                    Not intended to solicit buyers or sellers currently under contract. 
                    Data sourced from local board statistics. 
                    Independent Office.
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Infographic;
