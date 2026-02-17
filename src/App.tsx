import React, { useState } from 'react';
import { TargetData } from './types';
import Wizard from './components/Wizard';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [target, setTarget] = useState<TargetData | null>(null);

  const handleLaunch = (data: TargetData) => {
    setTarget(data);
  };

  const handleReset = () => {
    setTarget(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-500 relative">
      {/* Scanline overlay global */}
      <div className="scanlines"></div>

      {target ? (
        <Dashboard target={target} onReset={handleReset} onNewSearch={handleLaunch} />
      ) : (
        <Wizard onDeploy={handleLaunch} />
      )}
    </div>
  );
};

export default App;
