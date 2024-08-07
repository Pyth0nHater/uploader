const profileService = require('../service/profile.service');

// Create a new profile
const createProfile = async (req, res) => {
  try {
    const profileData = req.body;
    const profile = await profileService.createProfile(profileData);
    res.status(201).send(profile);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Fetch profiles by chatId
const getProfiles = async (req, res) => {
  try {
    const profiles = await profileService.getProfiles();
    res.status(200).send(profiles);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Fetch a specific profile by _id
const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await profileService.getProfileById(id);
    if (!profile) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
};
