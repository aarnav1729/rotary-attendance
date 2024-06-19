const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

dotenv.config();

console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const attendanceSchema = new mongoose.Schema({
  memberId: String,
  name: String,
  email: String,
  events: [{ date: Date, present: Boolean }]
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

app.get('/', (req, res) => {
  res.send('Rotary Club Attendance Tracker');
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App-specific password
  }
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;
  sendEmail(to, subject, text);
  res.status(200).send('Email sent');
});

// Add a new attendance record and send an email
app.post('/attendance', async (req, res) => {
  const { memberId, name, email, date, present } = req.body;
  let attendance = await Attendance.findOne({ memberId });

  if (!attendance) {
    attendance = new Attendance({ memberId, name, email, events: [] });
  }

  attendance.events.push({ date, present });
  await attendance.save();

  res.status(201).send(attendance);
});

// Get attendance records
app.get('/attendance', async (req, res) => {
  const attendance = await Attendance.find({});
  res.status(200).send(attendance);
});

// Fetch all members
app.get('/members', async (req, res) => {
  try {
    const members = await Attendance.find({}, 'memberId name email');
    res.status(200).send(members);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching members' });
  }
});

// Send monthly emails
const sendMonthlyEmails = async () => {
  const attendanceRecords = await Attendance.find({});
  attendanceRecords.forEach(record => {
    const emailText = `Hello ${record.name},\n\nYour attendance record for this month:\n` +
      record.events.map(event => `Date: ${event.date.toDateString()}, Present: ${event.present}`).join('\n');
    console.log('Sending email to:', record.email); // Log the email sending
    sendEmail(record.email, 'Monthly Attendance Report', emailText);
  });
};

// Schedule the sendMonthlyEmails function at the end of each month
cron.schedule('0 0 1 * *', sendMonthlyEmails);

// Test endpoint for sending emails
app.get('/test-email', async (req, res) => {
  try {
    await sendMonthlyEmails();
    res.status(200).send('Test emails sent successfully');
  } catch (error) {
    console.log('Error in test-email endpoint:', error);
    res.status(500).send({ error: 'Error sending test emails' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});