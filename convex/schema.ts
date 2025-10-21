import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  roles: defineTable({
    id: v.string(),
    title: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    shortDescription: v.string(),
    alternateNames: v.array(v.string()),
    technicalSkills: v.array(v.string()),
    softSkills: v.array(v.string()),
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
  })
});
