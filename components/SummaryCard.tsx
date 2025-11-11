import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, unit, color = 'text-gray-800' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
      <div className={`text-3xl font-semibold ${color}`}>
        {value}
        {unit && <span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-1">{unit}</span>}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
};