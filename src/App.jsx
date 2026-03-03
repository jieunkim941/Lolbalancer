import { useState } from 'react';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';

const SCREENS = {
  INPUT: 'input',
  LOADING: 'loading',
  RESULT: 'result',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.INPUT);
  const [playerNames, setPlayerNames] = useState(Array(10).fill(''));
  const [teamData, setTeamData] = useState(null);

  const handleStartBalancing = (names) => {
    setPlayerNames(names);
    setScreen(SCREENS.LOADING);
  };

  const handleLoadingComplete = (data) => {
    setTeamData(data);
    setScreen(SCREENS.RESULT);
  };

  const handleReset = () => {
    setPlayerNames(Array(10).fill(''));
    setTeamData(null);
    setScreen(SCREENS.INPUT);
  };

  const handleReassign = (updatedTeamData) => {
    setTeamData(updatedTeamData);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0F0] font-sans">
      {screen === SCREENS.INPUT && (
        <InputScreen onStart={handleStartBalancing} />
      )}
      {screen === SCREENS.LOADING && (
        <LoadingScreen
          playerNames={playerNames}
          onComplete={handleLoadingComplete}
        />
      )}
      {screen === SCREENS.RESULT && (
        <ResultScreen
          teamData={teamData}
          onReassign={handleReassign}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
