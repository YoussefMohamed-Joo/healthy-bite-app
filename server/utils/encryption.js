import crypto from 'crypto'
import mongoose from 'mongoose'

const ALGORITHM = 'aes-256-cbc'
const KEY = crypto.scryptSync(process.env.CRYPTO_KEY || 'hb-default-key-32-chars!', 'hb-salt', 32)

export function encrypt(text) {
  if (text === null || text === undefined || text === '') return text
  if (text.startsWith('ENC:')) return text
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  let enc = cipher.update(String(text), 'utf8', 'hex')
  enc += cipher.final('hex')
  return 'ENC:' + iv.toString('hex') + ':' + enc
}

export function decrypt(text) {
  if (!text || typeof text !== 'string') return text
  if (!text.startsWith('ENC:')) return text
  const payload = text.slice(4)
  const sep = payload.indexOf(':')
  if (sep === -1) return text
  const iv = Buffer.from(payload.slice(0, sep), 'hex')
  const enc = payload.slice(sep + 1)
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    let dec = decipher.update(enc, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  } catch { return text }
}

const EXCLUDED_FIELDS = new Set([
  '_id', 'id', '__v', 'password', 'passwordAlgo', 'email', 'otp',
  'code', 'key', 'role', 'status', 'type', 'method',
  'category', 'sessionId', 'image', 'imagePublicId', 'avatar',
  'receiptImage', 'phoneWallet', 'transactionId',
  'active', 'available', 'featured', 'popular', 'verified', 'rejected',
  'price', 'calories', 'rating', 'order', 'discount', 'minOrder',
  'maxUses', 'usedCount', 'attempts', 'total', 'quantity',
  'expiresAt', 'createdAt', 'updatedAt', 'couponCode', 'discountAmount',
  'paymentIntentId', 'rejectionReason', 'device',
  'paymentInfo', 'sessions', 'items',
])

function isEncryptablePath(path, instance) {
  if (EXCLUDED_FIELDS.has(path)) return false
  if (path.startsWith('_')) return false
  const paths = path.split('.')
  let schemaType = instance
  for (const p of paths) {
    if (!schemaType || !schemaType.paths) return false
    const t = schemaType.paths[p]
    if (!t) return false
    const ti = t.instance || (t.options && t.options.type && t.options.type.name)
    schemaType = t.schema
  }
  return true
}

export function encryptionPlugin(schema) {
  const encryptable = []

  schema.eachPath((path, schemaType) => {
    if (EXCLUDED_FIELDS.has(path)) return
    if (path.startsWith('_')) return
    const ti = schemaType.instance
    if (ti === 'String') encryptable.push(path)
    else if (ti === 'Array') {
      const inner = schemaType.schema
      if (inner && inner.paths && Object.keys(inner.paths).length === 0) {
        encryptable.push(path)
      }
    }
    else if (ti === 'Mixed') encryptable.push(path)
  })

  if (encryptable.length === 0) return

  function applyEncrypt(obj) {
    if (!obj || typeof obj !== 'object') return
    for (const p of encryptable) {
      const val = obj[p]
      if (val === null || val === undefined) continue
      if (Array.isArray(val)) {
        let changed = false
        obj[p] = val.map(v => {
          if (typeof v === 'string' && v && !v.startsWith('ENC:')) { changed = true; return encrypt(v) }
          return v
        })
      } else if (typeof val === 'string' && val && !val.startsWith('ENC:')) {
        obj[p] = encrypt(val)
      } else if (typeof val === 'object') {
        applyEncrypt(val)
      }
    }
  }

  function applyDecrypt(obj) {
    if (!obj || typeof obj !== 'object') return
    const raw = obj.$__ ? obj._doc : obj
    if (!raw) return
    for (const p of encryptable) {
      const val = raw[p]
      if (val === null || val === undefined) continue
      if (Array.isArray(val)) {
        raw[p] = val.map(v => typeof v === 'string' ? decrypt(v) : v)
      } else if (typeof val === 'string') {
        raw[p] = decrypt(val)
      } else if (typeof val === 'object') {
        applyDecrypt(val)
      }
    }
  }

  schema.pre('save', function (next) { applyEncrypt(this); next() })
  schema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate()
    if (update) applyEncrypt(update)
  })
  schema.post('init', applyDecrypt)
  schema.post('save', function () { applyDecrypt(this) })
  schema.post('find', docs => { if (docs) docs.forEach(applyDecrypt) })
  schema.post('findOne', applyDecrypt)
  schema.post('findById', applyDecrypt)
}
