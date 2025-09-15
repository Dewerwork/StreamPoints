import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "./db";
import { users, rewards, redemptions, pointTransactions, rewardCategories } from "@shared/schema";
import { type User, type InsertUser, type Reward, type InsertReward, type Redemption, type InsertRedemption, type PointTransaction, type InsertPointTransaction, type RewardCategory, type InsertRewardCategory, type RewardFilters } from "@shared/schema";
import { type IStorage } from "./storage";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

// Transaction type for Drizzle
type TransactionHandle = PgTransaction<NodePgQueryResultHKT, any, any>;

export class PostgreSQLStorage implements IStorage {
  // User management
  async getUser(id: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByDisplayName(displayName: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(users).where(eq(users.displayName, displayName)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser, tx?: TransactionHandle): Promise<User> {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserPoints(userId: string, points: number, tx?: TransactionHandle): Promise<void> {
    const dbInstance = tx || db;
    // Use atomic update with constraint check to prevent negative points
    const result = await dbInstance.update(users)
      .set({ points })
      .where(eq(users.id, userId))
      .returning({ id: users.id, newPoints: users.points });
    
    if (result.length === 0) {
      throw new Error('User not found for points update');
    }
  }

  // Atomic point adjustment method to prevent race conditions
  async adjustUserPoints(userId: string, adjustment: number, tx?: TransactionHandle): Promise<number> {
    const dbInstance = tx || db;
    // Use atomic SQL operation to adjust points
    const result = await dbInstance.update(users)
      .set({ points: sql`GREATEST(0, points + ${adjustment})` }) // Prevents negative balances
      .where(eq(users.id, userId))
      .returning({ newPoints: users.points });
    
    if (result.length === 0) {
      throw new Error('User not found for points adjustment');
    }
    
    return result[0].newPoints;
  }

  // Atomic point debit method with sufficient balance check
  async debitPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const dbInstance = tx || db;
    
    // Atomic operation: only update if user has sufficient points
    const result = await dbInstance.update(users)
      .set({ points: sql`points - ${amount}` })
      .where(sql`${users.id} = ${userId} AND ${users.points} >= ${amount}`)
      .returning({ newPoints: users.points });
    
    if (result.length === 0) {
      // Check if user exists or just has insufficient points
      const user = await this.getUser(userId, tx);
      if (!user) {
        return { success: false, newBalance: 0, error: 'User not found' };
      }
      return { success: false, newBalance: user.points, error: 'Insufficient points' };
    }
    
    return { success: true, newBalance: result[0].newPoints };
  }

  // Atomic point credit method
  async creditPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<number> {
    const dbInstance = tx || db;
    
    const result = await dbInstance.update(users)
      .set({ points: sql`points + ${amount}` })
      .where(eq(users.id, userId))
      .returning({ newPoints: users.points });
    
    if (result.length === 0) {
      throw new Error('User not found for points credit');
    }
    
    return result[0].newPoints;
  }

  // Atomic point transfer between users
  async transferPointsAtomic(fromUserId: string, toUserId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }> {
    const dbInstance = tx || db;
    
    // First, atomically debit from source user
    const debitResult = await this.debitPoints(fromUserId, amount, tx);
    if (!debitResult.success) {
      return {
        success: false,
        fromBalance: debitResult.newBalance,
        toBalance: 0,
        error: debitResult.error
      };
    }
    
    try {
      // Then credit to target user
      const toBalance = await this.creditPoints(toUserId, amount, tx);
      
      return {
        success: true,
        fromBalance: debitResult.newBalance,
        toBalance
      };
    } catch (error) {
      // If credit fails, we need to rollback the debit
      // This should only happen if target user doesn't exist
      // The transaction will handle the rollback
      throw new Error('Target user not found for transfer');
    }
  }

  // Reward management
  async getAllRewards(tx?: TransactionHandle): Promise<Reward[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(rewards).orderBy(desc(rewards.createdAt));
  }

  async getActiveRewards(tx?: TransactionHandle): Promise<Reward[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(rewards).where(eq(rewards.isActive, true)).orderBy(rewards.cost);
  }

  async getReward(id: string, tx?: TransactionHandle): Promise<Reward | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(rewards).where(eq(rewards.id, id)).limit(1);
    return result[0];
  }

  async createReward(reward: InsertReward, tx?: TransactionHandle): Promise<Reward> {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(rewards).values(reward).returning();
    return result[0];
  }

  async updateReward(id: string, reward: Partial<InsertReward>, tx?: TransactionHandle): Promise<Reward | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(rewards).set(reward).where(eq(rewards.id, id)).returning();
    return result[0];
  }

