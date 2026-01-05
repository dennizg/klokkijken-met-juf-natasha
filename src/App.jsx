import React, { useState } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import GameContainer from './components/GameContainer';
import jufImage from './assets/compliments/06.png';

const PremiumMedal = ({ rank, size = 32 }) => {
  // ... (rest of PremiumMedal)
  const configs = {
    1: { color1: '#FFF07C', color2: '#FFD700', color3: '#CC8500', glow: 'rgba(255, 215, 0, 0.4)', ribbon: '#3B82F6' }, // Gold + Blue
    2: { color1: '#F4F4F4', color2: '#C0C0C0', color3: '#808080', glow: 'rgba(192, 192, 192, 0.4)', ribbon: '#3B82F6' }, // Silver + Blue
    3: { color1: '#E6A060', color2: '#CD7F32', color3: '#8B4513', glow: 'rgba(205, 127, 50, 0.4)', ribbon: '#3B82F6' }   // Bronze + Blue
  };

  const config = configs[rank] || configs[1];
  const height = size * 1.3;

  return (
    <div style={{ position: 'relative', width: size, height: height, filter: `drop-shadow(0 0 8px ${config.glow})` }}>
      <svg width={size} height={height} viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-rim-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color1} />
            <stop offset="50%" stopColor={config.color2} />
            <stop offset="100%" stopColor={config.color3} />
          </linearGradient>
          <radialGradient id={`grad-face-${rank}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={config.color1} />
            <stop offset="100%" stopColor={config.color2} />
          </radialGradient>
        </defs>

        {/* Ribbon */}
        <path d="M8 2 L24 2 L28 20 L16 15 L4 20 Z" fill={config.ribbon} />
        <path d="M12 2 L20 2 L22 17 L16 15 L10 17 Z" fill="rgba(255,255,255,0.2)" />
        <path d="M8 2 L24 2 L28 20 L16 15 L4 20 Z" fill="rgba(0,0,0,0.1)" />

        {/* Connection Ring */}
        <circle cx="16" cy="18" r="3" stroke={config.color2} strokeWidth="1.5" />

        {/* Medal Coin */}
        <g transform="translate(0, 10)">
          {/* Outer Rim */}
          <circle cx="16" cy="16" r="14" fill={`url(#grad-rim-${rank})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          {/* Face with Embossed Edge */}
          <circle cx="16" cy="16" r="11" fill={`url(#grad-face-${rank})`} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
          {/* Shine */}
          <path d="M9 9C9 9 11 7 16 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="black"
            style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}
          >
            {rank}
          </text>
        </g>
      </svg>
    </div>
  );
};

