// DISABLED LEGACY - orders-old.js
// This file previously contained legacy order handling code. It had parser errors
// and has been disabled to avoid breaking current lint/build steps. If needed,
// restore from git history or move to a separate legacy folder.

import express from 'express';
const router = express.Router();

// Keep a minimal placeholder exported so imports that reference this route
// don't fail during startup while removing legacy route implementations.
export default router;