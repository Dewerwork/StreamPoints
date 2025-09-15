import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  insertUserSchema,
  insertRewardSchema,
  insertRedemptionSchema,
  insertPointTransactionSchema,
  adminPointsOperationSchema,
  adminTransferPointsSchema,
  redeemRewardSchema,
  insertRewardCategorySchema,
  createCategorySchema,
  updateCategorySchema,
  rewardFiltersSchema,
  updateUserPremiumSchema,
  updateUserAdminSchema,
  updateUserOwnerSchema,
  bulkPointUpdateSchema,
  adminGivePointsSchema,
  adminRemovePointsSchema,
  adminSetPointsSchema,
  updateRedemptionStatusSchema,
  users,
} from "@shared/schema";
import {
  initializeActionHandlers,
  executeRewardAction,
  validateActionConfig,
  actionRegistry,
} from "./actions/init";

// Initialize Firebase Admin
let adminAuth: any = null;

// Function to initialize Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    // Check if we have the required Firebase Admin environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      // Use dynamic import for firebase-admin in ES modules
      const admin = (await import("firebase-admin")).default;

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      adminAuth = admin.auth();
      console.log("Firebase Admin initialized successfully");
    } else {
      console.warn(
        "Firebase Admin environment variables not found. Authentication will be bypassed in development.",
      );
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    console.warn("Authentication will be bypassed in development.");
  }
}

// Initialize Firebase Admin on startup
initializeFirebaseAdmin();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
}

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV !== "production";

// Middleware to authenticate Firebase ID tokens
async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: Function,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const token = authHeader.substring(7);

    if (!adminAuth) {
      if (isDevelopment) {
        console.warn(
          "Development mode: Firebase Admin not configured, attempting manual token decode",
        );
        
        try {
          // Decode the JWT token manually (without verification for development)
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          
          if (payload.email && payload.user_id) {
            console.log("Extracted user from token (no admin):", {
              uid: payload.user_id,
              email: payload.email,
              name: payload.name || payload.email
            });
            
            req.user = {
              id: payload.user_id,
              email: payload.email,
              displayName: payload.name || payload.email.split('@')[0],
            };
            return next();
          }
        } catch (decodeError: any) {
          console.warn("Failed to decode token manually, using dev bypass:", decodeError.message);
        }
        
        // Only fall back to dev user if token decode fails
        req.user = {
          id: "dev-user-123",
          email: "dev@example.com",
          displayName: "Dev User",
        };
        return next();
      } else {
        return res
          .status(500)
          .json({ error: "Authentication service unavailable" });
      }
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token, true); // checkRevoked = true
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || "Unknown User",
      };

      next();
    } catch (tokenError: any) {
      console.error("Token verification failed:", tokenError.message);

      // In development, try to decode the token manually to extract user info
      if (isDevelopment) {
        console.warn(
          "Development mode: Firebase Admin token verification failed, attempting manual token decode",
        );
        
        try {
          // Decode the JWT token manually (without verification for development)
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          
          if (payload.email && payload.user_id) {
            console.log("Extracted user from token:", {
              uid: payload.user_id,
              email: payload.email,
              name: payload.name || payload.email
            });
            
            req.user = {
              id: payload.user_id,
              email: payload.email,
              displayName: payload.name || payload.email.split('@')[0],
            };
            return next();
          }
        } catch (decodeError: any) {
          console.warn("Failed to decode token manually, using dev bypass:", decodeError.message);
        }
        
        // Only fall back to dev user if token decode also fails
        req.user = {
          id: "dev-user-123",
          email: "dev@example.com",
          displayName: "Dev User",
        };
        return next();
      }

      return res.status(401).json({
        error: "Invalid or expired authentication token",
        code: tokenError.code || "auth/invalid-token",
      });
    }
  } catch (error: any) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Authentication service error" });
  }
}

