const Profile = require('../models/profile');

const createProfile = async (profileData) => {
  try {
    const profile = new Profile(profileData);
    await profile.save();
    profile.profileFolder = `profiles/${profile._id}`;
    profile.video = `profiles/${profile._id}.mp4`;
    await profile.save();
    return profile;
  } catch (error) {
    throw new Error(`Error creating profile: ${error.message}`);
  }
};

const getProfiles = async () => {
  try {
    return await Profile.find({});
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
  getProfiles,
  getProfileById,
};
