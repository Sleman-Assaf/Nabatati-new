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
        const userMatches = conversation.userId.toString() === userId;
        const engineerMatches = conversation.engineerId.toString() === userId;
        // Check access based on role

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

module.exports = { getPMessages};