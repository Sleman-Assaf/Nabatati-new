const Conversation = require('../models/conversation');

// Retrieve all pending consultations for the engineer

const getConsultations = async (req, res) => {


  const userId = Number(req.user.user_id);
  const role = req.user.role;
  const { status } = req.params;

  // تأكد من وجود status
  if (!status) {
    return res.status(400).json({ message: "Status is required (e.g. pending, active, closed)" });
  }

  const allowedStatuses = ['pending', 'active', 'closed' ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // تجهيز الاستعلام بناءً على الدور
  const query = { status };
  if (role === 'user') {
    query.userId = userId;
  } else if (role === 'engineer') {
    query.engineerId = userId;
  } else {
    return res.status(403).json({ message: "Unauthorized role" });
  }

  try {
    const [consultations, total] = await Promise.all([
      Conversation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Conversation.countDocuments(query)
    ]);

    return res.status(200).json({
      consultations,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("[GET paginated consultations] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Accept a consultation
const acceptConsultation = async (req, res) => {
    const {id} = req.params;

    try{
        const  consultation = await Conversation.findById(id);

        if(!consultation){
            return res.status(404).json({message: "Consultation not found"});
        };

        if (parseInt(consultation.engineerId) !== req.user.user_id) {
            return res.status(403).json({message: "You are not authorized to accept this consultation"});
        };


        if (consultation.status !== 'pending'){
            return res.status(400).json({message: "Consultation already accepted or completed"});
        };

        consultation.status = 'active';
        consultation.updatedAt = new Date();
        await consultation.save();
        
        // Notify the user about the acceptance
        const io = req.app.get('socketio');
        const connectedUsers = req.app.get('connectedUsers');
        const userSocketId = connectedUsers.get(consultation.userId);

        if(userSocketId){
            io.to(userSocketId.socketId).emit('consultationAccepted', {
                message: "Your consultation has been accepted",
                consultationId: consultation._id,
            });
        }
        res.status(200).json({message: "Consultation accepted successfully", consultation});
    }catch(error){
        console.error("Error accepting consultation:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    getConsultations,
    acceptConsultation,
};