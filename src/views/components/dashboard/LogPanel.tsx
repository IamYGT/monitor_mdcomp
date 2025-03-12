import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LogItem from '../ui/LogItem';
import { useLogger } from '../../../viewmodels/hooks/useLogger';

const LogPanel: React.FC = () => {
    const { logs, clearLogs } = useLogger();

    return (
        <Card
            title="Sistem Logları"
            actions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearLogs}
                    icon={<i className="bi bi-trash"></i>}
                >
                    Temizle
                </Button>
            }
        >
            <div className="h-96 overflow-y-auto px-2">
                {logs.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        Henüz log kaydı bulunmuyor.
                    </div>
                ) : (
                    logs.map(log => <LogItem key={log.id} log={log} />)
                )}
            </div>
        </Card>
    );
};

export default LogPanel; 