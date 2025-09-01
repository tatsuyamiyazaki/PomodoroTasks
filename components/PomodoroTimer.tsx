import React from 'react';
import type { PomodoroMode } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
    timeLeft: number;
    mode: PomodoroMode;
    isActive: boolean;
    toggleTimer: () => void;
    resetTimer: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ timeLeft, mode, isActive, toggleTimer, resetTimer }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const modeTextMap: Record<PomodoroMode, string> = {
        work: '作業時間',
        shortBreak: '短い休憩',
        longBreak: '長い休憩'
    };

    return (
        <div className="flex items-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full px-4 py-1.5 font-semibold">
            <span>{formatTime(timeLeft)}</span>
            <span className="mx-2 text-red-300 dark:text-red-500">|</span>
            <span>{modeTextMap[mode]}</span>
            <button onClick={toggleTimer} className="ml-2 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/60">
                {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={resetTimer} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/60">
                <RotateCcw size={16} />
            </button>
        </div>
    );
};
