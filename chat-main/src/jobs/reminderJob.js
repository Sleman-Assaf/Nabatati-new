
const cron = require('node-cron');
const Conversation = require('../models/conversation');


const HOURS_BEFORE_REMINDER = 48;

/**
 * Sends a reminder notification to a user via socket.
 * 
 * @param {String} consultationId - The ID of the consultation for which the reminder is being sent.
 * @param {String} userId - The ID of the user to whom the reminder is directed.
 * @param {Object} io - The socket.io server instance used to send the notification.
 * @param {Map} connectedUsers - A map containing connected users with their socket information.
 * 
 * Emits a 'reminder' event to the specified user's socket if they are connected, indicating that their consultation
 * has not been answered within 48 hours. If the user is not connected, logs a message indicating the reminder was not sent.
 */
const sendReminder = async (consultationId, userId, io, connectedUsers) => {
    const user = connectedUsers.get(userId);
    if (user && user.socketId) {
        io.to(user.socketId).emit('reminder', {
            consultationId,
            message: 'your consultation was not answered within 48 hours. Would you like to resend it?'
        });
        console.log('reminder sent to user:', userId);
    } else {
        console.log('user not connected, reminder not sent:', userId);
    }
};

/**
 * Executes a reminder job to notify users about pending consultations.
 * 
 * This function retrieves consultations that have been pending for more
 * than a specified number of hours (`HOURS_BEFORE_REMINDER`) and have not
 * yet been marked as having received a reminder. For each qualifying
 * consultation, it sends a reminder to the user via socket.io if they
 * are currently connected. It then updates the consultation record to
 * indicate that a reminder was sent.
 * 
 * @param {Object} io - The socket.io server instance used to send notifications.
 * @param {Map} connectedUsers - A map containing connected users with their socket information.
 * 
 * Logs any errors encountered during the execution of the reminder job.
 */
const runReminderJob = async (io, connectedUsers) => {
    try {

        const now = new Date();

        const consultations = await Conversation.find({
            status: { $in: ['pending'] },
            reminderSent: false,
            createdAt: { $lte: new Date(now.getTime() - HOURS_BEFORE_REMINDER * 60 * 60 * 1000) } // check if 48h passed since the consultation was created
        });

        await Promise.all(consultations.map(async (consultation) => {
            await sendReminder(consultation._id, consultation.userId, io, connectedUsers);
            consultation.reminderSent = true; // mark as reminder sent
            await consultation.save(); // save the updated consultation
        }));
        console.log(`Processed ${consultations.length} pending consultations for reminders.`);
    } catch (error) {
        console.error('Error running reminder job:', error.message);
    };
};

//startReminderJob function to run the reminder job every hour

/**
 * Schedules a recurring task to execute the reminder job.
 *
 * This function uses a cron schedule to run the `runReminderJob`
 * function every hour. The job checks for consultations that
 * require a reminder to be sent and sends notifications to users
 * via socket.io if they are connected.
 *
 * @param {Object} io - The socket.io server instance used to send notifications.
 * @param {Map} connectedUsers - A map containing connected users with their socket information.
 */

const startReminderJob = (io, connectedUsers) => {
    cron.schedule('0 * * * *', () => runReminderJob(io, connectedUsers)); // كل ساعة
};

module.exports = { startReminderJob };
