import { type User, type InsertUser, type Reward, type InsertReward, type Redemption, type InsertRedemption, type PointTransaction, type InsertPointTransaction, type RewardCategory, type InsertRewardCategory, type RewardFilters } from "@shared/schema";
import { randomUUID } from "crypto";
import type { PgDatabase, PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

// Transaction type for Drizzle
type TransactionHandle = PgTransaction<NodePgQueryResultHKT, any, any>;

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: string, tx?: TransactionHandle): Promise<User | undefined>;
  getUserByGoogleId(googleId: string, tx?: TransactionHandle): Promise<User | undefined>;
  getUserByEmail(email: string, tx?: TransactionHandle): Promise<User | undefined>;
  createUser(user: InsertUser, tx?: TransactionHandle): Promise<User>;
  updateUserPoints(userId: string, points: number, tx?: TransactionHandle): Promise<void>;
  
  // Atomic point operations
  adjustUserPoints(userId: string, adjustment: number, tx?: TransactionHandle): Promise<number>;
  debitPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; newBalance: number; error?: string }>;
  creditPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<number>;
  transferPointsAtomic(fromUserId: string, toUserId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }>;
  
  // Reward management
  getAllRewards(tx?: TransactionHandle): Promise<Reward[]>;
  getActiveRewards(tx?: TransactionHandle): Promise<Reward[]>;
  getReward(id: string, tx?: TransactionHandle): Promise<Reward | undefined>;
  createReward(reward: InsertReward, tx?: TransactionHandle): Promise<Reward>;
  updateReward(id: string, reward: Partial<InsertReward>, tx?: TransactionHandle): Promise<Reward | undefined>;
  deleteReward(id: string, tx?: TransactionHandle): Promise<void>;
  
  // Redemption management
  createRedemption(redemption: InsertRedemption, tx?: TransactionHandle): Promise<Redemption>;
  getUserRedemptions(userId: string, tx?: TransactionHandle): Promise<Redemption[]>;
  updateRedemptionStatus(id: string, status: string, tx?: TransactionHandle): Promise<void>;
  
  // Point transaction management
  createPointTransaction(transaction: InsertPointTransaction, tx?: TransactionHandle): Promise<PointTransaction>;
  getUserPointHistory(userId: string, tx?: TransactionHandle): Promise<PointTransaction[]>;
  
  // Category management
  getAllCategories(tx?: TransactionHandle): Promise<RewardCategory[]>;
  getCategory(id: string, tx?: TransactionHandle): Promise<RewardCategory | undefined>;
  createCategory(category: InsertRewardCategory, tx?: TransactionHandle): Promise<RewardCategory>;
  updateCategory(id: string, category: Partial<InsertRewardCategory>, tx?: TransactionHandle): Promise<RewardCategory | undefined>;
  deleteCategory(id: string, tx?: TransactionHandle): Promise<void>;
  
  // Enhanced reward management
  getFilteredRewards(filters: RewardFilters, tx?: TransactionHandle): Promise<Reward[]>;
  getRewardsWithCategories(tx?: TransactionHandle): Promise<(Reward & { category?: RewardCategory })[]>;
  getRewardsForUser(isPremium: boolean, tx?: TransactionHandle): Promise<Reward[]>;
  
  // User role management
  updateUserPremiumStatus(userId: string, isPremium: boolean, tx?: TransactionHandle): Promise<User | undefined>;
  updateUserAdminStatus(userId: string, isAdmin: boolean, tx?: TransactionHandle): Promise<User | undefined>;
  updateUserOwnerStatus(userId: string, isOwner: boolean, tx?: TransactionHandle): Promise<User | undefined>;
  updateUserPhotoURL(userId: string, photoURL: string, tx?: TransactionHandle): Promise<User | undefined>;
  getAllUsers(tx?: TransactionHandle): Promise<User[]>;
  getUsersLeaderboard(limit?: number, tx?: TransactionHandle): Promise<User[]>;
  
  // External integration and admin point management
  bulkUpdateUserPoints(updates: { userId: string; pointsEarned: number; description: string }[], tx?: TransactionHandle): Promise<{ successful: number; failed: number; errors: string[] }>;
  adminGivePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined>;
  adminRemovePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined>;
  adminSetPoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined>;
  
  // Enhanced redemption management
  getPendingRedemptions(tx?: TransactionHandle): Promise<(Redemption & { user: User; reward: Reward })[]>;
  updateRedemptionStatusWithTimestamp(id: string, status: string, tx?: TransactionHandle): Promise<Redemption | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string, tx?: TransactionHandle): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGoogleId(googleId: string, tx?: TransactionHandle): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async getUserByEmail(email: string, tx?: TransactionHandle): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser, tx?: TransactionHandle): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      points: insertUser.points ?? 0,
      isAdmin: insertUser.isAdmin ?? false,
      isPremium: insertUser.isPremium ?? false,
      isOwner: insertUser.isOwner ?? false,
      photoURL: insertUser.photoURL ?? null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: string, points: number, tx?: TransactionHandle): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.points = points;
      this.users.set(userId, user);
    }
  }

  // Atomic point operations (simple implementations for in-memory storage)
  async adjustUserPoints(userId: string, adjustment: number, tx?: TransactionHandle): Promise<number> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found for points adjustment');
    }
    user.points = Math.max(0, user.points + adjustment);
    this.users.set(userId, user);
    return user.points;
  }

  async debitPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'User not found' };
    }
    if (user.points < amount) {
      return { success: false, newBalance: user.points, error: 'Insufficient points' };
    }
    user.points -= amount;
    this.users.set(userId, user);
    return { success: true, newBalance: user.points };
  }

  async creditPoints(userId: string, amount: number, tx?: TransactionHandle): Promise<number> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found for points credit');
    }
    user.points += amount;
    this.users.set(userId, user);
    return user.points;
  }

  async transferPointsAtomic(fromUserId: string, toUserId: string, amount: number, tx?: TransactionHandle): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }> {
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
      const toBalance = await this.creditPoints(toUserId, amount, tx);
      return {
        success: true,
        fromBalance: debitResult.newBalance,
        toBalance
      };
    } catch (error) {
      throw new Error('Target user not found for transfer');
    }
  }

  // Stub implementations for rewards, redemptions, and point transactions
  // These will be replaced with database implementations
  async getAllRewards(tx?: TransactionHandle): Promise<Reward[]> {
    return [];
  }

  async getActiveRewards(tx?: TransactionHandle): Promise<Reward[]> {
    return [];
  }

  async getReward(id: string, tx?: TransactionHandle): Promise<Reward | undefined> {
    return undefined;
  }

  async createReward(reward: InsertReward, tx?: TransactionHandle): Promise<Reward> {
    const id = randomUUID();
    return { 
      ...reward, 
      id, 
      isActive: reward.isActive ?? true,
      categoryId: reward.categoryId ?? null,
      tier: reward.tier ?? "common",
      availability: reward.availability ?? null,
      createdAt: new Date() 
    };
  }

  async updateReward(id: string, reward: Partial<InsertReward>, tx?: TransactionHandle): Promise<Reward | undefined> {
    return undefined;
  }

  async deleteReward(id: string, tx?: TransactionHandle): Promise<void> {
    // stub
  }

  async createRedemption(redemption: InsertRedemption, tx?: TransactionHandle): Promise<Redemption> {
    const id = randomUUID();
    return {
      ...redemption,
      id,
      status: redemption.status ?? "pending",
      redeemedAt: new Date(),
      processedAt: redemption.processedAt ?? null,
    };
  }

  async getUserRedemptions(userId: string, tx?: TransactionHandle): Promise<Redemption[]> {
    return [];
  }

  async updateRedemptionStatus(id: string, status: string, tx?: TransactionHandle): Promise<void> {
    // stub
  }

  async createPointTransaction(transaction: InsertPointTransaction, tx?: TransactionHandle): Promise<PointTransaction> {
    const id = randomUUID();
    return { ...transaction, id, createdAt: new Date() };
  }

  async getUserPointHistory(userId: string, tx?: TransactionHandle): Promise<PointTransaction[]> {
    return [];
  }
  
  // Category management stubs
  async getAllCategories(tx?: TransactionHandle): Promise<RewardCategory[]> {
    return [];
  }

  async getCategory(id: string, tx?: TransactionHandle): Promise<RewardCategory | undefined> {
    return undefined;
  }

  async createCategory(category: InsertRewardCategory, tx?: TransactionHandle): Promise<RewardCategory> {
    const id = randomUUID();
    return { 
      ...category, 
      id, 
      description: category.description ?? null,
      icon: category.icon ?? "tag",
      color: category.color ?? "#8b5cf6",
      sortOrder: category.sortOrder ?? 0,
      createdAt: new Date() 
    };
  }

  async updateCategory(id: string, category: Partial<InsertRewardCategory>, tx?: TransactionHandle): Promise<RewardCategory | undefined> {
    return undefined;
  }

  async deleteCategory(id: string, tx?: TransactionHandle): Promise<void> {
    // stub
  }
  
  // Enhanced reward management stubs
  async getFilteredRewards(filters: RewardFilters, tx?: TransactionHandle): Promise<Reward[]> {
    return [];
  }

  async getRewardsWithCategories(tx?: TransactionHandle): Promise<(Reward & { category?: RewardCategory })[]> {
    return [];
  }

  async getRewardsForUser(isPremium: boolean, tx?: TransactionHandle): Promise<Reward[]> {
    // Premium users get all active rewards, non-premium get only common tier
    return [];
  }
  
  // User role management stubs
  async updateUserPremiumStatus(userId: string, isPremium: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isPremium = isPremium;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isAdmin = isAdmin;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserOwnerStatus(userId: string, isOwner: boolean, tx?: TransactionHandle): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isOwner = isOwner;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async updateUserPhotoURL(userId: string, photoURL: string, tx?: TransactionHandle): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.photoURL = photoURL;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async getAllUsers(tx?: TransactionHandle): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersLeaderboard(limit: number = 10, tx?: TransactionHandle): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }
  
  // External integration and admin point management stubs
  async bulkUpdateUserPoints(updates: { userId: string; pointsEarned: number; description: string }[], tx?: TransactionHandle): Promise<{ successful: number; failed: number; errors: string[] }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const update of updates) {
      try {
        await this.creditPoints(update.userId, update.pointsEarned, tx);
        successful++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to update ${update.userId}: ${error.message}`);
      }
    }
    
    return { successful, failed, errors };
  }

  async adminGivePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    try {
      await this.creditPoints(userId, amount, tx);
      return this.users.get(userId);
    } catch (error) {
      return undefined;
    }
  }

  async adminRemovePoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const result = await this.debitPoints(userId, amount, tx);
    return result.success ? this.users.get(userId) : undefined;
  }

  async adminSetPoints(userId: string, amount: number, description: string, adminId: string, tx?: TransactionHandle): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.points = amount;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }
  
  // Enhanced redemption management stubs
  async getPendingRedemptions(tx?: TransactionHandle): Promise<(Redemption & { user: User; reward: Reward })[]> {
    return [];
  }

  async updateRedemptionStatusWithTimestamp(id: string, status: string, tx?: TransactionHandle): Promise<Redemption | undefined> {
    return undefined;
  }
}

import { PostgreSQLStorage } from "./storage-pg";

export const storage = new PostgreSQLStorage();
