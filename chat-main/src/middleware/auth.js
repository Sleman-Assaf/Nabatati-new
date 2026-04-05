
const jwt = require('jsonwebtoken'); 
require('dotenv').config();  



const authToken = (req , res , next) => {
    const authHeader = req.headers['authorization']; 

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' }); 
    }

    const token = authHeader.split(' ')[1]; 
    
    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        req.user = decoded; // to send the user data to the next middleware . -> this is how middlewares communicate with each other.
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Please log in again' }); 
        }
        return res.status(403).json({ error: 'Unauthorized' }); // Invalid token. 403 = Forbidden
    }
};

module.exports = authToken;