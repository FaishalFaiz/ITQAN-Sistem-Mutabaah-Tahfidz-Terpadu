import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mumtaz' | 'jayyid' | 'iadah' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const styles = {
    mumtaz: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    jayyid: 'bg-amber-50 text-amber-700 border-amber-200',
    iadah: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-[#EBF5FB] text-[#0070BA] border-[#D6EAF8]',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium border rounded-md ${styles[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
