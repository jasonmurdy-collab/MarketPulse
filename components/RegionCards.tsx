
import React from 'react';
import { Region } from '../types';

interface RegionCardsProps {
  onSelect: (region: Region) => void;
  selectedRegion: Region;
  isLoading?: boolean;
}

const REGION_META: Record<Region, { desc: string, bg: string }> = {
    [Region.Kingston]: { 
        desc: "Urban Center", 
        bg: "bg-gradient-to-tr from-kw-red to-kw-red/70" 
    },
    [Region.PrinceEdwardCounty]: { 
        desc: "Luxury & Vineyards", 
        bg: "bg-gradient-to-tr from-kw-main-gray to-kw-main-gray/70"
    },
    [Region.Frontenac]: { 
        desc: "Lakes & Wilderness", 
        bg: "bg-gradient-to-tr from-kw-dark-gray to-kw-dark-gray/70"
    },
    [Region.Belleville]: { 
        desc: "Gateway to Quinte", 
        bg: "bg-gradient-to-tr from-amber-500 to-amber-300" 
    },
    [Region.Hastings]: { 
        desc: "Rural & Recreation", 
        bg: "bg-gradient-to-tr from-purple-500 to-purple-300" 
    },
    [Region.Brockville]: { 
        desc: "Historic River City", 
        bg: "bg-gradient-to-tr from-cyan-600 to-cyan-400"
    },
    [Region.Napanee]: { 
        desc: "Historic & Vibrant", 
        bg: "bg-gradient-to-tr from-pink-600 to-pink-400"
    },
    [Region.SmithsFalls]: { 
        desc: "Heart of the Rideau", 
        bg: "bg-gradient-to-tr from-orange-600 to-amber-400"
    },
};

const AbstractBackground: React.FC = () => (
    <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="dot-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="white" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
    </div>
);


const RegionCards: React.FC<RegionCardsProps> = ({ onSelect, selectedRegion, isLoading }) => {
  if (isLoading) {
    return (
      <section className="py-12 bg-kw-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-kw-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl font-bold text-kw-black mb-8">Explore by Region</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Object.values(Region).map((region) => (
            <button
              key={region}
              onClick={() => onSelect(region)}
              className={`group relative overflow-hidden rounded-xl text-left transition-all duration-300 h-32 ${
                selectedRegion === region 
                  ? 'ring-4 ring-kw-red ring-offset-2' 
                  : 'hover:shadow-lg hover:-translate-y-1'
              } ${REGION_META[region].bg}`}
            >
              <AbstractBackground />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 p-4 z-20">
                <p className="text-white font-bold text-sm leading-tight">{region}</p>
                <p className="text-gray-200 text-xs mt-1">{REGION_META[region].desc}</p>
              </div>
              {selectedRegion === region && (
                 <div className="absolute top-2 right-2 z-20 bg-kw-red rounded-full p-1 shadow-lg">
                   <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionCards;
