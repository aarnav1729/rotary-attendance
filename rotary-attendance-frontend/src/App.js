import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(localStorage.getItem('selectedDate') || '');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('https://rotary-attendance.onrender.com/members');
        const membersWithStatus = response.data.map(member => ({
          ...member,
          present: false,
          absent: false
        }));
        setMembers(membersWithStatus);
        setFilteredMembers(membersWithStatus);
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
          absent: member.absent || false,
        })
      );
      await Promise.all(promises);
      alert('Attendance marked successfully');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handlePresentClick = (id) => {
    const updatedMembers = members.map(member => {
      if (member.memberId === id) {
        return { ...member, present: !member.present, absent: member.present ? false : member.absent };
      }
      return member;
    });
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
  };

  const handleAbsentClick = (id) => {
    const updatedMembers = members.map(member => {
      if (member.memberId === id) {
        return { ...member, absent: !member.absent, present: member.absent ? false : member.present };
      }
      return member;
    });
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
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
    localStorage.setItem('selectedDate', newDate);
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
            {filteredMembers.map(member => (
              <div key={member.memberId} className="member">
                <label className="member-label">
                  {member.name}
                  <button
                    type="button"
                    className={`attendance-button ${member.present ? 'present' : ''}`}
                    onClick={() => handlePresentClick(member.memberId)}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    className={`attendance-button ${member.absent ? 'absent' : ''}`}
                    onClick={() => handleAbsentClick(member.memberId)}
                  >
                    Absent
                  </button>
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