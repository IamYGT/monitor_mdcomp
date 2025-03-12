import React from 'react';
import { LogEntry } from '../../../models/interfaces/AppState';

interface LogItemProps {
    log: LogEntry;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
    // Log tipine göre stil belirleme
    const logTypeStyles = {
        info: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
        success: 'bg-green-500/10 border-green-600 text-green-500',
        warning: 'bg-amber-500/10 border-amber-600 text-amber-500',
        error: 'bg-red-500/10 border-red-600 text-red-500'
    };

    const typeStyle = logTypeStyles[log.type];

    return (
        <div className={`py-3 px-4 my-2 rounded-lg text-sm font-mono border transition-all hover:translate-x-1 ${typeStyle}`}>
            <small className="mr-2 opacity-75">{log.timestamp.toLocaleTimeString()}</small>
            {log.message}
        </div>
    );
};

export default LogItem; 