function App() {
  const [view, setView] = useState('menu'); // 'menu', 'game', 'settings'
  const [settings, setSettings] = useState({
    playerName: 'De Speler',
    inputMode: 'digital', // 'digital' | 'text'
    direction: 'analogue-to-input', // 'analogue-to-input' | 'input-to-analogue'
    hours: true,
    half: true,
    quarter: true,
    five: false,
    minutes: false,
    use24Hour: false
  });

  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('klokkijken_scores');
    return saved ? JSON.parse(saved) : [];
  });

  const saveScore = (name, score, gameSettings) => {
    if (score === 0) return; // Don't save 0 scores

    // Create a readable summary of settings
    const directionText = gameSettings.direction === 'analogue-to-input' ? 'Lezen' : 'Zetten';
    const inputModeText = gameSettings.inputMode === 'digital' ? (gameSettings.use24Hour ? '24u' : '12u') : 'Woorden';
    const difficultyMap = { hours: 'Hele uren', half: 'Halve uren', quarter: 'Kwartieren', five: 'Per 5 min', minutes: 'Per minuut' };
    const difficultyText = Object.keys(difficultyMap)
      .filter(k => gameSettings[k])
      .map(k => difficultyMap[k])
      .join(', ');

    const settingsSummary = `${directionText} (${inputModeText}) - ${difficultyText}`;

    const newScores = [...highScores, {
      name,
      score,
      settingsSummary,
      date: new Date().toLocaleDateString()
    }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setHighScores(newScores);
    localStorage.setItem('klokkijken_scores', JSON.stringify(newScores));
  };

  return (
    <div className="app-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ marginBottom: '10px', marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1 }}>
          Klok<br />Kijken
        </h1>
        {view === 'menu' && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={jufImage}
              alt="Juf Natasha"
              style={{
                width: '180px',
                height: 'auto',
                marginBottom: '10px',
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
              }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
              Oefenen met juf Natasha
            </p>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {view === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}
          >
            <motion.div
              className="glass-panel"
              whileHover={{ scale: 1.02 }}
              style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
            >
              <div style={{ fontSize: '4rem' }}>⏰</div>
              <h3 style={{ fontSize: '1.5rem' }}>Oefenen</h3>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Leer de klok lezen met leuke oefeningen!</p>
              <button
                className="glass-button"
                style={{ padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', background: 'var(--primary-accent)', color: '#000', border: 'none' }}
                onClick={() => setView('game')}
              >
                Starten
              </button>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <motion.button
                onClick={() => setView('scores')}
                className="glass-panel"
                whileTap={{ scale: 0.95 }}
                style={{ padding: '20px', textAlign: 'center', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.05)' }}
              >
                <h3>🏆 Score</h3>
              </motion.button>
              <motion.button
                onClick={() => setView('settings')}
                className="glass-panel"
                whileTap={{ scale: 0.95 }}
                style={{ padding: '20px', textAlign: 'center', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.05)' }}
              >
                <h3>⚙️ Opties</h3>
              </motion.button>
            </div>
          </motion.div>
        ) : view === 'scores' ? (
          <motion.div
            key="scores"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <button
                className="glass-panel"
                onClick={() => setView('menu')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                ← Terug
              </button>
            </div>
            <h2 style={{ textAlign: 'center' }}>Top 10 Scores</h2>
            <div className="glass-panel" style={{ padding: '10px', minHeight: '300px' }}>
              {highScores.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>Nog geen scores...</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', opacity: 0.6 }}>#</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', opacity: 0.6 }}>Speler</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem', opacity: 0.6 }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highScores.map((entry, index) => {
                      const isTop3 = index < 3;
                      const medalColors = ['#FFD700', '#C4C4C4', '#CD7F32'];

                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <td style={{ padding: '12px' }}>
                            {isTop3 ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px' }}>
                                <PremiumMedal rank={index + 1} size={32} />
                              </div>
                            ) : (
                              <span style={{ fontWeight: 'bold', opacity: 0.6, display: 'inline-block', width: '30px', textAlign: 'center' }}>{index + 1}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>{entry.name}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>{entry.settingsSummary || 'Oude score'}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{entry.score}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        ) : view === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <button
                className="glass-panel"
                onClick={() => setView('menu')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                ← Terug
              </button>
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Instellingen</h2>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Jouw Naam:</label>
                <input
                  type="text"
                  value={settings.playerName}
                  onChange={(e) => setSettings({ ...settings, playerName: e.target.value })}
                  placeholder="Typ je naam..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Opdracht:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSettings({ ...settings, direction: 'analogue-to-input' })}
                    className="glass-button"
                    style={{
                      flex: 1, padding: '10px', fontSize: '0.8rem',
                      background: settings.direction === 'analogue-to-input' ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
                      color: settings.direction === 'analogue-to-input' ? 'black' : 'white'
                    }}
                  >
                    Klok Lezen
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, direction: 'input-to-analogue' })}
                    className="glass-button"
                    style={{
                      flex: 1, padding: '10px', fontSize: '0.8rem',
                      background: settings.direction === 'input-to-analogue' ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
                      color: settings.direction === 'input-to-analogue' ? 'black' : 'white'
                    }}
                  >
                    Klok Zetten
                  </button>
                </div>
              </div>

              <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Input:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSettings({ ...settings, inputMode: 'digital' })}
                    className="glass-button"
                    style={{
                      flex: 1, padding: '10px',
                      background: settings.inputMode === 'digital' ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
                      color: settings.inputMode === 'digital' ? 'black' : 'white'
                    }}
                  >
                    12:00
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, inputMode: 'text' })}
                    className="glass-button"
                    style={{
                      flex: 1, padding: '10px',
                      background: settings.inputMode === 'text' ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
                      color: settings.inputMode === 'text' ? 'black' : 'white'
                    }}
                  >
                    Woorden
                  </button>
                </div>
                {settings.inputMode === 'digital' && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', cursor: 'pointer', opacity: 0.8 }}>
                      <span>24-uurs klok gebruiken</span>
                      <input
                        type="checkbox"
                        checked={settings.use24Hour}
                        onChange={(e) => setSettings({ ...settings, use24Hour: e.target.checked })}
                        style={{ transform: 'scale(1.1)', accentColor: 'var(--primary-accent)' }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Moeilijkheid:</label>
                {Object.entries({
                  hours: 'Hele uren',
                  half: 'Halve uren',
                  quarter: 'Kwartieren',
                  five: 'Per 5 minuten',
                  minutes: 'Per minuut'
                }).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1rem', cursor: 'pointer' }}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                      style={{ transform: 'scale(1.3)', accentColor: 'var(--primary-accent)' }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <button
              className="glass-button"
              style={{
                width: '100%',
                padding: '20px',
                marginTop: '20px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                background: 'var(--primary-accent)',
                color: 'black'
              }}
              onClick={() => setView('game')}
            >
              Start!
            </button>
          </motion.div >
        ) : (
          <GameContainer
            key="game"
            onExit={(finalScore) => {
              saveScore(settings.playerName, finalScore, settings);
              setView('menu');
            }}
            settings={settings}
          />
        )
        }
      </AnimatePresence >
    </div >
  );
}

export default App;
