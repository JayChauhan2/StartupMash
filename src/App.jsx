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

function getRandomStartups() {
  const count = startupData.length;
  if (count < 2) return [];
  const idx1 = Math.floor(Math.random() * count);
  let idx2 = Math.floor(Math.random() * count);
  while (idx1 === idx2) {
    idx2 = Math.floor(Math.random() * count);
  }
  return [startupData[idx1], startupData[idx2]];
}

function Home({ handleVote }) {
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    setStartups(getRandomStartups());
  }, []);

  const onSelect = (startup) => {
    handleVote(startup);
    setStartups(getRandomStartups());
  };

  if (startups.length !== 2) return null;

  return (
    <main className="main-content">
      <h1 className="prompt-text">
        Who's Gonna Be The Bigger Company? Click to choose
      </h1>
      
      <div className="facemash-container">
        {startups.map((startup) => (
          <div 
            key={startup.id} 
            className="startup-card"
            onClick={() => onSelect(startup)}
          >
            <div className="startup-image-placeholder">
              Image Not Available
            </div>
            <h2 className="startup-name">
              {startup.name} <span className="startup-batch">({startup.batch || 'N/A'})</span>
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
                  <td>{item.data.batch || 'N/A'}</td>
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
