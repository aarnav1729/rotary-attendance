import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceRecords.css';

function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('https://rotary-attendance.onrender.com/attendance');
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };
    fetchRecords();
  }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const filteredRecords = records.filter(record =>
    record.events.some(event => new Date(event.date).toDateString() === new Date(date).toDateString())
  );

  return (
    <div className="AttendanceRecords">
      <header className="AttendanceRecords-header">
        <h1>Attendance Records</h1>
      </header>
      <main>
        <div className="form-group">
          <label htmlFor="date" className="date-label">Select Date:</label>
          <input
            type="date"
            id="date"
            className="date-input"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
        <div className="records-list">
          {filteredRecords.map(record => (
            <div key={record.memberId} className="record">
              <h2>{record.name}</h2>
              {record.events
                .filter(event => new Date(event.date).toDateString() === new Date(date).toDateString())
                .map((event, index) => (
                  <div key={index} className="event">
                    <p>Date: {new Date(event.date).toDateString()}</p>
                    <p>Present: {event.present ? 'Yes' : 'No'}</p>
                    <p>Absent: {event.absent ? 'Yes' : 'No'}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AttendanceRecords;