# Production Keystore Setup

## Generate a JKS Keystore (one-time)

Run this command in the `app/android/` directory:

```bash
keytool -genkey -v -keystore release.keystore -alias release \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass <your-store-password> -keypass <your-key-password> \
  -dname "CN=HealthyBite, OU=Development, O=HealthyBite, L=Cairo, ST=Cairo, C=EG"
```

## Environment Variables

Set these in CI/CD or local build environment:

| Variable | Purpose |
|---|---|
| `ANDROID_KEYSTORE_PATH` | Path to `release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (default: `release`) |
| `ANDROID_KEY_PASSWORD` | Key password |

## Build Signed APK

```bash
cd app/android
export ANDROID_KEYSTORE_PATH=release.keystore
export ANDROID_KEYSTORE_PASSWORD=yourpass
export ANDROID_KEY_ALIAS=release
export ANDROID_KEY_PASSWORD=yourpass
./gradlew assembleRelease
```

Output: `app/android/app/build/outputs/apk/release/app-release.apk`
