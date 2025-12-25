#!/bin/bash
# EAS Build pre-install hook
# This script runs before dependencies are installed

set -e

echo "🔧 Running pre-install hook..."

# Ensure npm uses legacy peer deps
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Skip TypeScript checking during build
export EXPO_NO_TYPESCRIPT_CHECK=1
export SKIP_TYPESCRIPT_CHECK=1

echo "✅ Pre-install hook completed"

