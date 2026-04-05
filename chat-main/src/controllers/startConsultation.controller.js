const Conversation = require('../models/conversation'); 
const Message = require('../models/message');

const startConsultation = async (req, res) => {
  try{
    const { engineerId , content , type  } = req.body; ///\
 
    if(!engineerId || !content) {
      return res.status(400).json({ error: 'Engineer ID and content are required' });
    }

    // start a new consultation
    const newConsultation = new Conversation({
      userId : req.user.user_id,
      engineerId,
      status : 'pending',
    }); 

    const savedConsultation = await newConsultation.save(); 

    // save the message to the database
    const newMessage = new Message({
      consultationId: savedConsultation._id,
      senderId: req.user.user_id,
      type: type || 'text',
      content,
      createdAt: new Date(),
    });

    // add the message ID to the consultation
    const savedMessage = await newMessage.save();
    savedConsultation.messages.push(savedMessage._id); 

    res.status(200).json({
      consultationId: savedConsultation._id, // return the consultation ID.
      message: 'Consultation and message successfully started', 
    });

    console.log(`Consultation and message started with ID: ${savedConsultation._id}`);

  }catch (error) {
    console.error("Error starting consultation:", error.message); 
    res.status(500).json({ error: 'Failed to start consultation' }); 
  }
};

module.exports = {
  startConsultation,
};