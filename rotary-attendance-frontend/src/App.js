import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('https://rotary-attendance.onrender.com/members');
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const promises = members.map(member =>
        axios.post('https://rotary-attendance.onrender.com/attendance', {
          memberId: member.memberId,
          name: member.name,
          email: member.email,
          date,
          present: member.present || false,
        })
      );
      await Promise.all(promises);
      alert('Attendance marked successfully');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleCheckboxChange = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].present = !updatedMembers[index].present;
    setMembers(updatedMembers);
  };

  return (
    <div className="App">
      <h1>Rotary Club Attendance</h1>
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="date-input-container">
          <label htmlFor="date" className="date-label">Select Date:</label>
          <input
            type="date"
            id="date"
            className="date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="members-list">
          {members.map((member, index) => (
            <div key={member.memberId} className="member">
              <label className="member-label">
                <input
                  type="checkbox"
                  className="member-checkbox"
                  checked={member.present || false}
                  onChange={() => handleCheckboxChange(index)}
                />
                {member.name}
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="submit-button">Submit Attendance</button>
      </form>
    </div>
  );
}

export default App;