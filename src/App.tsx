import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './viewmodels/contexts/AppContext';
import Sidebar from './views/components/layout/Sidebar';
import MainContent from './views/components/layout/MainContent';
import Dashboard from './views/pages/Dashboard';
import MarketData from './views/pages/MarketData';
import Connections from './views/pages/Connections';
import Settings from './views/pages/Settings';

const App: React.FC = () => {
  // WebSocket URL'i, gerçek uygulamanızda kendi WebSocket sunucunuzun URL'i olacak
  const wsUrl = 'wss://154.194.35.202';

  return (
    <Router>
      <AppProvider wsUrl={wsUrl}>
        <div className="flex min-h-screen bg-gray-900 text-gray-100">
          <Sidebar />
          <MainContent>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/market-data" element={<MarketData />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </MainContent>
        </div>
      </AppProvider>
    </Router>
  );
};

export default App;
