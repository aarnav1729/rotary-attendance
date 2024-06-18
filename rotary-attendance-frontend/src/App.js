import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [present, setPresent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/attendance', { memberId, name, email, date, present });
      alert('Attendance marked successfully');
      setMemberId('');
      setName('');
      setEmail('');
      setDate('');
      setPresent(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Rotary Club Attendance</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Member ID" 
          value={memberId} 
          onChange={(e) => setMemberId(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
        <label className="checkbox-container">
          Present:
          <input 
            type="checkbox" 
            checked={present} 
            onChange={(e) => setPresent(e.target.checked)} 
          />
          <span className="checkmark"></span>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;