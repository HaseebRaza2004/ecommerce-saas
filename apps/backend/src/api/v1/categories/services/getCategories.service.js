import { eq, asc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { categories } = schema;

// Assemble a nested category tree from a flat list of categories, preserving parent-child relationships.
const assembleCategoryTree = (flatList) => {
  const nodeMap = new Map();
  const tree = [];

  for (const item of flatList) {
    nodeMap.set(item.id, { ...item, children: [] });
  }

  for (const item of flatList) {
    const node = nodeMap.get(item.id);
    if (item.parentId && nodeMap.has(item.parentId)) {
      nodeMap.get(item.parentId).children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};

// Service to retrieve all categories for a specific merchant, returning both a flat list and a nested tree structure, with caching to prevent stampedes.
export const getCategoriesService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "categories:all",
    async () => {
      const flatCategories = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          parentId: categories.parentId,
          path: categories.path,
          createdAt: categories.createdAt,
        })
        .from(categories)
        .where(eq(categories.merchantId, merchantId))
        .orderBy(asc(categories.path));

      return {
        total_count: flatCategories.length,
        tree: assembleCategoryTree(flatCategories),
        flat: flatCategories,
      };
    },
    3600,
  );
};