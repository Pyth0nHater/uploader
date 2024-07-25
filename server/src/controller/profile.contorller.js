// profileController.js
const profileService = require('../service/profile.service');

const createProfile = async (req, res) => {
  const {
    chatId, instagram, links, newLinks, removeLinks,
    login, password, proxyIp, proxyLogin, proxyPassword,
    profileFolder, video, cookie
  } = req.body;

  try {
    const profileData = {
      chatId,
      instagram,
      links,
      newLinks,
      removeLinks,
      login,
      password,
      proxyIp,
      proxyLogin,
      proxyPassword,
      profileFolder,
      video,
      cookie
    };
    
    const profile = await profileService.createProfile(profileData);
    res.status(201).send(profile);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getProfilesByChatId = async (req, res) => {
  const { chatId } = req.query;
  try {
    const profiles = await profileService.getProfilesByChatId(chatId);
    res.status(200).send(profiles);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await profileService.getProfileById(id);
    if (!profile) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  createProfile,
  getProfilesByChatId,
  getProfileById,
};
