import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(localStorage.getItem('date') || '');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('https://rotary-attendance.onrender.com/members');
        const fetchedMembers = response.data;
        const savedCheckboxState = JSON.parse(localStorage.getItem(`checkboxState-${date}`)) || {};

        // Restore the checkbox state for the current date
        const updatedMembers = fetchedMembers.map(member => ({
          ...member,
          present: savedCheckboxState[member.memberId] || false,
        }));

        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, [date]);

  useEffect(() => {
    // Save checkbox state to localStorage whenever members state changes
    const checkboxState = members.reduce((acc, member) => {
      acc[member.memberId] = member.present || false;
      return acc;
    }, {});
    localStorage.setItem(`checkboxState-${date}`, JSON.stringify(checkboxState));
  }, [members, date]);

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

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    localStorage.setItem('date', newDate);
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
              onChange={handleDateChange}
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