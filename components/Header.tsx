
import React, { useState } from 'react';
import { Menu, BarChart2, Bell, Settings } from 'lucide-react';
import { PomodoroTimer } from './PomodoroTimer';

interface HeaderProps {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, toggleSidebar, onOpenSettings }) => {
    const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

    return (
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 shrink-0">
             <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <Menu size={24} className="text-gray-600" />
                </button>
                 <h1 className="text-xl font-bold text-gray-800 ml-4">Tasks</h1>
            </div>
            <div className="flex items-center space-x-2">
                <PomodoroTimer />
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <BarChart2 size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                </button>
                <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-100">
                    <Settings size={20} className="text-gray-600" />
                </button>
            </div>
        </header>
    );
};
