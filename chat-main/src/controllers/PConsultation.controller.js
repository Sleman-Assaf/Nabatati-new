const Conversation = require('../models/conversation');

const getPConsultation = async (req, res) => {

    
    const userId = req.user.user_id; 
    const userRole = req.user.role; 
    const {status} = req.query; 
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {status};

    if (userRole === 'user') {
        query.userId = userId;
    } else if (userRole === 'engineer') {
        query.engineerId = userId;
    } else {
        return res.status(403).json({ message: 'You are not authorized to access this consultation.' });
    }

    try{
        const consultation = await Conversation.find(query)
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip(skip)
            .limit(limit);

            return res.status(200).json({consultation, page, limit});
    }catch(error){
        console.error(`[GET paginated consultations] error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = { getPConsultation };