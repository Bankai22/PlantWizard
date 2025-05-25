#!/bin/bash

# PlantWizard Keystore Generation Script
# This script generates a keystore for signing your Android app for Play Store release

echo "🔐 PlantWizard Keystore Generation"
echo "=================================="
echo ""

# Create android/keystores directory if it doesn't exist
mkdir -p android/keystores

echo "📝 Please provide the following information for your keystore:"
echo ""

read -p "Enter your full name: " FULL_NAME
read -p "Enter your organization (or just press Enter): " ORGANIZATION
read -p "Enter your city: " CITY
read -p "Enter your state/province: " STATE
read -p "Enter your country code (e.g., US, CA, UK): " COUNTRY

echo ""
echo "🔑 Creating keystore..."

# Generate the keystore
keytool -genkey -v -keystore android/keystores/plantwizard-release.jks \
    -alias plantwizard-key \
    -keyalg RSA \
    -keysize 2048 \
    -validity 25000 \
    -dname "CN=$FULL_NAME, O=$ORGANIZATION, L=$CITY, ST=$STATE, C=$COUNTRY"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore created successfully!"
    echo "📁 Location: android/keystores/plantwizard-release.jks"
    echo "🔑 Key alias: plantwizard-key"
    echo ""
    echo "⚠️  IMPORTANT: Keep this keystore file safe!"
    echo "   - Back it up securely"
    echo "   - Never share the passwords"
    echo "   - You'll need it for all future app updates"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update android/app/build.gradle with keystore details"
    echo "2. Build signed APK/AAB in Android Studio"
    echo "3. Upload to Google Play Console"
else
    echo ""
    echo "❌ Failed to create keystore"
    echo "Make sure you have Java keytool installed"
fi 