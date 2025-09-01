
import React from 'react';
import type { Task, PomodoroMode } from '../types';
import { Play, Pause, RotateCcw, XCircle } from 'lucide-react';

interface PomodoroFocusModalProps {
    isOpen: boolean;
    task: Task | null;
    timeLeft: number;
    mode: PomodoroMode;
    isActive: boolean;
    toggleTimer: () => void;
    resetTimer: () => void;
    stopSession: () => void;
}

export const PomodoroFocusModal: React.FC<PomodoroFocusModalProps> = ({
    isOpen,
    task,
    timeLeft,
    mode,
    isActive,
    toggleTimer,
    resetTimer,
    stopSession,
}) => {
    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const modeInfo = {
        work: { text: '作業時間', color: 'bg-red-500', textColor: 'text-red-100' },
        shortBreak: { text: '短い休憩', color: 'bg-green-500', textColor: 'text-green-100' },
        longBreak: { text: '長い休憩', color: 'bg-blue-500', textColor: 'text-blue-100' },
    };

    const currentModeInfo = modeInfo[mode];

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-colors duration-500 ${currentModeInfo.color}`}>
            <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="absolute top-5 right-5">
                    <button onClick={stopSession} className="p-2 rounded-full hover:bg-black/20" aria-label="セッションを終了">
                        <XCircle size={32} />
                    </button>
                </div>

                <div className="text-center">
                    <p className={`text-2xl font-medium mb-4 ${currentModeInfo.textColor}`}>{currentModeInfo.text}</p>
                    <h1 className="text-4xl font-bold mb-8 truncate max-w-xl px-4">{task?.title || 'Focus Session'}</h1>
                </div>

                <div className="font-mono text-9xl font-bold tracking-widest mb-12">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center space-x-8">
                    <button onClick={resetTimer} className="p-4 rounded-full border-2 border-white/50 hover:border-white transition-colors" aria-label="リセット">
                        <RotateCcw size={28} />
                    </button>
                    <button onClick={toggleTimer} className="w-24 h-24 flex items-center justify-center bg-white text-gray-800 rounded-full text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform" aria-label={isActive ? "一時停止" : "再生"}>
                        {isActive ? <Pause size={48} /> : <Play size={48} className="ml-2" />}
                    </button>
                    <div className="w-16 h-16"></div>
                </div>
            </div>
        </div>
    );
};
