
import { useState, useEffect } from 'react';
import { Region, WeeklyStats, MonthlyStats } from '../types';
import { parseCSV, cleanAndParseFloat, cleanAndParseInt, getDataFromRow } from '../utils';

// --- Data Source Configuration ---
const WEEKLY_DATA_URLS: Record<Region, string> = {
  [Region.Kingston]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1935375826&single=true&output=csv",
  [Region.Frontenac]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1540014949&single=true&output=csv",
  [Region.Hastings]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1422042199&single=true&output=csv",
  [Region.Belleville]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1857723725&single=true&output=csv",
  [Region.PrinceEdwardCounty]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=836418180&single=true&output=csv",
  [Region.Brockville]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1286157929&single=true&output=csv",
  [Region.Napanee]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1314638594&single=true&output=csv",
  [Region.SmithsFalls]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRL0AB15iRxvoajVsmMRTVtMRcP0zUkSjaai-YSGM0UbfvZlbKnlKDEonVWSWZH62OtxQrSupYgKIKh/pub?gid=1658093978&single=true&output=csv",
};

const MONTHLY_DATA_URLS: Record<Region, string> = {
  [Region.Kingston]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=89996054&single=true&output=csv",
  [Region.Frontenac]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=1133685564&single=true&output=csv",
  [Region.Hastings]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=1136077494&single=true&output=csv",
  [Region.Belleville]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=1797918775&single=true&output=csv",
  [Region.PrinceEdwardCounty]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=1197029142&single=true&output=csv",
  [Region.Brockville]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=550301966&single=true&output=csv",
  [Region.Napanee]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=992528255&single=true&output=csv",
  [Region.SmithsFalls]: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRocE8w6_MR_6i9mz6z7p1eMQgnnvkDdqWCZUK-Qt3fnCljtoFBwPzZPWnkjUU7NEShuEuO7NPLlQID/pub?gid=1879633506&single=true&output=csv",
};
// ---------------------

