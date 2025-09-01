import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PomodoroMode } from '../types';
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
    const [settings, setSettings] = useState({
        work: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
    });
    const [mode, setMode] = useState<PomodoroMode>('work');
    const [timeLeft, setTimeLeft] = useState(settings.work * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessions, setSessions] = useState(0);
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const switchMode = useCallback(() => {
        setIsActive(false);
        if (mode === 'work') {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            if (newSessions % settings.longBreakInterval === 0) {
                setMode('longBreak');
                setTimeLeft(settings.longBreak * 60);
            } else {
                setMode('shortBreak');
                setTimeLeft(settings.shortBreak * 60);
            }
        } else {
            setMode('work');
            setTimeLeft(settings.work * 60);
        }
    }, [mode, sessions, settings]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            switchMode();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, timeLeft, switchMode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setTimeLeft(settings[mode] * 60);
    };

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
             <button className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/60">
                <ChevronDown size={16} />
            </button>
        </div>
    );
};