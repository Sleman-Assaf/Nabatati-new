const jwt = require('jsonwebtoken');
const Message = require('../models/message');
const { endConsultation } = require('../utils/consultations'); 
const Conversation = require('../models/conversation');
require('dotenv').config();


module.exports = (io , connectedUsers) => {

    io.on('connection' , (socket) => {
        console.log('user connected:', socket.id);
         connectedUsers.set(socket.id, {}); // For disconnect tracking

        socket.emit('connected', { message: 'connected' });

        // Register :
        socket.on('register', ({ token }) => {
            try{
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.user_id;
                const role = decoded.role;

                if (!role || (role !== 'user' && role !== 'engineer')) {
                    console.log(`Unauthorized role: ${userId}`);
                    return socket.disconnect();
                }

                connectedUsers.set(userId, { socketId: socket.id, role, inRoom: false });
                socket.userId = userId;
                console.log(`Registered user ${userId} with role ${role}`);
            }catch(error){
                console.log("invalid token", error.message);
                socket.disconnect();
            }
        });

        // start Consultation with Initial Message (PENDING state):
            socket.on('start_consultation', async({ engineerId, message }) => {
                try{
                    const userId = socket.userId;
                    if (!userId || !engineerId || !message || !message.content) {
                        return socket.emit('error', { message: 'missing fields to start consultation' });
                    }

                    const consultation = await Conversation.create({
                        userId,
                        engineerId,
                        status: 'pending',
                        createdAt: new Date()
                    });
                    const newMessage = await Message.create({
                        consultationId: consultation._id,
                        senderId: userId,
                        type: message.type || 'text',
                        content: message.content,
                        createdAt: new Date()
                    });

                    consultation.messages.push(newMessage._id);
                    await consultation.save();

                    socket.join(`chat_${consultation._id}`); // add the user to the chat room by room number
                    const user = connectedUsers.get(userId);
                    if (user) user.inRoom = true;

                    socket.emit ('consultationStarted', {
                        consultationId: consultation._id,
                        message: 'Consultation successfully started',
                    });
                    const engineer = connectedUsers.get(engineerId);
                    if(engineer){
                        io.to(engineer.socketId).emit('newConsultationRequest',{
                            consultationId: consultation._id,
                            userId,
                            message: message.content
                        });
                    }
                }catch(err){
                    console.log('Error starting consultation:', err.message);
                    socket.emit('error', { message: 'Failed to start consultation' });
                }
            });

        // join room :
            socket.on('joinRoom', (consultationId) => {
                socket.join(`chat_${consultationId}`); // add the user to the chat room by room number
                console.log(`User ${socket.userId} joined room chat number_${consultationId}`);

                Conversation.findById(consultationId).then(convo => {
                    if (convo) {
                        if (socket.userId === convo.user_id) {
                            convo.newMessagesForUser = false;
                        } else if (socket.userId === convo.engineerId) {
                            convo.newMessagesForEngineer = false;
                        }
                        convo.save();
                    }
                });
                const user = connectedUsers.get(socket.userId);
                if (user) user.inRoom = true;
            });

        // send message :
        socket.on('send_message', async (data) => {
            const { consultationId, senderId, content } = data;

            const conversation = await Conversation.findById(consultationId);
            if (!conversation) return;

            const message = new Message({
                consultationId,
                senderId,
                type: 'text',
                content,
                timeStamp: new Date()
            });
            await message.save();

            io.to(`chat_${consultationId}`).emit('newMessage', {
                consultationId,
                sender: senderId,
                type: 'text',
                content
            });

            const senderIsUser = Number(senderId) === Number(conversation.userId);
            const receiverId = senderIsUser
                ? conversation.engineerId
                : conversation.userId;

            const receiver = connectedUsers.get(receiverId);
            const receiverInRoom = receiver && receiver.inRoom;

            if (!receiverInRoom) {
                if (senderIsUser) {
                    conversation.newMessagesForEngineer = true;
                } else {
                    conversation.newMessagesForUser = true;
                }
                await conversation.save();
            }

            // إعداد نص الإشعار
            let notificationMessage = '';
            if (senderIsUser) {
                // إشعار للمهندس
                notificationMessage = `New message from user: ${senderId}`;
            } else {
                // إشعار للمستخدم - فقط أرسل engineerId والاسم بنكتبه بالفرونت
                notificationMessage = `New message from`;
            }
            if (receiver && receiver.socketId) {
                io.to(receiver.socketId).emit('notification', {
                    consultationId,
                    engineerId: conversation.engineerId?.toString(), // مهم للفرونت
                    senderId,
                    message: notificationMessage
                  });
            }
        });
        // send image :
        socket.on('send_image', async (data) => {
            const { consultationId, senderId, fileBuffer } = data;
            const buffer = Buffer.from(fileBuffer);

            if (buffer.length > 5 * 1024 * 1024) {
                console.warn(`Image too large from ${senderId}, size = ${buffer.length} bytes`);
                socket.emit('image Too Large', {
                    message: "Image size exceeds the maximum allowed size of 5MB.",
                    consultationId
                });
                return;
            }

            const base64Image = buffer.toString('base64');

            const message = new Message({
                consultationId,
                senderId,
                type: 'image',
                content: base64Image,
                timeStamp: new Date()
            });
            await message.save();

            io.to(`chat_${consultationId}`).emit('newMessage', {
                
                sender: senderId,
                type: 'image',
                content: base64Image
            });
        });

        // endConsultation :
        socket.on('endConsultation', async (consultationId) => {
                const user = connectedUsers.get(socket.userId); // get the socket id of the Agricultural Engineer.
                if (!user || user.role !== 'engineer') return;

                await endConsultation(consultationId); // call endConsultation function from ./utils/consultations

                io.to(`chat_${consultationId}`).emit('consultationEnded', { // emit event to all users in the room that the consultation has ended.
                    consultationId,
                    message: 'Consultation successfully ended'
                     });
            });

        // Typing/stopTyping Indicator :
            socket.on('typing', ({ consultationId, user_id : sender }) => {
                socket.to(`chat_${consultationId}`).emit('typing', { sender });
            });
            socket.on('stopTyping', ({ consultationId, user_id : sender }) => {
                socket.to(`chat_${consultationId}`).emit('stopTyping', { sender });
            });

        // disconnect :
        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);

            for(const [id, userData] of connectedUsers.entries()){
                if (userData.socketId === socket.id){
                    userData.inRoom = false;
                    console.log(`Marked user ${id} as out of room (inRoom = false)`);
                }
            }
            connectedUsers.delete(socket.id);
        });
    });

}



        /**
         * example on connectedUsers object :
         * connectedUsers = 
         * {
             7: 'socket-id-xyz',
             22: 'socket-id-abc',
                ...etc
            }       
         */

/**
 * io.on('connection') : يتم استدعاؤها عندما يتصل عميل جديد.
 * socket.on(event, callback) : الاستماع (لحدث) معين و(تنفيذ وظيفة) عند استقباله.
 * io.to(room).emit(...) : إرسال رسالة إلى غرفة معينة (مجموعة من المستخدمين).
 * socket.join(room) : دخول المستخدم في غرفة محددة.
 * socket.id : معرف فريد لكل اتصال Socket، يتم تغييره في كل مرة يتصل فيها العميل.
 */
