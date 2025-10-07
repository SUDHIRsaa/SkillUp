// SiteSetting model placeholder
const mongoose = require('mongoose');
const SiteSettingSchema = new mongoose.Schema({
  defaultDailyQuestions: Number,
  maintenanceMode: Boolean
});
module.exports = mongoose.model('SiteSetting', SiteSettingSchema);