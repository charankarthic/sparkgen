const User = require('../models/User');

/**
 * Middleware to attach user level information to the request object
 * This is used by quiz services to provide difficulty-appropriate questions
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const attachUserLevel = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('User not authenticated, skipping user level middleware');
      return next();
    }

    // Get user from database to retrieve latest level
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error(`User with id ${req.user.id} not found in database`);
      return next();
    }

    // Attach user level to request object
    req.userLevel = user.level || 'beginner'; // Default to beginner if level not set
    console.log(`User level middleware: Attached level ${req.userLevel} for user ${req.user.id}`);
    
    next();
  } catch (error) {
    console.error('Error in userLevelMiddleware:', error);
    // Continue to next middleware even if there's an error
    // This prevents the application from crashing if user level can't be determined
    next();
  }
};

module.exports = attachUserLevel;