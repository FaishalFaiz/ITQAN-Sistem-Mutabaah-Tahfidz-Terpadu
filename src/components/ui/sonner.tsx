import React, { useState, useEffect } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SonnerToaster
      position={isMobile ? 'top-center' : 'top-right'}
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        className: 'font-sans text-xs shadow-lg border rounded-xl',
        classNames: {
          toast: 'bg-white text-slate-900 border-slate-200 shadow-md rounded-xl p-3.5',
          title: 'font-bold text-xs text-slate-900',
          description: 'text-[11px] text-slate-500 font-normal mt-0.5',
          actionButton: 'bg-[#0070BA] text-white text-xs font-semibold rounded-lg px-2.5 py-1',
          cancelButton: 'bg-slate-100 text-slate-600 text-xs font-medium rounded-lg px-2.5 py-1',
          closeButton: 'border-slate-200 text-slate-400 hover:text-slate-700 bg-white shadow-2xs',
        },
      }}
      {...props}
    />
  );
};

export { toast } from 'sonner';
