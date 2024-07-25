const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  instagram: { type: String, required: true },
  tiktok: { type: String, required: true },
  links: { type: [String], default: [] },
  newLinks: { type: [String], default: [] },
  removeLinks: { type: [String], default: [] },
  login: { type: String, required: true },
  password: { type: String, required: true },
  proxyIp: { type: String },
  proxyLogin: { type: String },
  proxyPassword: { type: String },
  profileFolder: { type: String },
  video: { type: String },
  cookie: { type: [Object], default: [] }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
