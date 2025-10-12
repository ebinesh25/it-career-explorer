// scripts/seed.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import itRoles from '../src/data/itRoles.json' assert { type: 'json' };

async function checkNetwork(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`✅ Convex deployment reachable: ${url} (status: ${res.status})`);
    return true;
  } catch (err) {
    console.error(`❌ Cannot reach Convex URL: ${url}`);
    console.error('Network error (Node fetch/undici likely blocked by VPN/firewall):', err.message);
    return false;
  }
}

async function safeAction(client, action, args, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await client.action(action, args);
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}

async function main() {
  const convexUrl = process.env.CONVEX_URL;

  if (!convexUrl) {
    console.error('Error: CONVEX_URL is not set in .env.local');
    process.exit(1);
  }

  // Debug: confirm env variable
  console.log('CONVEX_URL:', convexUrl);

  // Check network first
  const networkOk = await checkNetwork(convexUrl);
  if (!networkOk) {
    console.error('Exiting due to network connectivity issues.');
    process.exit(1);
  }

  try {
    const client = new ConvexHttpClient(convexUrl);

    console.log(`Seeding database with ${itRoles.length} roles...`);

    await safeAction(client, api.roles.seed, { roles: itRoles });

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
