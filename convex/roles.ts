import { v } from 'convex/values';
import { query, mutation, action } from './_generated/server';
import { api } from './_generated/api';
import { ITRole, itRoles } from '../src/data/itRoles';

// Query to get all roles with their category and skills
export const get = query({
  args: {},
  handler: async (ctx) => {
    const roles = await ctx.db.query('roles').collect();

    return Promise.all(
      roles.map(async (role) => {
        const category = await ctx.db.get(role.category);
        const roleSkills = await ctx.db
          .query('roleSkills')
          .withIndex('by_roleId', (q) => q.eq('roleId', role._id))
          .collect();
        
        const skills = await Promise.all(
          roleSkills.map(async (rs) => {
            const skill = await ctx.db.get(rs.skillId);
            return {
              name: skill?.name,
              type: skill?.type,
            };
          })
        );

        return {
          ...role,
          category: category?.name,
          technicalSkills: skills.filter(s => s.type === 'technical').map(s => s.name),
          softSkills: skills.filter(s => s.type === 'soft').map(s => s.name),
        };
      })
    );
  },
});

// Query to get a single role by ID
export const getById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const role = await ctx.db.query('roles').filter(q => q.eq(q.field('_id'), args.id)).first();
        if (!role) {
            return null;
        }

        const category = await ctx.db.get(role.category);
        const roleSkills = await ctx.db
            .query('roleSkills')
            .withIndex('by_roleId', (q) => q.eq('roleId', role._id))
            .collect();

        const skills = await Promise.all(
            roleSkills.map(async (rs) => {
                const skill = await ctx.db.get(rs.skillId);
                return {
                    name: skill?.name,
                    type: skill?.type,
                };
            })
        );

        return {
            ...role,
            category: category?.name,
            technicalSkills: skills.filter(s => s.type === 'technical').map(s => s.name),
            softSkills: skills.filter(s => s.type === 'soft').map(s => s.name),
        };
    },
});


// Mutation to add a new IT role
export const addRole = mutation({
  args: {
    // Omitting fields that will be populated from relations
    title: v.string(),
    categoryName: v.string(),
    tags: v.array(v.string()),
    shortDescription: v.string(),
    alternateNames: v.array(v.string()),
    careerLadder: v.array(
      v.object({
        title: v.string(),
        yearsOfExperience: v.string(),
        salaryRange: v.string(),
      })
    ),
    scope: v.string(),
    jobMarketProjection: v.string(),
    industry: v.array(v.string()),
    hiringCompanies: v.optional(
      v.array(
        v.object({
          category: v.string(),
          companies: v.array(v.string()),
        })
      )
    ),
    stats: v.optional(
      v.object({
        averageSalary: v.string(),
        jobOpenings: v.string(),
        growthRate: v.string(),
      })
    ),
    technicalSkills: v.array(v.string()),
    softSkills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get or create category
    let category = await ctx.db
      .query('categories')
      .filter((q) => q.eq(q.field('name'), args.categoryName))
      .first();
    if (!category) {
      category = { _id: await ctx.db.insert('categories', { name: args.categoryName }), name: args.categoryName, _creationTime: Date.now() };
    }

    // 2. Insert the role
    const { technicalSkills, softSkills, categoryName, ...roleData } = args;
    const roleId = await ctx.db.insert('roles', {
      ...roleData,
      category: category._id,
    });

    // 3. Handle skills
    const allSkills = [
      ...technicalSkills.map((name) => ({ name, type: 'technical' as const })),
      ...softSkills.map((name) => ({ name, type: 'soft' as const })),
    ];

    for (const skill of allSkills) {
      let skillDoc = await ctx.db
        .query('skills')
        .filter((q) => q.eq(q.field('name'), skill.name))
        .first();
      if (!skillDoc) {
        skillDoc = { _id: await ctx.db.insert('skills', skill), ...skill, _creationTime: Date.now() };
      }
      await ctx.db.insert('roleSkills', {
        roleId,
        skillId: skillDoc._id,
      });
    }

    return roleId;
  },
});

// Action to seed the database from the itRoles.ts file
// export const seed = action({
//   args: {},
//   handler: async (ctx) => {
//     console.log("Clearing existing data to prevent duplicates...");

//     // Note: This is a destructive operation.
//     // It's fine for a development seed script, but be careful in production.
//     const roles = await ctx.db.query('roles').collect();
//     await Promise.all(roles.map(({ _id }) => ctx.db.delete(_id)));

//     const categories = await ctx.db.query('categories').collect();
//     await Promise.all(categories.map(({ _id }) => ctx.db.delete(_id)));

//     const skills = await ctx.db.query('skills').collect();
//     await Promise.all(skills.map(({ _id }) => ctx.db.delete(_id)));

//     const roleSkills = await ctx.db.query('roleSkills').collect();
//     await Promise.all(roleSkills.map(({ _id }) => ctx.db.delete(_id)));
    
//     console.log("Seeding new data...");
//     for (const role of itRoles) {
//       await ctx.runMutation(api.roles.addRole, {
//         ...role,
//         categoryName: role.category,
//       });
//     }
//     console.log(`Database seeded with ${itRoles.length} roles.`);
//   },
// });
export const seed = action({
  args: {},
  handler: async (ctx) => {
    console.log("Clearing existing data to prevent duplicates...");

    // Note: This is a destructive operation. Be cautious in production.
    // Delete dependent records first
    const roleSkills = await ctx.db.query('roleSkills').collect();
    await Promise.all(roleSkills.map(({ _id }) => ctx.db.delete(_id)));
    // Then delete roles, skills, and categories
    const roles = await ctx.db.query('roles').collect();
    await Promise.all(roles.map(({ _id }) => ctx.db.delete(_id)));
    const skills = await ctx.db.query('skills').collect();
    await Promise.all(skills.map(({ _id }) => ctx.db.delete(_id)));
    const categories = await ctx.db.query('categories').collect();
    await Promise.all(categories.map(({ _id }) => ctx.db.delete(_id)));

    console.log("Seeding new data...");
    // Seed roles via addRole mutation, omitting the 'id' field from the source data
    for (const { id: _discarded, category, ...roleData } of itRoles) {
      await ctx.runMutation(api.roles.addRole, {
        ...roleData,
        categoryName: category,
      });
    }
    console.log(`Database seeded with ${itRoles.length} roles.`);
    // Return how many roles were inserted
    return itRoles.length;
  },
});
