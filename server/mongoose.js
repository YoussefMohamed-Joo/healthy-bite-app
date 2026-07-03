import mongoose from 'mongoose'
import { encryptionPlugin } from './utils/encryption.js'

mongoose.plugin(encryptionPlugin)

export default mongoose
