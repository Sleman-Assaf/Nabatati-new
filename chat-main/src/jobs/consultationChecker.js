

const Consultation = require('../models/conversation');
const Message = require('../models/message');

async function startConsultationChecker() {
    try {
        const now = new Date();

        // convert pending consultation to expired after 4 days.
        const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); 
        const pendingResult = await Consultation.updateMany(
            { status: 'pending', createdAt: { $lt: fourDaysAgo } }, //lt = less than
            { $set: { status: 'expired' } }
        );
        console.log(`Expired ${pendingResult.modifiedCount} pending consultations.`);

        // delete consultations that are closed for more than 24 hours.
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const closedConsultations = await Consultation.find({
            status: 'closed',
            closedAt: { $lt: oneDayAgo }, //lt = less than
        });

        const closedIds = closedConsultations.map(convo => convo._id);
        if (closedIds.length > 0) {
            await Message.deleteMany({ consultationId: { $in: closedIds } });
            await Consultation.deleteMany({ _id: { $in: closedIds } });
            console.log(`Deleted ${closedIds.length} closed consultations.`);
        }

        // delete expired consultations that are older than 5 days.
        const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        
        const expiredConsultations = await Consultation.find({
            status: 'expired',
            createdAt: { $lte: fiveDaysAgo } // lte = less than or equal to
          });

        const expiredIds = expiredConsultations.map(convo => convo._id);
        if (expiredIds.length > 0) {
            await Message.deleteMany({ consultationId: { $in: expiredIds } });
            await Consultation.deleteMany({ _id: { $in: expiredIds } });
            console.log(`Deleted ${expiredIds.length} expired consultations.`);
        }

    } catch(error){
        console.error('Error in consultation checker:', error);
    }
}

module.exports = { startConsultationChecker };