// Helper to format 'YYYY-MM-DD' into 'Mon Day' e.g. 'May 19'
const formatDateForRange = (dateString: string | undefined): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const useMarketData = () => {
  const [allWeeklyData, setAllWeeklyData] = useState<WeeklyStats[]>([]);
  const [allMonthlyData, setAllMonthlyData] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const fetchAndParse = async <T,>(
        url: string, 
        parser: (data: any[], region: Region) => T[]
      ): Promise<T[]> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
        const csvText = await res.text();
        const parsedData = parseCSV<any>(csvText);
        // The region is derived from the URL key, not from the data itself.
        const region = Object.keys(WEEKLY_DATA_URLS).find(key => (WEEKLY_DATA_URLS[key as Region] === url || MONTHLY_DATA_URLS[key as Region] === url)) as Region;
        return parser(parsedData, region);
      };

      const weeklyParser = (data: any[], region: Region): WeeklyStats[] => {
        return data.map((row, index): WeeklyStats | null => {
          const endDate = getDataFromRow(row, ['end_date', 'End Date']);
          if (!endDate) return null;
          let weekRange = getDataFromRow(row, ['Week', 'Week Range']);
          if (!weekRange) {
            const startDate = getDataFromRow(row, ['start_date', 'Start Date']);
            const formattedStart = formatDateForRange(startDate);
            const formattedEnd = formatDateForRange(endDate);
            if (formattedStart && formattedEnd) weekRange = `${formattedStart} - ${formattedEnd}`;
          }
          return {
            id: `w-${region}-${index}`,
            weekRange: weekRange || 'N/A', weekEndDate: endDate, region,
            avgPrice: cleanAndParseFloat(getDataFromRow(row, ['Avg Sale Price', 'Average Sale Price', 'avg_sale_price'])),
            medPrice: cleanAndParseFloat(getDataFromRow(row, ['Med Sale Price', 'Median Sale Price', 'med_sale_price'])),
            salesVolume: cleanAndParseInt(getDataFromRow(row, ['Sale Volume', 'Volume', 'sales_volume', 'Sales'])),
            activeListings: cleanAndParseInt(getDataFromRow(row, ['Active Listings', '# Active Listings', 'active_listings'])),
            moi: cleanAndParseFloat(getDataFromRow(row, ['MOI', 'Months of Inventory', 'moi'])),
            soldListRatio: cleanAndParseFloat(getDataFromRow(row, ['SP/LP', 'Average SP/LP', 'sp_lp_ratio'])),
            aboveListPricePct: cleanAndParseFloat(getDataFromRow(row, ['Above List Price %', 'above_list_price_pct'])),
          };
        }).filter((item): item is WeeklyStats => item !== null);
      };

      const monthlyParser = (data: any[], region: Region): MonthlyStats[] => {
        return data.map((row, index) => {
          const year = cleanAndParseInt(getDataFromRow(row, ['Year']));
          const month = getDataFromRow(row, ['Month']);
          if (!year || !month) return null;
          const date = new Date(Date.parse(`${month} 1, ${year}`));
          const isoDate = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
          if (!isoDate) return null;
          return {
            id: `m-${region}-${index}`, year, month, date: isoDate, region,
            avgPrice: cleanAndParseFloat(getDataFromRow(row, ['Avg Sale Price', 'Average Sale Price'])),
            medPrice: cleanAndParseFloat(getDataFromRow(row, ['Med Sale Price', 'Median Sale Price'])),
            salesVolume: cleanAndParseInt(getDataFromRow(row, ['Sale Volume', 'Sales Volume'])),
            activeListings: cleanAndParseInt(getDataFromRow(row, ['# Active Listings', 'Active Listings'])),
            moi: cleanAndParseFloat(getDataFromRow(row, ['MOI', 'Months of Inventory', 'moi'])),
            soldListRatio: cleanAndParseFloat(getDataFromRow(row, ['Average SP/LP', 'SP/LP'])),
          };
        }).filter((item): item is MonthlyStats => item !== null);
      };

      // 1. Fetch Priority Data (Kingston Weekly & Monthly)
      // This allows the app to render the main view immediately while others load in bg
      try {
        const priorityRegions = [Region.Kingston];
        
        const priorityWeeklyPromises = priorityRegions.map(r => 
           fetchAndParse(WEEKLY_DATA_URLS[r], weeklyParser).catch(e => { console.warn(e); return [] as WeeklyStats[]; })
        );
        const priorityMonthlyPromises = priorityRegions.map(r => 
           fetchAndParse(MONTHLY_DATA_URLS[r], monthlyParser).catch(e => { console.warn(e); return [] as MonthlyStats[]; })
        );

        const priorityResults = await Promise.all([...priorityWeeklyPromises, ...priorityMonthlyPromises]);
        
        // Flatten results
        const priorityWeekly = priorityResults.slice(0, priorityRegions.length).flat() as WeeklyStats[];
        const priorityMonthly = priorityResults.slice(priorityRegions.length).flat() as MonthlyStats[];

        setAllWeeklyData(priorityWeekly);
        setAllMonthlyData(priorityMonthly);
        
        // If we have at least Kingston data, stop the main loading spinner/skeleton
        if (priorityWeekly.length > 0 || priorityMonthly.length > 0) {
            setLoading(false); 
        }

        // 2. Fetch Remaining Data (Background)
        const otherRegions = Object.values(Region).filter(r => !priorityRegions.includes(r));
        
        const otherWeeklyPromises = otherRegions.map(r => 
            fetchAndParse(WEEKLY_DATA_URLS[r], weeklyParser).catch(e => { console.warn(e); return [] as WeeklyStats[]; })
        );
        const otherMonthlyPromises = otherRegions.map(r => 
            fetchAndParse(MONTHLY_DATA_URLS[r], monthlyParser).catch(e => { console.warn(e); return [] as MonthlyStats[]; })
        );

        const otherResults = await Promise.all([...otherWeeklyPromises, ...otherMonthlyPromises]);

        const otherWeekly = otherResults.slice(0, otherRegions.length).flat() as WeeklyStats[];
        const otherMonthly = otherResults.slice(otherRegions.length).flat() as MonthlyStats[];

        setAllWeeklyData(prev => [...prev, ...otherWeekly]);
        setAllMonthlyData(prev => [...prev, ...otherMonthly]);

        // Ensure loading is false if it wasn't already (e.g. if priority fetch failed entirely)
        setLoading(false);

      } catch (err) {
        console.error("Critical error fetching market data:", err);
        setError("Unable to load market data. Please try refreshing the page.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { allWeeklyData, allMonthlyData, loading, error };
};
