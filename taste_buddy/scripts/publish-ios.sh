#!/usr/bin/env sh
#
# Copyright (c) 2024 Josef Müller.
#
# This script is used to publish an iOS app to the App Store

# Set variables
APP_NAME="Taste Buddy"
SCHEME_NAME="TasteBuddy"
WORKSPACE_PATH="./ios/Runner.xcworkspace"
ARCHIVE_PATH="./build/${APP_NAME}.xcarchive"
EXPORT_PATH="./build/Export"
EXPORT_OPTIONS_PLIST="./ios/ExportOptions.plist"

# Build the app
flutter build ios --release --no-codesign

# Create archive
xcodebuild -workspace "$WORKSPACE_PATH" \
           -scheme "$SCHEME_NAME" \
           -configuration Release \
           -archivePath "$ARCHIVE_PATH" \
           clean archive

# Export IPA
xcodebuild -exportArchive \
           -archivePath "$ARCHIVE_PATH" \
           -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
           -exportPath "$EXPORT_PATH"

# Upload to App Store Connect
xcrun altool --upload-app \
             --type ios \
             --file "${EXPORT_PATH}/${APP_NAME}.ipa" \
             --username "your_apple_id@example.com" \
             --password "@keychain:AC_PASSWORD"

echo "App successfully uploaded to App Store Connect!"
