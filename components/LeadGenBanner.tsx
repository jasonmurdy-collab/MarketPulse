import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Region } from '../types';
import Modal from './Modal';

interface LeadGenBannerProps {
  region: Region;
}

const LeadGenBanner: React.FC<LeadGenBannerProps> = ({ region }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting' || status === 'success') return;
    setStatus('submitting');
    
    try {
      const response = await fetch("https://formspree.io/f/myzrjbow", {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setStatus('success');
        // Show success message for 2 seconds, then close the modal
        setTimeout(() => {
          setIsModalOpen(false);
          // Reset form state after modal has finished closing animation
          setTimeout(() => {
            setFormData({ name: '', email: '', address: '' });
            setStatus('idle');
          }, 300);
        }, 2000);
      } else {
        throw new Error('Form submission failed.');
      }
    } catch (error) {
      console.error("Formspree submission error:", error);
      setStatus('error');
      // Revert to idle state after showing the error for a few seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <>
      <section className="bg-kw-red py-16 relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              <circle cx="90" cy="10" r="20" fill="white" />
            </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-kw-red-dark text-kw-white text-xs font-medium mb-6 border border-kw-red-dark">
            <span className="flex h-2 w-2 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kw-red/50 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kw-red"></span>
            </span>
            Join 1,200+ Local Investors
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-kw-white mb-4 tracking-tight">
            Don't miss a beat in {region}.
          </h2>
          <p className="text-kw-white mb-10 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Get this weekly market intelligence report delivered straight to your inbox every Monday morning. 
            Spot trends before they hit the headlines.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 rounded-lg font-bold transition-all flex items-center justify-center shadow-lg bg-kw-white text-kw-red hover:bg-kw-white/80 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Subscribe Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
          
          <p className="text-kw-white/80 text-xs mt-6 opacity-80">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => status !== 'submitting' && setIsModalOpen(false)}
        title="Subscribe to Market Intelligence"
      >
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-kw-black">You're Subscribed!</h3>
            <p className="text-kw-dark-gray mt-2">Thanks for joining. The next report is on its way to your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-md p-3 text-center">
                Something went wrong. Please try again.
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-kw-dark-gray mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-kw-light-gray rounded-md shadow-sm focus:ring-kw-red focus:border-kw-red"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kw-dark-gray mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-kw-light-gray rounded-md shadow-sm focus:ring-kw-red focus:border-kw-red"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-kw-dark-gray mb-1">Address / Neighbourhood of Interest</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Kingston or 123 Main St"
                className="w-full px-4 py-2 border border-kw-light-gray rounded-md shadow-sm focus:ring-kw-red focus:border-kw-red"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-kw-white bg-kw-red hover:bg-kw-red-dark transition-all disabled:bg-kw-main-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kw-red"
            >
              {status === 'submitting' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
};

export default LeadGenBanner;