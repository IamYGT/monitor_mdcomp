import React from 'react';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import ControlPanel from '../components/dashboard/ControlPanel';
import MarketDataTable from '../components/dashboard/MarketDataTable';
import LogPanel from '../components/dashboard/LogPanel';
import SystemInfoPanel from '../components/dashboard/SystemInfoPanel';

const Dashboard: React.FC = () => {
    return (
        <div>
            <MetricsGrid />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                    <ControlPanel />
                </div>
                <div className="md:col-span-2">
                    <MarketDataTable />
                </div>
            </div>

            <SystemInfoPanel />

            <LogPanel />
        </div>
    );
};

export default Dashboard; 