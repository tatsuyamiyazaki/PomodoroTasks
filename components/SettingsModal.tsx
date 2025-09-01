
import React from 'react';
import type { SidebarViewSettings, Theme } from '../types';
import { ViewType } from '../types';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SidebarViewSettings;
  onUpdateSettings: (newSettings: SidebarViewSettings) => void;
  theme: Theme;
  onUpdateTheme: (theme: Theme) => void;
}

// A simple toggle switch component
const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
    >
        <span
        aria-hidden="true"
        className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const allViews: { type: Exclude<ViewType, ViewType.PROJECT>; title: string }[] = [
    { type: ViewType.TODAY, title: '今日' },
    { type: ViewType.OVERDUE, title: '期限切れ' },
    { type: ViewType.TOMORROW, title: '明日' },
    { type: ViewType.THIS_WEEK, title: '今週' },
    { type: ViewType.NEXT_7_DAYS, title: '次の7日間' },
    { type: ViewType.CALENDAR, title: 'カレンダー' },
    { type: ViewType.HIGH_PRIORITY, title: '優先順位: 高い' },
    { type: ViewType.COMPLETED, title: '完了済み' },
    { type: ViewType.ALL, title: 'フォーカス' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, theme, onUpdateTheme }) => {
  if (!isOpen) return null;

  const handleToggle = (viewType: ViewType, isChecked: boolean) => {
    onUpdateSettings({
      ...settings,
      [viewType]: isChecked,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">設定</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="閉じる">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">サイドバー表示設定</h3>
          <ul className="space-y-3">
            {allViews.map((view) => (
              <li key={view.type} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">{view.title}</span>
                <ToggleSwitch
                  checked={settings[view.type] !== false}
                  onChange={(isChecked) => handleToggle(view.type, isChecked)}
                />
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">テーマ設定</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => onUpdateTheme('light')}
              className={`w-full py-2 rounded-md text-sm font-medium border transition-colors ${
                theme === 'light'
                  ? 'bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              ライト
            </button>
            <button
              onClick={() => onUpdateTheme('dark')}
              className={`w-full py-2 rounded-md text-sm font-medium border transition-colors ${
                theme === 'dark'
                  ? 'bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              ダーク
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};