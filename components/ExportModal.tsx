
import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Infographic from './Infographic';
import { Region, ViewMode, WeeklyStats, MonthlyStats } from '../types';
import { Download } from 'lucide-react';

// Declare html2canvas globally as it's loaded via script tag
declare const html2canvas: any;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  viewMode: ViewMode;
  currentData: WeeklyStats | MonthlyStats | undefined;
  previousData: WeeklyStats | MonthlyStats | undefined;
  history: (WeeklyStats | MonthlyStats)[];
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, onClose, region, viewMode, currentData, previousData, history 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const infographicRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!infographicRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // 1. Clone the element to ensure we capture a clean, unscaled version
      // This solves issues where the preview scaling affects the output image resolution/layout
      const element = infographicRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      
      // 2. Style the clone to be fixed size and off-screen
      // We set specific width to match the design (600px)
      clone.style.position = 'fixed';
      clone.style.left = '-10000px'; // Move off-screen
      clone.style.top = '0';
      clone.style.width = '600px'; 
      clone.style.height = 'auto'; // Let height adjust naturally
      clone.style.transform = 'none'; // Ensure no transforms (scale) are active
      clone.style.zIndex = '-1000';
      clone.style.backgroundColor = '#ffffff'; // Ensure white background

      // Append to body so it renders
      document.body.appendChild(clone);

      // 3. Wait a brief moment for any layout/rendering to settle in the new context
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. Capture with html2canvas
      const canvas = await html2canvas(clone, {
  scale: 3, // Increased to 3 for very crisp text (High-End feel)
  useCORS: true,
  backgroundColor: '#ffffff', 
  logging: false,
  windowWidth: 1200, 
  // Add this to improve text rendering
  onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById('infographic-container');
      if (clonedElement) {
          // Force font smoothing for capture
          clonedElement.style.fontFeatureSettings = '"salt"';
          clonedElement.style.webkitFontSmoothing = 'antialiased';
      }
  }
});

      // 5. Cleanup: Remove the clone
      document.body.removeChild(clone);

      // 6. Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `MarketPulse-${region}-${viewMode}-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      
      setIsGenerating(false);
    } catch (err) {
      console.error("Export failed:", err);
      setIsGenerating(false);
      alert("Failed to generate image. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Market Snapshot">
      <div className="flex flex-col items-center">
        <p className="text-sm text-kw-main-gray mb-4 text-center">
          Share this snapshot on social media or with your clients.
        </p>
        
        {/* Preview Container */}
        {/* We use CSS transform for visual preview, but the export logic (above) 
            clones the raw content to ignore this scale for the final image. */}
        <div className="w-full overflow-hidden bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 flex justify-center relative h-[500px]">
           <div className="transform scale-[0.6] origin-top-center absolute top-4">
              <div ref={infographicRef} className="shadow-lg">
                <Infographic 
                    region={region} 
                    viewMode={viewMode} 
                    currentData={currentData} 
                    previousData={previousData} 
                    history={history}
                />
              </div>
           </div>
        </div>

        <div className="flex w-full space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-kw-red text-white rounded-lg hover:bg-kw-red-dark transition-colors disabled:opacity-50 shadow-md"
          >
            {isGenerating ? (
              <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Processing...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
