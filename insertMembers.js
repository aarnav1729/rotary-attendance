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
  { memberId: "1", name: "John Doe", email: "john.doe@example.com" },
  { memberId: "2", name: "Jane Smith", email: "jane.smith@example.com" },
  { memberId: "50", name: "Victor Mitchell", email: "victor.mitchell@example.com" }
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
