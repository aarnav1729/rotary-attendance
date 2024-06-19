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
        console.log('Members fetched:', response.data); // Log the response
        setMembers(response.data);
        setFilteredMembers(response.data);
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
    const updatedFilteredMembers = [...filteredMembers];
    updatedFilteredMembers[index].present = !updatedFilteredMembers[index].present;
    setFilteredMembers(updatedFilteredMembers);

    const memberIndex = members.findIndex(member => member.memberId === filteredMembers[index].memberId);
    if (memberIndex !== -1) {
      const updatedMembers = [...members];
      updatedMembers[memberIndex].present = !updatedMembers[memberIndex].present;
      setMembers(updatedMembers);
    }
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