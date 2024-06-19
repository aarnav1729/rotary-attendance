const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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
  events: [{ date: Date, present: Boolean, absent: Boolean }]
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

app.get('/', (req, res) => {
  res.send('Rotary Club Attendance Tracker');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: 'glrd urqj fvtu lrcu'
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

app.post('/attendance', async (req, res) => {
  const { memberId, name, email, date, present, absent } = req.body;
  let attendance = await Attendance.findOne({ memberId });

  if (!attendance) {
    attendance = new Attendance({ memberId, name, email, events: [] });
  }

  attendance.events.push({ date, present, absent });
  await attendance.save();

  res.status(201).send(attendance);
});

app.get('/attendance', async (req, res) => {
  const attendance = await Attendance.find({});
  res.status(200).send(attendance);
});

app.get('/members', async (req, res) => {
  try {
    const members = await Attendance.find({}, 'memberId name email');
    res.status(200).send(members);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching members' });
  }
});

const sendMonthlyEmails = async () => {
  const attendanceRecords = await Attendance.find({});
  attendanceRecords.forEach(record => {
    const emailText = `Hello ${record.name},\n\nYour attendance record for this month:\n` +
      record.events.map(event => `Date: ${event.date.toDateString()}, Present: ${event.present ? 'Yes' : 'No'}, Absent: ${event.absent ? 'Yes' : 'No'}`).join('\n');
    console.log('Sending email to:', record.email);
    sendEmail(record.email, 'Monthly Attendance Report', emailText);
  });
};

cron.schedule('0 0 1 * *', sendMonthlyEmails);

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