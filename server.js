const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

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

// Add a new attendance record
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

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const sendMonthlyEmails = async () => {
  const attendanceRecords = await Attendance.find({});
  attendanceRecords.forEach(record => {
    const emailText = `Hello ${record.name},\n\nYour attendance record for this month:\n` +
      record.events.map(event => `Date: ${event.date.toDateString()}, Present: ${event.present}`).join('\n');
    sendEmail(record.email, 'Monthly Attendance Report', emailText);
  });
};

// Schedule the sendMonthlyEmails function at the end of each month
const cron = require('node-cron');
cron.schedule('0 0 1 * *', sendMonthlyEmails);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});