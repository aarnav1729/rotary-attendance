const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

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

const members = [
  { memberId: "7", name: "Aarnav Singh", email: "aarnavsingh836@gmail.com" },
];

const insertMembers = async () => {
  try {
    await Attendance.insertMany(members);
    console.log('Members inserted successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting members:', error);
  }
};

insertMembers();