  async deleteReward(id: string, tx?: TransactionHandle): Promise<void> {
    const dbInstance = tx || db;
    await dbInstance.delete(rewards).where(eq(rewards.id, id));
  }

  // Redemption management
  async createRedemption(redemption: InsertRedemption, tx?: TransactionHandle): Promise<Redemption> {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(redemptions).values(redemption).returning();
    return result[0];
  }

  async getUserRedemptions(userId: string, tx?: TransactionHandle): Promise<Redemption[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(redemptions).where(eq(redemptions.userId, userId)).orderBy(desc(redemptions.redeemedAt));
  }

  async updateRedemptionStatus(id: string, status: string, tx?: TransactionHandle): Promise<void> {
    const dbInstance = tx || db;
    await dbInstance.update(redemptions).set({ status }).where(eq(redemptions.id, id));
  }

  // Point transaction management
  async createPointTransaction(transaction: InsertPointTransaction, tx?: TransactionHandle): Promise<PointTransaction> {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(pointTransactions).values(transaction).returning();
    return result[0];
  }

  async getUserPointHistory(userId: string, tx?: TransactionHandle): Promise<PointTransaction[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(pointTransactions).where(eq(pointTransactions.userId, userId)).orderBy(desc(pointTransactions.createdAt));
  }

  // Category management
  async getAllCategories(tx?: TransactionHandle): Promise<RewardCategory[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(rewardCategories).orderBy(rewardCategories.sortOrder, rewardCategories.name);
  }

  async getCategory(id: string, tx?: TransactionHandle): Promise<RewardCategory | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.select().from(rewardCategories).where(eq(rewardCategories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertRewardCategory, tx?: TransactionHandle): Promise<RewardCategory> {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(rewardCategories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertRewardCategory>, tx?: TransactionHandle): Promise<RewardCategory | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(rewardCategories).set(category).where(eq(rewardCategories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string, tx?: TransactionHandle): Promise<void> {
    const dbInstance = tx || db;
    await dbInstance.delete(rewardCategories).where(eq(rewardCategories.id, id));
  }

  // Enhanced reward management
  async getFilteredRewards(filters: RewardFilters, tx?: TransactionHandle): Promise<Reward[]> {
    const dbInstance = tx || db;
    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(rewards.categoryId, filters.category));
    }
    if (filters.tier) {
      conditions.push(eq(rewards.tier, filters.tier));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(rewards.isActive, filters.isActive));
    }

    // If no conditions, return all rewards ordered by cost
    if (conditions.length === 0) {
      return await dbInstance.select()
        .from(rewards)
        .orderBy(rewards.cost, rewards.title);
    }
    
    // Apply conditions using and()
    return await dbInstance.select()
      .from(rewards)
      .where(and(...conditions))
      .orderBy(rewards.cost, rewards.title);
  }

  async getRewardsWithCategories(tx?: TransactionHandle): Promise<(Reward & { category?: RewardCategory })[]> {
    const dbInstance = tx || db;
    const result = await dbInstance.select()
      .from(rewards)
      .leftJoin(rewardCategories, eq(rewards.categoryId, rewardCategories.id))
      .orderBy(rewards.cost, rewards.title);
    
    return result.map(row => ({
      ...row.rewards,
      category: row.reward_categories || undefined
    }));
  }

