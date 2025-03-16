const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        name,
      });

      await user.save();
      return user;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }

  /**
   * Update user's XP and level
   * @param {string} id - User ID
   * @param {number} xp - New XP value
   * @param {number} level - Calculated level
   * @returns {Promise<Object>} - Updated user object
   */
  static async updateXpAndLevel(id, xp, level) {
    try {
      console.log(`Updating XP to ${xp} and level to ${level} for user ${id}`);
      return User.findOneAndUpdate(
        { _id: id },
        {
          xp: xp,
          level: level,
          'stats.totalXP': xp // Also update the total XP in stats
        },
        { new: true, upsert: false }
      );
    } catch (err) {
      console.error(`Error updating XP for user ${id}:`, err);
      throw new Error(`Database error while updating XP for user ${id}: ${err}`);
    }
  }

  /**
   * Add an achievement to a user
   * @param {string} userId - User ID
   * @param {Object} achievement - Achievement object with title and description
   * @returns {Promise<Object>} - Updated user object
   */
  static async addAchievement(userId, achievement) {
    try {
      console.log(`Adding achievement to user ${userId}:`, achievement);

      // Validate achievement object
      if (!achievement.title || !achievement.description) {
        throw new Error('Achievement must have a title and description');
      }

      // Check if the user already has this achievement (by title)
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Check for duplicate achievement
      const hasDuplicate = user.achievements.some(
        existing => existing.title === achievement.title
      );

      if (hasDuplicate) {
        console.log(`User ${userId} already has achievement: ${achievement.title}`);
        return user; // Return user without adding duplicate
      }

      // Add the achievement
      return User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            achievements: {
              title: achievement.title,
              description: achievement.description,
              date: new Date()
            }
          }
        },
        { new: true }
      );
    } catch (err) {
      console.error(`Error adding achievement for user ${userId}:`, err);
      throw new Error(`Error adding achievement: ${err.message}`);
    }
  }

  /**
   * Update user's display name
   * @param {string} userId - User ID
   * @param {string} displayName - User's display name
   * @returns {Promise<Object>} - Updated user object
   */
  static async updateDisplayName(userId, displayName) {
    try {
      console.log(`Updating display name to "${displayName}" for user ${userId}`);
      return User.findOneAndUpdate(
        { _id: userId },
        { displayName: displayName },
        { new: true, upsert: false }
      );
    } catch (err) {
      console.error(`Error updating display name for user ${userId}:`, err);
      throw new Error(`Database error while updating display name for user ${userId}: ${err}`);
    }
  }
}

module.exports = UserService;