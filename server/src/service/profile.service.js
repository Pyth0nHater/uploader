const Profile = require('../models/profile');

const createProfile = async (profileData) => {
  try {
    const profile = new Profile(profileData);
    await profile.save();
    profile.profileFolder = `../../data/profiles/${profile._id}`;
    profile.video = `../../data/videos/${profile._id}.mp4`;
    await profile.save();
    return profile;
  } catch (error) {
    throw new Error(`Error creating profile: ${error.message}`);
  }
};

const getProfilesByChatId = async (chatId) => {
  try {
    return await Profile.find({ chatId });
  } catch (error) {
    throw new Error(`Error fetching profiles: ${error.message}`);
  }
};

const getProfileById = async (id) => {
  try {
    return await Profile.findById(id);
  } catch (error) {
    throw new Error(`Error fetching profile: ${error.message}`);
  }
};

module.exports = {
  createProfile,
  getProfilesByChatId,
  getProfileById,
};
