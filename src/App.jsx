import { useState } from 'react';
import Home from './pages/Home';
import Classes from './pages/Classes';
import CalorieTracker from './pages/CalorieTracker';
import Exercises from './pages/Exercises';

function App() {
  const [tab, setTab] = useState('home');

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'classes', label: '📅 Classes' },
    { id: 'calories', label: '🍎 Calorie Tracker' },
    { id: 'exercises', label: '🏋️ Exercises' },
  ];

  return (
    <div>
      <nav className="navbar">
        <span className="brand">💪 FitLife</span>
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container">
        {tab === 'home' && <Home goTo={setTab} />}
        {tab === 'classes' && <Classes />}
        {tab === 'calories' && <CalorieTracker />}
        {tab === 'exercises' && <Exercises />}
      </main>
    </div>
  );
}

export default App;