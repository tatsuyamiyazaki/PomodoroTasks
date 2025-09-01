
import React from 'react';
import { Menu, BarChart2, Bell, Settings } from 'lucide-react';

interface HeaderProps {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    onOpenSettings: () => void;
    onOpenReports: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, toggleSidebar, onOpenSettings, onOpenReports }) => {
    return (
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 shrink-0">
             <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Menu size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
                 <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 ml-4">Focus Pomodoro</h1>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onOpenReports} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <BarChart2 size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
            </div>
        </header>
    );
};