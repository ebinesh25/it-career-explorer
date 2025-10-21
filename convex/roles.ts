import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRoles = query({
  handler: async ({ db }) => db.query("roles").collect()
});

export const getRoleById = query({
  args: { id: v.string() },
  handler: async ({ db }, { id }) =>
    db.query("roles").filter(q => q.eq(q.field("id"), id)).first()
});

export const getCategories = query({
  handler: async ({ db }) => {
    const roles = await db.query("roles").collect();
    return Array.from(new Set(roles.map(r => r.category)));
  }
});

export const getTags = query({
  handler: async ({ db }) => {
    const roles = await db.query("roles").collect();
    const tags = new Set<string>();
    for (const role of roles) {
      for (const tag of role.tags) tags.add(tag);
    }
    return Array.from(tags);
  }
});