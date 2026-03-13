import React from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actionSlot?: React.ReactNode;
  className?: string;
}

export const SectionCard = ({ title, description, children, actionSlot, className = "" }: SectionCardProps) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || actionSlot) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {actionSlot && <div>{actionSlot}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
