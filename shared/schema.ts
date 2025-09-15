import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  googleId: text("google_id").notNull().unique(),
  points: integer("points").notNull().default(0), // Points are managed atomically in code
  isAdmin: boolean("is_admin").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  isOwner: boolean("is_owner").notNull().default(false),
  photoURL: text("photo_url"), // User's profile picture from Google
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const rewardCategories = pgTable("reward_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull().default("tag"), // Lucide icon name
  color: text("color").notNull().default("#8b5cf6"), // Hex color code
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  actionType: text("action_type").notNull(),
  actionConfig: jsonb("action_config").notNull(),
  categoryId: varchar("category_id").references(() => rewardCategories.id, { onDelete: "set null" }),
  tier: text("tier").notNull().default("common"), // 'common' or 'premium'
  availability: text("availability").default("Unlimited"), // e.g., "5 remaining", "Unlimited"
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  status: text("status").notNull().default("pending"), // 'pending', 'processed', 'completed', 'failed'
  processedAt: timestamp("processed_at"),
  redeemedAt: timestamp("redeemed_at").notNull().default(sql`now()`),
});

export const pointTransactions = pgTable("point_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'earned', 'spent', 'admin_added', 'admin_removed', 'transfer'
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRewardCategorySchema = createInsertSchema(rewardCategories).omit({ id: true, createdAt: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true, createdAt: true });
export const insertRedemptionSchema = createInsertSchema(redemptions).omit({ id: true, redeemedAt: true });
export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ id: true, createdAt: true });

// Admin operation validation schemas
export const adminPointsOperationSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  amount: z.number().int().positive("Amount must be a positive integer"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

export const adminTransferPointsSchema = z.object({
  fromUserId: z.string().uuid("Invalid from user ID format"),
  toUserId: z.string().uuid("Invalid to user ID format"),
  amount: z.number().int().positive("Amount must be a positive integer"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
}).refine(data => data.fromUserId !== data.toUserId, {
  message: "Cannot transfer points to the same user",
  path: ["toUserId"]
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().uuid("Invalid reward ID format")
});

// Category management schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name too long"),
  description: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
  sortOrder: z.number().int().default(0)
});

export const updateCategorySchema = createCategorySchema.partial();

// Enhanced reward filtering schemas
export const rewardFiltersSchema = z.object({
  category: z.string().optional(),
  tier: z.enum(["common", "premium"]).optional(),
  isActive: z.boolean().optional()
});

// Premium user management schema
export const updateUserPremiumSchema = z.object({
  isPremium: z.boolean()
});

// Owner-level user promotion schemas
export const updateUserAdminSchema = z.object({
  isAdmin: z.boolean()
});

export const updateUserOwnerSchema = z.object({
  isOwner: z.boolean()
});

// External desktop integration schemas
export const bulkPointUpdateSchema = z.object({
  updates: z.array(z.object({
    userId: z.string().uuid("Invalid user ID format"),
    pointsEarned: z.number().int().min(0, "Points earned must be non-negative"),
    description: z.string().min(1, "Description is required").default("Points earned from streaming")
  })).min(1, "At least one update is required").max(1000, "Too many updates at once")
});

// Admin point management schemas
export const adminGivePointsSchema = z.object({
  amount: z.number().int().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

export const adminRemovePointsSchema = z.object({
  amount: z.number().int().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

export const adminSetPointsSchema = z.object({
  amount: z.number().int().min(0, "Amount must be non-negative"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

// Owner point management by display name
export const ownerAddPointsByDisplayNameSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long"),
  amount: z.number().int().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description too long")
});

// Redemption processing schemas
export const updateRedemptionStatusSchema = z.object({
  status: z.enum(["pending", "processed", "completed", "failed"])
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRewardCategory = z.infer<typeof insertRewardCategorySchema>;
export type RewardCategory = typeof rewardCategories.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type Redemption = typeof redemptions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type AdminPointsOperation = z.infer<typeof adminPointsOperationSchema>;
export type AdminTransferPoints = z.infer<typeof adminTransferPointsSchema>;
export type RedeemReward = z.infer<typeof redeemRewardSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type RewardFilters = z.infer<typeof rewardFiltersSchema>;
export type UpdateUserPremium = z.infer<typeof updateUserPremiumSchema>;
export type UpdateUserAdmin = z.infer<typeof updateUserAdminSchema>;
export type UpdateUserOwner = z.infer<typeof updateUserOwnerSchema>;
export type BulkPointUpdate = z.infer<typeof bulkPointUpdateSchema>;
export type AdminGivePoints = z.infer<typeof adminGivePointsSchema>;
export type AdminRemovePoints = z.infer<typeof adminRemovePointsSchema>;
export type AdminSetPoints = z.infer<typeof adminSetPointsSchema>;
export type OwnerAddPointsByDisplayName = z.infer<typeof ownerAddPointsByDisplayNameSchema>;
export type UpdateRedemptionStatus = z.infer<typeof updateRedemptionStatusSchema>;
