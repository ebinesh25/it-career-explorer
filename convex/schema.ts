import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  roles: defineTable({
    title: v.string(),
    category: v.id('categories'),
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
  })
  .searchIndex('by_title', {
    searchField: 'title',
  })
  .searchIndex('by_description', {
    searchField: 'shortDescription',
  })
  .searchIndex('by_tags', {
    searchField: 'tags',
  }),

  categories: defineTable({
    name: v.string(),
  }),

  skills: defineTable({
    name: v.string(),
    type: v.union(v.literal('technical'), v.literal('soft')),
  }).searchIndex('by_name', {
    searchField: 'name',
  }),

  roleSkills: defineTable({
    roleId: v.id('roles'),
    skillId: v.id('skills'),
  })
  .index('by_roleId', ['roleId'])
  .index('by_skillId', ['skillId']),
});
