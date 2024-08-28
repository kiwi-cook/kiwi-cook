#!/usr/bin/env sh
#
# Copyright (c) 2024 Josef Müller.
#

# This script is used to publish an iOS app to the App Store

# build the app
flutter build ipa

cd ios || exit

# Initialize fastlane
fastlane init

