const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/conversation');

router.get('/' , auth , async (req , res) => {
    try{
        const userId = Number(req.user.user_id);
        const role = req.user.role;   

        let query = {};
        if(role === 'user'){
            query = { userId: userId ,  newMessagesForUser: true};
        } else if(role === 'engineer'){
            query = { engineerId: userId , newMessagesForEngineer: true };
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const inboxConversation = await Conversation.find({query}).sort({createdAt: -1});

        return res.status(200).json(inboxConversation);
    }catch(error){
        console.error('Error fetching inbox:', error.message);
        return res.status(500).json({ message: 'Failed to fetch inbox' });
    }
}); // !!! ok

module.exports = router;