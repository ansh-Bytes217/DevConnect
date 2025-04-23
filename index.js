// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App'; // Import the main App component

const rootElement = document.getElementById('root'); // Get the root DOM element
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App /> {/* Render the App component */}
  </React.StrictMode>
);
