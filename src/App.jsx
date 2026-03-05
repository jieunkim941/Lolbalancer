import { useState, useEffect, useRef } from 'react';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import { trackEvent } from './utils/analytics';

const SCREENS = {
  INPUT: 'input',
  LOADING: 'loading',
  RESULT: 'result',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.INPUT);
  const [playerNames, setPlayerNames] = useState(Array(10).fill(''));
  const [teamData, setTeamData] = useState(null);
  const prevScreen = useRef(screen);

  useEffect(() => {
    if (prevScreen.current !== screen) {
      trackEvent('screen_view', { screen_name: screen });
      prevScreen.current = screen;
    }
  }, [screen]);

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
    <div className="min-h-screen text-[#F0E6D2] font-sans">
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
