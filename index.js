// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import Tailwind CSS file for global styles
import App from './App'; // Import the main App component

const rootElement = document.getElementById('root'); // Get the root DOM element
const root = ReactDOM.createRoot(rootElement); // Create a root for React rendering

root.render(
  <React.StrictMode>
    <App /> {/* Render the App component */}
  </React.StrictMode>
);
