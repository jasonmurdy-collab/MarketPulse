import React, { useState, useMemo } from 'react';
import { Region, WeeklyStats, MonthlyStats, ViewMode } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils';
import { FileText, Filter, ChevronDown } from 'lucide-react';

interface DataTableProps {
  data: (WeeklyStats | MonthlyStats)[];
  allRegions: Region[];
  viewMode: ViewMode;
}

const DataTable: React.FC<DataTableProps> = ({ data, allRegions, viewMode }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All Areas');
  const [isOpen, setIsOpen] = useState(false);

  const filteredData = filterRegion === 'All Areas' 
    ? data 
    : data.filter(d => d.region === filterRegion);
  
  const displayData = filteredData;

  const dateRange = useMemo(() => {
    if (!data || data.length === 0) {
        return '';
    }
    // Data is sorted newest to oldest from App.tsx
    const oldestEntry = data[data.length - 1];
    const newestEntry = data[0];

    const getDate = (entry: any) => entry.weekEndDate || entry.date;

    const startYear = new Date(getDate(oldestEntry)).getFullYear();
    const endYear = new Date(getDate(newestEntry)).getFullYear();

    if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) return '';
    
    return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
  }, [data]);

  return (
    <section className="py-12 bg-kw-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-kw-light-gray/30 hover:bg-kw-light-gray/50 transition-all focus:outline-none focus:ring-2 focus:ring-kw-red"
          aria-expanded={isOpen}
          aria-controls="historical-data-content"
        >
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-kw-main-gray" />
            <div>
              <h3 className="text-lg font-bold text-kw-black">
                Historical {viewMode} Data Archive
              </h3>
              <p className="text-sm text-kw-dark-gray mt-1">
                {isOpen ? 'Hiding' : 'Showing'} full raw dataset ({dateRange})
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-6 h-6 text-kw-main-gray transition-transform transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <div
          id="historical-data-content"
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] mt-6' : 'max-h-0'}`}
        >
          <div className="flex justify-end mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-kw-main-gray" />
              </div>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="pl-10 pr-8 py-2 border border-kw-main-gray bg-kw-white rounded-md text-sm shadow-sm focus:ring-kw-red focus:border-kw-red text-kw-dark-gray"
              >
                <option value="All Areas">All Areas</option>
                {allRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-kw-light-gray/50">
                <tr>
                  {viewMode === 'Weekly' ? (
                      <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-kw-main-gray uppercase tracking-wider">Week</th>
                  ) : (
                      <>
                          <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-kw-main-gray uppercase tracking-wider">Year</th>
                          <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-kw-main-gray uppercase tracking-wider">Month</th>
                      </>
                  )}
                  <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-kw-main-gray uppercase tracking-wider">Area</th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-kw-main-gray uppercase tracking-wider">Avg Price</th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-kw-main-gray uppercase tracking-wider">Med Price</th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-kw-main-gray uppercase tracking-wider">Volume</th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-kw-main-gray uppercase tracking-wider">MOI</th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-kw-main-gray uppercase tracking-wider">SP/LP</th>
                </tr>
              </thead>
              <tbody className="bg-kw-white divide-y divide-gray-200">
                {displayData.map((row) => (
                  <tr key={row.id} className="hover:bg-kw-light-gray/30 transition-colors">
                    {viewMode === 'Weekly' ? (
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-kw-black font-medium">
                            {(row as WeeklyStats).weekRange}
                        </td>
                    ) : (
                        <>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-kw-black font-medium">
                              {(row as MonthlyStats).year}
                          </td>
                          <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-kw-black font-medium">
                              {(row as MonthlyStats).month}
                          </td>
                        </>
                    )}
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-kw-dark-gray">{row.region}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-kw-black">{formatCurrency(row.avgPrice)}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-kw-dark-gray">{formatCurrency(row.medPrice)}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-kw-black">{formatNumber(row.salesVolume)}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-kw-black">{row.moi !== null ? row.moi.toFixed(2) : 'N/A'}</td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-right text-kw-black">{formatPercentage(row.soldListRatio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayData.length === 0 && (
              <div className="text-center py-8 text-kw-main-gray text-sm">No data found for this selection.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DataTable;