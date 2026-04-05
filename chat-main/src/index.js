
// const {instrument} = require('@socket.io/admin-ui');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const cron = require('node-cron');

const socketHandeler = require('./socket/socketHandeler.js');
const { startConsultationChecker } = require('./jobs/consultationChecker');
const { startReminderJob } = require('./jobs/reminderJob');
const consultationRoutes  = require('./routes/consultation.route.js');
const engineerRoutes = require('./routes/engineer.routes');
const messages = require('./routes/messages.routes.js');

const inboxRoutes = require('./routes/inbox.routes');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const connectedUsers = new Map();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});
// Admin UI configuration
// instrument(io, {auth : false}); // disable authentication for admin UI

// Middlewares
app.set('socketio', io);
app.set('connectedUsers', connectedUsers);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //use it if we want to send data to the server as a form.  ???  if we accept data as json from the fron using fetch/axios then we don't need this. -> اتاكد من سليمان كيف رح يبعتلي الداتا

// Routes
app.use('/api/consultation', consultationRoutes);  

app.use('/api/engineer', engineerRoutes);  //done/ok

app.use('/api/messages', messages);  // !! done

app.use('/api/inbox', inboxRoutes);  // !! done

// Socket.io connection
socketHandeler(io, connectedUsers);

(async () => {
  try {

    console.time("Server startup time");

    await connectDB();

    const PORT = process.env.PORT || 3100;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      startConsultationChecker();
      
      // !!!!
      cron.schedule('0 * * * *', () => startConsultationChecker());

      startReminderJob(io, connectedUsers); // start the reminder job

      // console.timeEnd("Server startup time");
    });
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
    process.exit(1); // exit the process with failure
  } finally {
    console.timeEnd("Server startup time");
  }
})();
