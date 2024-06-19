import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('https://rotary-attendance.onrender.com/members');
        setMembers(response.data);
        setFilteredMembers(response.data);
        loadCheckboxState(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (date) {
      localStorage.setItem('attendanceDate', date);
      loadCheckboxState(members);
    }
  }, [date]);

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
      localStorage.removeItem('attendanceDate');
      localStorage.removeItem('checkboxState');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleCheckboxChange = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].present = !updatedMembers[index].present;
    setMembers(updatedMembers);
    saveCheckboxState(updatedMembers);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const saveCheckboxState = (members) => {
    const checkboxState = members.reduce((acc, member) => {
      acc[member.memberId] = member.present || false;
      return acc;
    }, {});
    localStorage.setItem('checkboxState', JSON.stringify(checkboxState));
  };

  const loadCheckboxState = (members) => {
    const savedDate = localStorage.getItem('attendanceDate');
    if (savedDate !== date) {
      const resetMembers = members.map(member => ({ ...member, present: false }));
      setMembers(resetMembers);
      setFilteredMembers(resetMembers);
      return;
    }

    const checkboxState = JSON.parse(localStorage.getItem('checkboxState') || '{}');
    const updatedMembers = members.map(member => ({
      ...member,
      present: checkboxState[member.memberId] || false,
    }));
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Rotary Club Attendance</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="attendance-form">
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="search" className="search-label">Search Members:</label>
            <input
              type="text"
              id="search"
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name..."
            />
          </div>
          <div className="members-list">
            {filteredMembers.map((member, index) => (
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
      </main>
    </div>
  );
}

export default App;