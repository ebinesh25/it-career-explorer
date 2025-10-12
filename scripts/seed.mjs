// scripts/seed.mjs
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { itRoles } from '../src/data/itRoles.ts';
import 'dotenv/config';

async function main() {
  const convexUrl = process.env.CONVEX_URL;

  if (!convexUrl) {
    console.error('Error: CONVEX_URL is not set in your .env.local file.');
    process.exit(1);
  }

  try {
    const client = new ConvexHttpClient(convexUrl);

    console.log('Seeding database...');
    
    // The `seed` action expects the roles data as an argument.
    await client.action(api.roles.seed, { roles: itRoles });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
