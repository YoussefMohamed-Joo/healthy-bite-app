import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const keysDir = path.join(__dirname, '..', 'keys')

if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true })

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
})

fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey)
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey)

console.log('✅ RSA key pair generated (4096-bit RS256)')
console.log('   Private:', path.join(keysDir, 'private.pem'))
console.log('   Public:', path.join(keysDir, 'public.pem'))
console.log('\nAdd these to Vercel env vars (base64 encoded):')
console.log('   RSA_PRIVATE_KEY:', Buffer.from(privateKey).toString('base64'))
console.log('   RSA_PUBLIC_KEY:', Buffer.from(publicKey).toString('base64'))