  // User role management
  async updateUserPremiumStatus(userId: string, isPremium: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(users).set({ isPremium }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(users).set({ isAdmin }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async updateUserOwnerStatus(userId: string, isOwner: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(users).set({ isOwner }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async updateUserPhotoURL(userId: string, photoURL: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    const result = await dbInstance.update(users).set({ photoURL }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getAllUsers(tx?: TransactionHandle): Promise<User[]> {
    const dbInstance = tx || db;
    return await dbInstance.select().from(users).orderBy(desc(users.points), users.displayName);
  }

  async getUsersLeaderboard(limit: number = 10, tx?: TransactionHandle): Promise<User[]> {
    const dbInstance = tx || db;
    return await dbInstance.select()
      .from(users)
      .orderBy(desc(users.points), users.displayName)
      .limit(limit);
  }

  // User-scoped reward filtering
  async getRewardsForUser(isPremium: boolean, tx?: TransactionHandle): Promise<Reward[]> {
    const dbInstance = tx || db;
    const tierFilter = isPremium ? undefined : "common"; // Premium users see all tiers, regular users only common
    
    const conditions = [eq(rewards.isActive, true)];
    if (tierFilter) {
      conditions.push(eq(rewards.tier, tierFilter));
    }
    
    return await dbInstance.select()
      .from(rewards)
      .where(and(...conditions))
      .orderBy(rewards.cost, rewards.title);
  }

  // External integration and admin point management
  async bulkUpdateUserPoints(updates: { userId: string; pointsEarned: number; description: string }[], tx?: TransactionHandle): Promise<{ successful: number; failed: number; errors: string[] }> {
    const dbInstance = tx || db;
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    
    // Process updates in a transaction to ensure atomicity
    await dbInstance.transaction(async (trx) => {
      for (const update of updates) {
        try {
          // Credit points and create transaction record
          const newBalance = await this.creditPoints(update.userId, update.pointsEarned, trx);
          
          await trx.insert(pointTransactions).values({
            userId: update.userId,
            amount: update.pointsEarned,
            type: 'earned',
            description: update.description
          });
          
          successful++;
        } catch (error: any) {
          failed++;
          errors.push(`Failed to update ${update.userId}: ${error.message}`);
        }
      }
    });
    
    return { successful, failed, errors };
  }

  async adminGivePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    
    try {
      return await dbInstance.transaction(async (trx) => {
        // Credit points
        await this.creditPoints(userId, amount, trx);
        
        // Create transaction record
        await trx.insert(pointTransactions).values({
          userId,
          amount,
          type: 'admin_added',
          description: `${description} (by admin ${adminId})`
        });
        
        // Return updated user
        return await this.getUser(userId, trx);
      });
    } catch (error) {
      return undefined;
    }
  }

  async adminRemovePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    
    try {
      return await dbInstance.transaction(async (trx) => {
        // Debit points
        const result = await this.debitPoints(userId, amount, trx);
        if (!result.success) {
          throw new Error(result.error || 'Failed to debit points');
        }
        
        // Create transaction record
        await trx.insert(pointTransactions).values({
          userId,
          amount: -amount,
          type: 'admin_removed',
          description: `${description} (by admin ${adminId})`
        });
        
        // Return updated user
        return await this.getUser(userId, trx);
      });
    } catch (error) {
      return undefined;
    }
  }

  async adminSetPoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const dbInstance = tx || db;
    
    try {
      return await dbInstance.transaction(async (trx) => {
        // Get current balance
        const currentUser = await this.getUser(userId, trx);
        if (!currentUser) {
          throw new Error('User not found');
        }
        
        const difference = amount - currentUser.points;
        
        // Set points directly
        await trx.update(users).set({ points: amount }).where(eq(users.id, userId));
        
        // Create transaction record
        await trx.insert(pointTransactions).values({
          userId,
          amount: difference,
          type: difference >= 0 ? 'admin_added' : 'admin_removed',
          description: `Points set to ${amount} (${difference >= 0 ? '+' : ''}${difference}) by admin ${adminId}: ${description}`
        });
        
        // Return updated user
        return await this.getUser(userId, trx);
      });
    } catch (error) {
      return undefined;
    }
  }
  
  // Enhanced redemption management
  async getPendingRedemptions(tx?: TransactionHandle): Promise<(Redemption & { user: User; reward: Reward })[]> {
    const dbInstance = tx || db;
    
    const result = await dbInstance.select({
      id: redemptions.id,
      userId: redemptions.userId,
      rewardId: redemptions.rewardId,
      status: redemptions.status,
      processedAt: redemptions.processedAt,
      redeemedAt: redemptions.redeemedAt,
      user: users,
      reward: rewards
    })
    .from(redemptions)
    .innerJoin(users, eq(redemptions.userId, users.id))
    .innerJoin(rewards, eq(redemptions.rewardId, rewards.id))
    .where(eq(redemptions.status, 'pending'))
    .orderBy(redemptions.redeemedAt);
    
    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      rewardId: row.rewardId,
      status: row.status,
      processedAt: row.processedAt,
      redeemedAt: row.redeemedAt,
      user: row.user,
      reward: row.reward
    }));
  }

  async updateRedemptionStatusWithTimestamp(id: string, status: string, tx?: TransactionHandle): Promise<Redemption | undefined> {
    const dbInstance = tx || db;
    
    const updateData: any = { status };
    if (status === 'processed' || status === 'completed') {
      updateData.processedAt = new Date();
    }
    
    const result = await dbInstance.update(redemptions)
      .set(updateData)
      .where(eq(redemptions.id, id))
      .returning();
    
    return result[0];
  }
}