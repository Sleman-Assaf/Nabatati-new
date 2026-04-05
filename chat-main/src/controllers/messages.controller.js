const Conversation = require('../models/conversation');
const Message = require('../models/message');

const getPMessages = async (req, res) => {
    const {consultationId} = req.params;
    const { page = 1, limit = 20 } = req.query; // Default to page 1 and limit 10
    const skip = (page - 1) * limit;

    try{
        const conversation = await Conversation.findById(consultationId);
        if(!conversation) {
            return res.status(404).json({ message: 'Consultation not found' });
        };

        const userId = req.user.user_id; // Extract userId from the JWT token
        const userRole = req.user.role;
        const userIdFromToken = parseInt(req.user.user_id);
        const userMatches = Number(conversation.userId) === userIdFromToken;
        const engineerMatches = Number(conversation.engineerId) === userIdFromToken;
       
       
        // Check access based on role

        console.log("Consultation.userId:", conversation.userId);
        console.log("Consultation.engineerId:", conversation.engineerId);
        console.log("Token user_id:", userId);
        console.log("Role:", userRole);

        if (!userMatches && !engineerMatches) {
            
            return res.status(403).json({ message: 'You are not authorized to access this consultation.' });
        };

        const messages = await Message.find({ consultationId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

            return res.status(200).json({messages, page, limit});
    }catch(error){
        console.error(`[GET paginated messages] error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
 

};

const sendMessages = async (req, res) => {
    try{
        const {consultationId, content , type} = req.body;
        const userId = req.user.user_id; // Extract userId from the JWT token

        const conversation = await Conversation.findById(consultationId);
        if(!conversation) {
            return res.status(404).json({ message: 'Consultation not found' });
        };

        if(conversation.status !== 'active'){
           return res.status(400).json({ message: 'Consultation is not active' }); 
        };

        const newMessage = await Message.create({
            consultationId,
            senderId: userId,
            type: type || 'text',
            content,
            createdAt: new Date()
        });

        const savedMessage = await newMessage.save();

        conversation.messages.push(savedMessage._id);
        await conversation.save();

        res.status(201).json({
            message: 'Message sent successfully',
            data: savedMessage
        });
    }catch(error){
        console.error("Error sending message:", error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = { getPMessages,
    sendMessages
};