import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({ label, value, helperText, icon: Icon, trend }: MetricCardProps) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {helperText && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
      </div>
    </div>
  );
};
