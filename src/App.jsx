import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import startupData from './data.json';
import './App.css';

function Header() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0 },
      colors: ['#ffffff', '#ffeb3b', '#4caf50', '#2196f3', '#ff9800']
    });
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={triggerConfetti}>
          <Link to="/">StartupMash</Link>
        </div>
        <nav className="nav-links">
          <Link to="/top100">Top 100</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}

const validStartups = startupData.filter(startup => {
  if (!startup.website) return false;
  if (!startup.one_liner || startup.one_liner.trim() === '') return false;
  try {
    const urlString = startup.website.startsWith('http') ? startup.website : `https://${startup.website}`;
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
});

function getRandomStartups() {
  const count = validStartups.length;
  if (count < 2) return [];
  const idx1 = Math.floor(Math.random() * count);
  let idx2 = Math.floor(Math.random() * count);
  while (idx1 === idx2) {
    idx2 = Math.floor(Math.random() * count);
  }
  return [validStartups[idx1], validStartups[idx2]];
}

function formatBatch(batch) {
  if (!batch) return 'N/A';
  const parts = batch.split(' ');
  if (parts.length === 2) {
    const season = parts[0][0];
    const year = parts[1].slice(-2);
    return `${season}${year}`;
  }
  return batch;
}

function StartupLogo({ website, name }) {
  const [error, setError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setError(false);
    setUseFallback(false);
  }, [website]);

  if (!website) {
    return (
      <div className="startup-image-placeholder" style={{ fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
        No Website Provided
      </div>
    );
  }

  let hostname = '';
  try {
    const urlString = website.startsWith('http') ? website : `https://${website}`;
    hostname = new URL(urlString).hostname;
  } catch (e) {
    return (
      <div className="startup-image-placeholder" style={{ fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
        Invalid URL: {website}
      </div>
    );
  }

  if (error) {
    return (
      <div className="startup-image-placeholder" style={{ fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
        Image Failed to Load: {hostname}
      </div>
    );
  }

  const imgSrc = useFallback 
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
    : `https://logo.clearbit.com/${hostname}?size=400`;

  return (
    <div className="startup-image-container">
      <img 
        src={imgSrc} 
        alt={`${name} logo`} 
        className="startup-logo-img"
        onError={() => {
          if (!useFallback) {
            setUseFallback(true);
          } else {
            setError(true);
          }
        }}
      />
    </div>
  );
}

function Home({ handleVote }) {
  const [startups, setStartups] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setStartups(getRandomStartups());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (startups.length !== 2 || selectedId !== null) return;
      if (e.key === 'ArrowLeft') {
        onSelect(startups[0]);
      } else if (e.key === 'ArrowRight') {
        onSelect(startups[1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startups, selectedId]);

  const onSelect = (startup) => {
    if (selectedId !== null) return; // Prevent multiple votes
    setSelectedId(startup.id);
    handleVote(startup);
    
    setTimeout(() => {
      setStartups(getRandomStartups());
      setSelectedId(null);
    }, 400);
  };

  if (startups.length !== 2) return null;

  return (
    <main className="main-content">
      <h1 className="prompt-text">
        Who's Gonna Be The Bigger Company? Arrow keys or click to choose
      </h1>
      
      <div className="facemash-container">
        {startups.map((startup, index) => (
          <React.Fragment key={startup.id}>
            <div 
              className="startup-card"
              onClick={() => onSelect(startup)}
            >
              {selectedId === startup.id && <div className="plus-one-animation">+1</div>}
              <StartupLogo website={startup.website} name={startup.name} />
              <h2 className="startup-name">
                {startup.name} <span className="startup-batch">({formatBatch(startup.batch)})</span>
              </h2>
              <p className="startup-oneliner">
                {startup.one_liner || 'No description available'}
                {startup.website && (
                  <>
                    {' '}
                    <a 
                      href={startup.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="startup-website-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      [link]
                    </a>
                  </>
                )}
              </p>
            </div>
            {index === 0 && <div className="or-divider">OR</div>}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}

function Top100({ rankings }) {
  // Sort rankings by wins
  const sortedRankings = Object.values(rankings).sort((a, b) => b.wins - a.wins).slice(0, 100);

  return (
    <div className="empty-page">
      <div className="top100-container">
        <h1 className="top100-title">Top 100 Startups</h1>
        {sortedRankings.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No startups ranked yet. Go vote!</p>
        ) : (
          <table className="top100-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Batch</th>
                <th>Wins</th>
              </tr>
            </thead>
            <tbody>
              {sortedRankings.map((item, index) => (
                <tr key={item.data.id}>
                  <td>#{index + 1}</td>
                  <td>{item.data.name}</td>
                  <td>{formatBatch(item.data.batch)}</td>
                  <td>{item.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EmptyPage() {
  return <div className="empty-page"></div>;
}

function App() {
  const [rankings, setRankings] = useState({});

  const handleVote = (winner) => {
    setRankings(prev => {
      const newRankings = { ...prev };
      if (!newRankings[winner.id]) {
        newRankings[winner.id] = { wins: 0, data: winner };
      }
      newRankings[winner.id].wins += 1;
      return newRankings;
    });
  };

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home handleVote={handleVote} />} />
        <Route path="/top100" element={<Top100 rankings={rankings} />} />
        <Route path="/about" element={<EmptyPage />} />
      </Routes>
    </div>
  );
}

export default App;
