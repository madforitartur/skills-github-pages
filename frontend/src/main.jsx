import React from 'react';
import ReactDOM from 'react-dom/client';
import DashboardPage from './components/pages/DashboardPage';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardPage />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);