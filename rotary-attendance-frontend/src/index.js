import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App'; // Adjusted import path
import AttendanceRecords from './AttendanceRecords'; // Adjusted import path
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/records" component={AttendanceRecords} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);