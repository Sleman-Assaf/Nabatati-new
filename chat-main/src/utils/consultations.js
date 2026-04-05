// storing the status of the consultation, specifically when it was closed.

const Conversation = require('../models/conversation'); // Import the Conversation model

const endConsultation = async (consultationId) => { 
    try {
        await Conversation.findByIdAndUpdate(
            consultationId, 
            {
                status: 'closed',
                closedAt: new Date().toISOString(),
            },
            { new: true } // Return the updated document
        );
        console.log(`Consultation ${consultationId} has been closed.`);
    } catch (error) {
        console.error(`Error closing consultation ${consultationId}: ${error.message}`);
    }
}

module.exports = { endConsultation };