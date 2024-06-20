import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Updated import
import App from './App';
import AttendanceRecords from './AttendanceRecords';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes> {/* Updated from Switch to Routes */}
        <Route path="/" element={<App />} /> {/* Updated Route */}
        <Route path="/records" element={<AttendanceRecords />} /> {/* Updated Route */}
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);