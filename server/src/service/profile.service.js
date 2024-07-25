// profileService.js
const Profile = require('../models/profile');

const createProfile = async (profileData) => {
  const profile = new Profile(profileData);
  return await profile.save();
};

const getProfilesByChatId = async (chatId) => {
  return await Profile.find({ chatId });
};

const getProfileById = async (id) => {
  return await Profile.findById(id);
};

module.exports = {
  createProfile,
  getProfilesByChatId,
  getProfileById,
};
