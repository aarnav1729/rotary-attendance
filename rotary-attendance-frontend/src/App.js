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
          emailSent: false,
          present: false
        }));
        console.log('Members fetched:', membersWithStatus); // Log the response
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
        })
      );
      await Promise.all(promises);
      alert('Attendance marked successfully');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleCheckboxChange = async (id) => {
    const updatedMembers = members.map(member => {
      if (member.memberId === id) {
        const updatedMember = { ...member, present: !member.present };
        if (updatedMember.present && !updatedMember.emailSent) {
          sendEmail(updatedMember.email, 'Attendance Confirmation', `Hello ${updatedMember.name},\n\nYour attendance has been recorded:\nDate: ${new Date(date).toDateString()}, Present: Yes`);
          updatedMember.emailSent = true;
        }
        return updatedMember;
      }
      return member;
    });
    setMembers(updatedMembers);

    const updatedFilteredMembers = filteredMembers.map(member => {
      if (member.memberId === id) {
        return { ...member, present: !member.present };
      }
      return member;
    });
    setFilteredMembers(updatedFilteredMembers);
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

  const sendEmail = async (to, subject, text) => {
    try {
      await axios.post('https://rotary-attendance.onrender.com/send-email', {
        to,
        subject,
        text
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
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
                  <input
                    type="checkbox"
                    className="member-checkbox"
                    checked={member.present || false}
                    onChange={() => handleCheckboxChange(member.memberId)}
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