// Middleware to ensure user exists in database
async function ensureUser(
  req: AuthenticatedRequest,
  res: Response,
  next: Function,
) {
  if (!req.user) {
    return res.status(401).json({ error: "No authenticated user" });
  }

  try {
    let user = await storage.getUserByGoogleId(req.user.id);

    if (!user) {
      // Check if user already exists by email (for development mode)
      const existingUser = await storage.getAllUsers();
      const userByEmail = existingUser.find(u => u.email === req.user!.email);
      
      if (userByEmail) {
        // User exists with this email, use the existing user
        user = userByEmail;
      } else {
        // Create user if they don't exist - use transaction for atomicity
        user = await db.transaction(async (tx) => {
          const newUserData = {
            email: req.user!.email,
            displayName: req.user!.displayName,
            googleId: req.user!.id,
            points: 1000, // Starting points for new users
            isAdmin: false,
          };

          const validatedData = insertUserSchema.parse(newUserData);
          const createdUser = await storage.createUser(validatedData, tx);

          // Log the welcome transaction atomically
          await storage.createPointTransaction(
            {
              userId: createdUser.id,
              amount: 1000,
              type: "earned",
              description: "Welcome bonus for new user",
            },
            tx,
          );

          return createdUser;
        });
      }
    }

    // Attach full user data to request
    req.user = { ...req.user, ...user };
    next();
  } catch (error: any) {
    console.error("Error ensuring user exists:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Invalid user data", details: error.issues });
    }

    res.status(500).json({ error: "Failed to process user" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize reward action handlers
  initializeActionHandlers();

  // User routes
  app.get(
    "/api/user/profile",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      res.json(req.user);
    },
  );

  app.get(
    "/api/user/points",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const user = await storage.getUser(req.user!.id);
        res.json({ points: user?.points || 0 });
      } catch (error) {
        res.status(500).json({ error: "Failed to get user points" });
      }
    },
  );

  app.get(
    "/api/user/history",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const history = await storage.getUserPointHistory(req.user!.id);
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: "Failed to get point history" });
      }
    },
  );

  // Enhanced rewards routes
  app.get(
    "/api/rewards",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Get user to check premium status
        const user = await storage.getUser(req.user!.id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get rewards filtered by user's premium status
        const rewards = await storage.getRewardsForUser(user.isPremium);
        res.json(rewards);
      } catch (error) {
        res.status(500).json({ error: "Failed to get rewards" });
      }
    },
  );

  app.get(
    "/api/rewards/with-categories",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Get user to check premium status
        const user = await storage.getUser(req.user!.id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get all rewards with categories, then filter by premium status
        const allRewards = await storage.getRewardsWithCategories();
        const rewards = allRewards.filter(
          (reward) => user.isPremium || reward.tier === "common",
        );

        res.json(rewards);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to get rewards with categories" });
      }
    },
  );

  app.get(
    "/api/rewards/filtered",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Validate query parameters
        const filters = rewardFiltersSchema.parse(req.query);

        // Get user to check premium status for tier filtering
        const user = await storage.getUser(req.user!.id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // SECURITY: Enforce premium restrictions - non-premium users can ONLY see common rewards
        if (!user.isPremium) {
          // If non-premium user tries to access premium rewards explicitly, return empty
          if (filters.tier === "premium") {
            return res.json([]);
          }
          // Force tier filter to 'common' for non-premium users when tier is undefined
          filters.tier = "common";
        }

        // Ensure isActive filter is always applied for security
        if (filters.isActive === undefined) {
          filters.isActive = true;
        }

        const rewards = await storage.getFilteredRewards(filters);
        res.json(rewards);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({
              error: "Invalid filter parameters",
              details: error.issues,
            });
        }
        res.status(500).json({ error: "Failed to get filtered rewards" });
      }
    },
  );

  app.get(
    "/api/rewards/all",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check if user is admin
        const user = await storage.getUser(req.user!.id);
        if (!user?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const rewards = await storage.getAllRewards();
        res.json(rewards);
      } catch (error) {
        res.status(500).json({ error: "Failed to get all rewards" });
      }
    },
  );

  // Reward redemption
  app.post(
    "/api/rewards/:rewardId/redeem",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Validate reward ID parameter
        const validatedParams = redeemRewardSchema.parse({
          rewardId: req.params.rewardId,
        });
        const { rewardId } = validatedParams;
        const userId = req.user!.id;

        // Execute redemption in a database transaction
        const result = await db.transaction(async (tx) => {
          // Get reward details within transaction
          const reward = await storage.getReward(rewardId, tx);
          if (!reward) {
            throw new Error("Reward not found");
          }

          if (!reward.isActive) {
            throw new Error("Reward is not active");
          }

          // CRITICAL SECURITY: Check premium access for premium rewards
          const user = await storage.getUser(userId, tx);
          if (!user) {
            throw new Error("User not found");
          }

          if (reward.tier === "premium" && !user.isPremium) {
            throw new Error("Premium access required for this reward");
          }

          // Atomically debit points with balance check
          const debitResult = await storage.debitPoints(
            userId,
            reward.cost,
            tx,
          );
          if (!debitResult.success) {
            if (debitResult.error === "User not found") {
              throw new Error("User not found");
            }
            throw new Error("Insufficient points");
          }

          // Create redemption record
          const redemption = await storage.createRedemption(
            {
              userId,
              rewardId,
              status: "pending",
            },
            tx,
          );

          // Log the transaction
          await storage.createPointTransaction(
            {
              userId,
              amount: -reward.cost,
              type: "spent",
              description: `Redeemed: ${reward.title}`,
            },
            tx,
          );

          return { redemption, newPoints: debitResult.newBalance, reward };
        });

        // Execute the reward action after successful redemption
        const user = await storage.getUser(userId);
        if (user) {
          try {
            const actionResult = await executeRewardAction(
              user,
              result.reward,
              result.redemption,
            );

            // Update redemption status based on action result
            if (actionResult.shouldUpdateStatus) {
              await storage.updateRedemptionStatus(
                result.redemption.id,
                actionResult.shouldUpdateStatus,
              );
            }

            console.log(`[REWARD ACTION] ${actionResult.message}`, {
              userId: user.id,
              rewardId: result.reward.id,
              redemptionId: result.redemption.id,
              success: actionResult.success,
              actionType: result.reward.actionType,
            });
          } catch (actionError) {
            console.error("Action execution error:", actionError);
            // Don't fail the redemption if action fails - the points were already deducted
            await storage.updateRedemptionStatus(
              result.redemption.id,
              "failed",
            );
          }
        }

        res.json({
          redemption: result.redemption,
          newPoints: result.newPoints,
          message: `Successfully redeemed ${result.reward.title}`,
        });
      } catch (error: any) {
        console.error("Redemption error:", error);

        if (error.message === "Reward not found") {
          return res.status(404).json({ error: "Reward not found" });
        }
        if (error.message === "Reward is not active") {
          return res.status(400).json({ error: "Reward is not active" });
        }
        if (error.message === "Premium access required for this reward") {
          return res
            .status(403)
            .json({ error: "Premium access required for this reward" });
        }
        if (error.message === "Insufficient points") {
          return res.status(400).json({ error: "Insufficient points" });
        }
        if (error.message === "User not found") {
          return res.status(404).json({ error: "User not found" });
        }

        // Handle validation errors
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid reward ID format", details: error.issues });
        }

        res.status(500).json({ error: "Failed to redeem reward" });
      }
    },
  );

  // User redemption history
  app.get(
    "/api/user/redemptions",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const redemptions = await storage.getUserRedemptions(req.user!.id);
        res.json(redemptions);
      } catch (error) {
        res.status(500).json({ error: "Failed to get redemption history" });
      }
    },
  );

  // Admin routes
  app.post(
    "/api/admin/points/add",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        // Validate request body
        const validatedData = adminPointsOperationSchema.parse(req.body);
        const { userId, amount, description } = validatedData;

        // Execute point addition in a database transaction
        const result = await db.transaction(async (tx) => {
          // Get target user to ensure they exist and get their name
          const user = await storage.getUser(userId, tx);
          if (!user) {
            throw new Error("User not found");
          }

          // Add points atomically
          const newPoints = await storage.creditPoints(userId, amount, tx);

          // Log transaction
          await storage.createPointTransaction(
            {
              userId,
              amount,
              type: "admin_added",
              description: description || `Points added by admin`,
            },
            tx,
          );

          return { user, newPoints };
        });

        res.json({
          success: true,
          newPoints: result.newPoints,
          message: `Added ${amount} points to ${result.user.displayName}`,
        });
      } catch (error: any) {
        console.error("Admin add points error:", error);

        if (error.message === "User not found") {
          return res.status(404).json({ error: "User not found" });
        }

        // Handle validation errors
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }

        res.status(500).json({ error: "Failed to add points" });
      }
    },
  );

  app.post(
    "/api/admin/points/remove",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        // Validate request body
        const validatedData = adminPointsOperationSchema.parse(req.body);
        const { userId, amount, description } = validatedData;

        // Execute point removal in a database transaction
        const result = await db.transaction(async (tx) => {
          // Get target user to ensure they exist and get their name and current balance
          const user = await storage.getUser(userId, tx);
          if (!user) {
            throw new Error("User not found");
          }

          // Calculate the actual amount that will be removed (cannot go negative)
          const actualAmountRemoved = Math.min(amount, user.points);

          // Remove points atomically using negative adjustment (prevents negative balances)
          const newPoints = await storage.adjustUserPoints(userId, -amount, tx);

          // Log transaction with actual amount removed
          await storage.createPointTransaction(
            {
              userId,
              amount: -actualAmountRemoved,
              type: "admin_removed",
              description: description || `Points removed by admin`,
            },
            tx,
          );

          return { user, newPoints, actualAmountRemoved };
        });

        res.json({
          success: true,
          newPoints: result.newPoints,
          message: `Removed ${result.actualAmountRemoved} points from ${result.user.displayName}`,
        });
      } catch (error: any) {
        console.error("Admin remove points error:", error);

        if (error.message === "User not found") {
          return res.status(404).json({ error: "User not found" });
        }

        // Handle validation errors
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }

        res.status(500).json({ error: "Failed to remove points" });
      }
    },
  );

  app.post(
    "/api/admin/points/transfer",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        // Validate request body
        const validatedData = adminTransferPointsSchema.parse(req.body);
        const { fromUserId, toUserId, amount, description } = validatedData;

        // Execute point transfer in a database transaction
        const result = await db.transaction(async (tx) => {
          // Get both users to check they exist and get their names
          const fromUser = await storage.getUser(fromUserId, tx);
          const toUser = await storage.getUser(toUserId, tx);

          if (!fromUser) {
            throw new Error("Source user not found");
          }
          if (!toUser) {
            throw new Error("Target user not found");
          }

          // Execute atomic transfer
          const transferResult = await storage.transferPointsAtomic(
            fromUserId,
            toUserId,
            amount,
            tx,
          );
          if (!transferResult.success) {
            if (transferResult.error === "User not found") {
              throw new Error("Source user not found");
            }
            throw new Error("Insufficient points in source account");
          }

          // Log transactions for both users
          await storage.createPointTransaction(
            {
              userId: fromUserId,
              amount: -amount,
              type: "transfer",
              description: `Transfer to ${toUser.displayName}: ${description || "Admin transfer"}`,
            },
            tx,
          );

          await storage.createPointTransaction(
            {
              userId: toUserId,
              amount,
              type: "transfer",
              description: `Transfer from ${fromUser.displayName}: ${description || "Admin transfer"}`,
            },
            tx,
          );

          return { fromUser, toUser };
        });

        res.json({
          success: true,
          message: `Transferred ${amount} points from ${result.fromUser.displayName} to ${result.toUser.displayName}`,
        });
      } catch (error: any) {
        console.error("Admin transfer points error:", error);

        if (
          error.message === "Source user not found" ||
          error.message === "Target user not found"
        ) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === "Insufficient points in source account") {
          return res
            .status(400)
            .json({ error: "Insufficient points in source account" });
        }

        // Handle validation errors
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }

        res.status(500).json({ error: "Failed to transfer points" });
      }
    },
  );

  // Admin reward management
  app.post(
    "/api/admin/rewards",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const validatedData = insertRewardSchema.parse(req.body);

        // Validate action configuration
        const configValidation = validateActionConfig(
          validatedData.actionType,
          validatedData.actionConfig,
        );
        if (configValidation !== true) {
          return res
            .status(400)
            .json({
              error: `Invalid action configuration: ${configValidation}`,
            });
        }

        const reward = await storage.createReward(validatedData);
        res.json(reward);
      } catch (error: any) {
        res
          .status(400)
          .json({ error: error.message || "Failed to create reward" });
      }
    },
  );

  app.put(
    "/api/admin/rewards/:rewardId",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { rewardId } = req.params;
        const validatedData = insertRewardSchema.partial().parse(req.body);

        // Validate action configuration if provided
        if (validatedData.actionType && validatedData.actionConfig) {
          const configValidation = validateActionConfig(
            validatedData.actionType,
            validatedData.actionConfig,
          );
          if (configValidation !== true) {
            return res
              .status(400)
              .json({
                error: `Invalid action configuration: ${configValidation}`,
              });
          }
        }

        const reward = await storage.updateReward(rewardId, validatedData);

        if (!reward) {
          return res.status(404).json({ error: "Reward not found" });
        }

        res.json(reward);
      } catch (error: any) {
        res
          .status(400)
          .json({ error: error.message || "Failed to update reward" });
      }
    },
  );

  app.delete(
    "/api/admin/rewards/:rewardId",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { rewardId } = req.params;
        await storage.deleteReward(rewardId);
        res.json({ success: true, message: "Reward deleted" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete reward" });
      }
    },
  );

  // Action types endpoint
  app.get("/api/action-types", (req: Request, res: Response) => {
    const supportedTypes = actionRegistry.getSupportedTypes();
    const actionHandlers = actionRegistry.getAll();

    const actionInfo = actionHandlers.map((handler) => ({
      type: handler.actionType,
      name: handler.actionType
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

    res.json({
      supported: supportedTypes,
      actions: actionInfo,
    });
  });

  // Category management routes (admin only)
  app.get(
    "/api/admin/categories",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const categories = await storage.getAllCategories();
        res.json(categories);
      } catch (error) {
        res.status(500).json({ error: "Failed to get categories" });
      }
    },
  );

  app.post(
    "/api/admin/categories",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const validatedData = createCategorySchema.parse(req.body);
        const category = await storage.createCategory(validatedData);
        res.json(category);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid category data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to create category" });
      }
    },
  );

  app.put(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { categoryId } = req.params;
        const validatedData = updateCategorySchema.parse(req.body);
        const category = await storage.updateCategory(
          categoryId,
          validatedData,
        );

        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }

        res.json(category);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid category data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to update category" });
      }
    },
  );

  app.delete(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { categoryId } = req.params;
        await storage.deleteCategory(categoryId);
        res.json({ success: true, message: "Category deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
      }
    },
  );

  // Public category endpoint (for frontend category filtering)
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // User leaderboard routes
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam, 10) : 10;

      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res
          .status(400)
          .json({ error: "Limit must be between 1 and 100" });
      }

      const leaderboard = await storage.getUsersLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Premium user management (admin only)
  app.put(
    "/api/admin/users/:userId/premium",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { userId } = req.params;
        const validatedData = updateUserPremiumSchema.parse(req.body);

        const user = await storage.updateUserPremiumStatus(
          userId,
          validatedData.isPremium,
        );
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          success: true,
          user: user,
          message: `User ${user.displayName} is now ${validatedData.isPremium ? "premium" : "regular"}`,
        });
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({
              error: "Invalid premium status data",
              details: error.issues,
            });
        }
        res.status(500).json({ error: "Failed to update premium status" });
      }
    },
  );

  // Admin user management
  app.get(
    "/api/admin/users",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const users = await storage.getAllUsers();
        // Transform to AdminUser format (extend User with admin-specific fields)
        const adminUsers = users.map(user => ({
          ...user,
          totalEarned: 0, // TODO: implement actual calculations
          totalSpent: 0,  // TODO: implement actual calculations
          redemptionCount: 0 // TODO: implement actual calculations
        }));
        res.json(adminUsers);
      } catch (error) {
        res.status(500).json({ error: "Failed to get users" });
      }
    },
  );

  // Admin categories endpoint
  app.get(
    "/api/admin/categories",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const categories = await storage.getAllCategories();
        res.json(categories);
      } catch (error: any) {
        console.error('Admin categories error:', error);
        res.status(500).json({ error: 'Failed to fetch admin categories' });
      }
    },
  );

  // All rewards endpoint
  app.get(
    "/api/rewards/all",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const rewards = await storage.getAllRewards();
        res.json(rewards);
      } catch (error: any) {
        console.error('All rewards error:', error);
        res.status(500).json({ error: 'Failed to fetch all rewards' });
      }
    },
  );

  app.put(
    "/api/admin/users/:userId/premium",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { userId } = req.params;
        const validatedData = updateUserPremiumSchema.parse(req.body);

        const updatedUser = await storage.updateUserPremiumStatus(
          userId,
          validatedData.isPremium,
        );
        res.json(updatedUser);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to update user premium status" });
      }
    },
  );

  // Owner-level user promotion endpoints
  app.put(
    "/api/owner/users/:userId/admin",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check owner access
        const owner = await storage.getUser(req.user!.id);
        if (!owner?.isOwner) {
          return res.status(403).json({ error: "Owner access required" });
        }

        const { userId } = req.params;
        const validatedData = updateUserAdminSchema.parse(req.body);

        const updatedUser = await storage.updateUserAdminStatus(
          userId,
          validatedData.isAdmin,
        );
        res.json(updatedUser);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to update user admin status" });
      }
    },
  );

  app.put(
    "/api/owner/users/:userId/owner",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check owner access
        const owner = await storage.getUser(req.user!.id);
        if (!owner?.isOwner) {
          return res.status(403).json({ error: "Owner access required" });
        }

        const { userId } = req.params;
        const validatedData = updateUserOwnerSchema.parse(req.body);

        // Prevent removing your own owner status
        if (userId === req.user!.id && !validatedData.isOwner) {
          return res
            .status(400)
            .json({ error: "Cannot remove your own owner status" });
        }

        const updatedUser = await storage.updateUserOwnerStatus(
          userId,
          validatedData.isOwner,
        );
        res.json(updatedUser);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to update user owner status" });
      }
    },
  );

  // External desktop integration endpoint for bulk point updates (owner-only)
  app.post(
    "/api/owner/bulk-points",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check owner access
        const owner = await storage.getUser(req.user!.id);
        if (!owner?.isOwner) {
          return res.status(403).json({ error: "Owner access required" });
        }

        const validatedData = bulkPointUpdateSchema.parse(req.body);

        const result = await storage.bulkUpdateUserPoints(
          validatedData.updates,
        );
        res.json(result);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to process bulk point updates" });
      }
    },
  );

  // Admin point management endpoints
  app.post(
    "/api/admin/users/:userId/give-points",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { userId } = req.params;
        console.log("Give points - userId from params:", userId);
        console.log("Give points - request body received:", req.body);
        const validatedData = adminGivePointsSchema.parse(req.body);
        console.log("Give points - validated data:", validatedData);

        const updatedUser = await storage.adminGivePoints(
          userId,
          validatedData.amount,
          validatedData.description,
          req.user!.id,
        );
        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(updatedUser);
      } catch (error: any) {
        console.log("Give points error:", error);
        if (error.name === "ZodError") {
          console.log("Zod validation error details:", error.issues);
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        console.log("Non-Zod error:", error.message);
        res
          .status(500)
          .json({ error: "Failed to give points", details: error.message });
      }
    },
  );

  app.post(
    "/api/admin/users/:userId/remove-points",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { userId } = req.params;
        console.log("Remove points - userId from params:", userId);
        console.log("Remove points - request body received:", req.body);
        const validatedData = adminRemovePointsSchema.parse(req.body);
        console.log("Remove points - validated data:", validatedData);

        const updatedUser = await storage.adminRemovePoints(
          userId,
          validatedData.amount,
          validatedData.description,
          req.user!.id,
        );
        if (!updatedUser) {
          return res
            .status(404)
            .json({ error: "User not found or insufficient points" });
        }
        res.json(updatedUser);
      } catch (error: any) {
        console.log("Remove points error:", error);
        if (error.name === "ZodError") {
          console.log("Zod validation error details:", error.issues);
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        console.log("Non-Zod error:", error.message);
        res
          .status(500)
          .json({ error: "Failed to remove points", details: error.message });
      }
    },
  );

  app.post(
    "/api/admin/users/:userId/set-points",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check admin access
        const admin = await storage.getUser(req.user!.id);
        if (!admin?.isAdmin) {
          return res.status(403).json({ error: "Admin access required" });
        }

        const { userId } = req.params;
        console.log("Set points - userId from params:", userId);
        console.log("Set points - request body received:", req.body);
        const validatedData = adminSetPointsSchema.parse(req.body);
        console.log("Set points - validated data:", validatedData);

        const updatedUser = await storage.adminSetPoints(
          userId,
          validatedData.amount,
          validatedData.description,
          req.user!.id,
        );
        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(updatedUser);
      } catch (error: any) {
        console.log("Set points error:", error);
        if (error.name === "ZodError") {
          console.log("Zod validation error details:", error.issues);
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        console.log("Non-Zod error:", error.message);
        res
          .status(500)
          .json({ error: "Failed to set points", details: error.message });
      }
    },
  );

  // Redemption processing endpoints for external desktop tool
  app.get(
    "/api/owner/pending-redemptions",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check owner access
        const owner = await storage.getUser(req.user!.id);
        if (!owner?.isOwner) {
          return res.status(403).json({ error: "Owner access required" });
        }

        const pendingRedemptions = await storage.getPendingRedemptions();
        res.json(pendingRedemptions);
      } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch pending redemptions" });
      }
    },
  );

  app.put(
    "/api/owner/redemptions/:redemptionId/status",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Check owner access
        const owner = await storage.getUser(req.user!.id);
        if (!owner?.isOwner) {
          return res.status(403).json({ error: "Owner access required" });
        }

        const { redemptionId } = req.params;
        const validatedData = updateRedemptionStatusSchema.parse(req.body);

        const updatedRedemption =
          await storage.updateRedemptionStatusWithTimestamp(
            redemptionId,
            validatedData.status,
          );
        if (!updatedRedemption) {
          return res.status(404).json({ error: "Redemption not found" });
        }
        res.json(updatedRedemption);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.issues });
        }
        res.status(500).json({ error: "Failed to update redemption status" });
      }
    },
  );

  // User transaction history endpoint
  app.get(
    "/api/user/transactions",
    authenticateToken,
    ensureUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const transactions = await storage.getUserPointHistory(req.user!.id);
        res.json(transactions);
      } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch transaction history" });
      }
    },
  );

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}


app.get("/api/db-health", async (_req, res) => {
  try {
    await db.select().from(users).limit(1);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});