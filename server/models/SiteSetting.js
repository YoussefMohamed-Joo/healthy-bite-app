import mongoose from '../mongoose.js'

const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  label: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('SiteSetting', siteSettingSchema)
