// scripts/seed.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
// Import the JSON data to seed
import rawData from '../src/data/itRoles.json' assert { type: 'json' };
const jsonRoles = rawData.itRoles;

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

    console.log(`Seeding database with ${jsonRoles.length} roles from JSON...`);
    // Optionally, clear existing data using a server action
    // await safeAction(client, api.roles.seed, {});

    // Helper for retrying mutations
    async function safeMutation(client, mutationFn, args, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          return await client.mutation(mutationFn, args);
        } catch (err) {
          console.error(`Mutation attempt ${i + 1} failed:`, err.message);
          if (i === retries - 1) throw err;
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }

    // Seed each role via the addRole mutation
    for (const role of jsonRoles) {
      // Destructure to drop the 'id' and rename 'category' to 'categoryName'
      // JSON schema: { id, title, category, tags, shortDescription, alternateNames, technicalSkills, softSkills, careerLadder, scope, jobMarketProjection, industry, hiringCompanies, stats }
      // addRole expects: title, categoryName, tags, shortDescription, alternateNames, technicalSkills, softSkills, careerLadder, scope, jobMarketProjection, industry, hiringCompanies?, stats?
      const { id: _discarded, category, ...rest } = role;
      const args = { ...rest, categoryName: category };
      await safeMutation(client, api.roles.addRole, args);
      console.log(`⇒ Seeded role: ${rest.title}`);
    }

    console.log('🎉 Database seeded successfully from JSON!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
