
// Read a consultation and its messages from MongoDB

const Conversation = require('../models/conversation');
const Message = require('../models/message');


const readConsultation = async (req, res) => {
    const {id} = req.params;
    const userId = req.user.user_id; // Extract userId from the JWT token
    const userRole = req.user.role; 
    try{
        const consultation = await Conversation.findById(id);
        if(!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Ensure ObjectId comparison works

        const userMatches = consultation.userId?.toString() === userId;
        const engineerMatches = consultation.engineerId?.toString() === userId;

        // Check access based on role
        
        let isAuthorized = false;

        if(userRole === 'user' && userMatches) {
            isAuthorized = true;
        }else if (userRole === 'engineer' && engineerMatches) {
            isAuthorized = true;
        }
        if (!isAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to access this consultation.' });
        }

        // Check if consultation is closed and more than 24h has passed

        if(consultation.status === 'closed' && consultation.closedAt) {
            const closedAt = new Date(consultation.closedAt).getTime(); 
            const now = Date.now(); 
            const hoursSinceClosed = (now - closedAt) / (1000 * 60 * 60); 

            if (hoursSinceClosed > 24) {
                return res.status(410).json({ message: 'This consultation has been deleted.' });
            }
        };

        // Fetch all messages related to this consultation
        const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });

        return res.status(200).json ({consultation, messages}); 

    }catch(error){
        console.error(`[GET consultation] error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




const findExistingConsultation = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { engineerId } = req.query;

        if (!engineerId) {
            return res.status(400).json({ message: 'Missing engineerId' });
        }

        const existing = await Conversation.findOne({
            userId,
            engineerId,
            status: { $in: ['pending', 'active'] }
        });

        if (existing) {
            return res.status(200).json(existing);
        } else {
            return res.status(204).send(); // لا يوجد محادثة قائمة
        }
    } catch (error) {
        console.error('[GET /consultation/existing] error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const getConsultations = async (req, res) => {
    const { status } = req.query;
    const userId = Number(req.user.user_id);
    
    const allowedStatuses = ['pending', 'active', 'closed' ];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    };

    try {
        const consultations = await Conversation.find({
            status: status,
            userId,
        }).sort({ createdAt: -1 });

        res.status(200).json(consultations);
    } catch (error) {
        console.error("Error retrieving  consultations:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { 
    readConsultation,
    getConsultations,
    findExistingConsultation
};