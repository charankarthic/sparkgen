const express = require('express');
const router = express.Router();
const auth = require('../routes/middleware/auth');
const userService = require('../services/userService');
const { calculateLevel, xpRequiredForLevel } = require('../utils/gameUtils');
const User = require('../models/User');

router.get('/profile', auth.requireUser, async (req, res) => {
  try {
    console.log(`Fetching profile for user ID: ${req.user._id}`);
    const user = await userService.get(req.user._id);

    if (!user) {
      console.error(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Successfully retrieved profile for user ID: ${req.user._id}`);
    // Return only the necessary profile information
    res.json({
      _id: user._id,
      displayName: user.displayName,
      xp: user.xp,
      level: user.level,
      achievements: user.achievements,
      stats: user.stats
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', auth.requireUser, async (req, res) => {
  try {
    console.log('Fetching leaderboard data');

    // Find all active users and select only necessary fields
    const users = await User.find({ isActive: true })
      .select('email displayName xp level')  // Add displayName to selected fields
      .sort({ xp: -1 }) // Sort by XP in descending order
      .limit(10) // Limit to top 10 users
      .lean();

    // Transform the data to include rank and use displayName if available
    const leaderboard = users.map((user, index) => ({
      id: user._id,
      username: user.displayName || user.email.split('@')[0], // Use displayName if available, otherwise use email username
      xp: user.xp,
      level: user.level,
      rank: index + 1
    }));

    console.log(`Successfully retrieved leaderboard with ${leaderboard.length} users`);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user's XP points and recalculate level
 */
router.put('/:userId/xp', auth.requireUser, async (req, res) => {
  try {
    console.log(`Updating XP for user ID: ${req.params.userId}`);
    // Ensure the user can only update their own XP (or admin authorization)
    if (req.user._id.toString() !== req.params.userId) {
      console.error(`Unauthorized XP update attempt: User ${req.user._id} tried to update XP for user ${req.params.userId}`);
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    const { xp } = req.body;

    if (typeof xp !== 'number' || xp < 0) {
      console.error(`Invalid XP value received: ${xp}`);
      return res.status(400).json({ error: 'XP must be a non-negative number' });
    }

    // Get current user data to check if level changed
    const currentUser = await userService.get(req.params.userId);
    if (!currentUser) {
      console.error(`User not found with ID: ${req.params.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const currentLevel = currentUser.level;
    console.log(`Current user level: ${currentLevel}, Current XP: ${currentUser.xp}, New XP: ${xp}`);

    // Calculate new level based on new XP
    const newLevel = calculateLevel(xp);
    console.log(`Calculated new level: ${newLevel} for XP: ${xp}`);

    // Update user XP and level
    const updatedUser = await userService.updateXpAndLevel(req.params.userId, xp, newLevel);
    if (!updatedUser) {
      console.error(`Failed to update XP for user ${req.params.userId}`);
      return res.status(500).json({ error: 'Failed to update user XP' });
    }

    // Determine if the user leveled up
    const levelUp = newLevel > currentLevel;
    if (levelUp) {
      console.log(`User ${req.params.userId} leveled up from ${currentLevel} to ${newLevel}`);
    }

    // Calculate XP needed for next level
    const nextLevelXp = xpRequiredForLevel(newLevel + 1);
    const xpForNextLevel = nextLevelXp - xp;
    console.log(`XP needed for next level (${newLevel + 1}): ${xpForNextLevel}`);

    console.log(`Successfully updated XP for user ${req.params.userId}`);
    res.json({
      xp: updatedUser.xp,
      level: updatedUser.level,
      level_up: levelUp,
      xp_for_next_level: xpForNextLevel
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add an achievement to a user
 */
router.post('/:userId/achievements', auth.requireUser, async (req, res) => {
  try {
    console.log(`Adding achievement for user ID: ${req.params.userId}`);

    // Ensure the user can only add achievements to their own account (or admin authorization)
    if (req.user._id.toString() !== req.params.userId) {
      console.error(`Unauthorized achievement addition attempt: User ${req.user._id} tried to add achievement for user ${req.params.userId}`);
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Achievement must have a title and description' });
    }

    // First check if user already has this achievement
    const user = await userService.get(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasDuplicate = user.achievements.some(
      existing => existing.title === title
    );

    if (hasDuplicate) {
      console.log(`User ${req.params.userId} already has achievement: ${title}`);
      // Return a status indicating no change but not an error
      return res.status(200).json({
        message: 'User already has this achievement',
        achievements: user.achievements
      });
    }

    const updatedUser = await userService.addAchievement(req.params.userId, {
      title,
      description
    });

    console.log(`Successfully added achievement for user ${req.params.userId}`);

    res.status(201).json({
      message: 'Achievement added successfully',
      achievement: updatedUser.achievements[updatedUser.achievements.length - 1],
      achievements: updatedUser.achievements
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user's display name
 */
router.put('/:userId/displayName', auth.requireUser, async (req, res) => {
  try {
    console.log(`Updating display name for user ID: ${req.params.userId}`);

    // Ensure the user can only update their own display name
    if (req.user._id.toString() !== req.params.userId) {
      console.error(`Unauthorized display name update attempt: User ${req.user._id} tried to update display name for user ${req.params.userId}`);
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string') {
      console.error(`Invalid display name received: ${displayName}`);
      return res.status(400).json({ error: 'Display name must be a non-empty string' });
    }

    const updatedUser = await userService.updateDisplayName(req.params.userId, displayName);
    if (!updatedUser) {
      console.error(`Failed to update display name for user ${req.params.userId}`);
      return res.status(500).json({ error: 'Failed to update user display name' });
    }

    console.log(`Successfully updated display name for user ${req.params.userId}`);
    res.json({
      displayName: updatedUser.displayName
    });
  } catch (error) {
    console.error('Error updating user display name:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete user account
 */
router.delete('/:userId', auth.requireUser, async (req, res) => {
  try {
    console.log(`Deleting account for user ID: ${req.params.userId}`);

    // Ensure the user can only delete their own account
    if (req.user._id.toString() !== req.params.userId) {
      console.error(`Unauthorized account deletion attempt: User ${req.user._id} tried to delete account for user ${req.params.userId}`);
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }

    const success = await userService.deleteAccount(req.params.userId);

    if (!success) {
      console.error(`Failed to delete account for user ${req.params.userId}`);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    console.log(`Successfully deleted account for user ${req.params.userId}`);
    res.json({ success: true, message: 'Account successfully deleted' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;