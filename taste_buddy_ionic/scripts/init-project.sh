#!/usr/bin/env sh

# This script is used to initialize the project
npm ci

# install and configure husky
npx husky install
npx husky add .husky/pre-commit "npm run lint"

# install and configure commitlint
npx commitlint --install
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"

# install and configure lint-staged
npx husky add .husky/pre-commit "npx --no-install lint-staged"
