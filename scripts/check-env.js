#!/usr/bin/env node

/**
 * This script checks for proper environment variables before a production build
 * To use: Add "prebuild": "node scripts/check-env.js" to your package.json
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
};

// Critical environment variables for OAuth to work in production
const CRITICAL_VARS = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === "production";

console.log(`${colors.blue}${colors.bold}Environment Check${colors.reset}`);
console.log(
  `Environment: ${
    isProduction ? colors.magenta + "Production" : colors.green + "Development"
  }${colors.reset}`
);

// Only perform strict checks in production
if (isProduction) {
  console.log(
    `${colors.yellow}Running pre-production environment variable check...${colors.reset}\n`
  );

  let hasCriticalErrors = false;
  let warnings = 0;

  // Check critical variables
  CRITICAL_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      console.log(
        `${colors.red}ERROR: Missing critical environment variable ${colors.bold}${varName}${colors.reset}`
      );
      hasCriticalErrors = true;
    } else {
      console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
    }
  });

  // Check for .env.local file that might interfere with production
  if (fs.existsSync(path.resolve(process.cwd(), ".env.local"))) {
    console.log(
      `${colors.yellow}WARNING: .env.local file exists in project root.${colors.reset}`
    );
    console.log(
      `${colors.yellow}This file is not used in production but may cause confusion during local testing.${colors.reset}`
    );
    warnings++;
  }

  // Check if NEXTAUTH_URL is using localhost in production
  if (
    process.env.NEXTAUTH_URL &&
    process.env.NEXTAUTH_URL.includes("localhost")
  ) {
    console.log(
      `${colors.red}ERROR: NEXTAUTH_URL contains 'localhost' in production!${colors.reset}`
    );
    console.log(
      `${colors.red}This will cause OAuth redirects to fail.${colors.reset}`
    );
    hasCriticalErrors = true;
  }

  // Check for potential issues with NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.endsWith("/")) {
      console.log(
        `${colors.yellow}WARNING: NEXTAUTH_URL ends with a trailing slash.${colors.reset}`
      );
      console.log(
        `${colors.yellow}Some OAuth providers may be sensitive to this.${colors.reset}`
      );
      warnings++;
    }

    if (!process.env.NEXTAUTH_URL.startsWith("https://") && isProduction) {
      console.log(
        `${colors.red}ERROR: NEXTAUTH_URL does not start with 'https://' in production.${colors.reset}`
      );
      console.log(
        `${colors.red}OAuth providers require HTTPS for security.${colors.reset}`
      );
      hasCriticalErrors = true;
    }
  }

  console.log("\n");

  // Summary and exit code
  if (hasCriticalErrors) {
    console.log(
      `${colors.red}${colors.bold}✖ Found critical environment errors that will prevent OAuth from working.${colors.reset}`
    );
    console.log(
      `${colors.red}Please check PRODUCTION-OAUTH-GUIDE.md for setup instructions.${colors.reset}`
    );
    process.exit(1); // Exit with error code
  } else if (warnings > 0) {
    console.log(
      `${colors.yellow}${colors.bold}⚠ Found ${warnings} warning(s). Your app may work but might have issues.${colors.reset}`
    );
    console.log(`${colors.yellow}See above for details.${colors.reset}`);
  } else {
    console.log(
      `${colors.green}${colors.bold}✓ All critical environment variables are properly set!${colors.reset}`
    );
  }
} else {
  console.log(
    `${colors.green}Development environment - skipping strict environment checks.${colors.reset}`
  );
}

// Success - can proceed with build
process.exit(0);
