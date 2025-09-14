import { type User, type Reward, type Redemption } from "@shared/schema";

// Base interface for all action handlers
export interface ActionHandler {
  readonly actionType: string;
  
  /**
   * Execute the reward action
   * @param user - The user who redeemed the reward
   * @param reward - The reward being redeemed
   * @param redemption - The redemption record
   * @returns Promise with execution result
   */
  execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult>;
  
  /**
   * Validate the action configuration
   * @param config - The action configuration from the reward
   * @returns true if valid, string with error message if invalid
   */
  validateConfig(config: any): boolean | string;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
  shouldUpdateStatus?: 'completed' | 'failed' | 'processing';
}

// Registry to hold all action handlers
class ActionRegistry {
  private handlers = new Map<string, ActionHandler>();

  register(handler: ActionHandler) {
    this.handlers.set(handler.actionType, handler);
  }

  get(actionType: string): ActionHandler | undefined {
    return this.handlers.get(actionType);
  }

  getAll(): ActionHandler[] {
    return Array.from(this.handlers.values());
  }

  getSupportedTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const actionRegistry = new ActionRegistry();

// Helper function to execute actions
export async function executeRewardAction(
  user: User, 
  reward: Reward, 
  redemption: Redemption
): Promise<ActionResult> {
  const handler = actionRegistry.get(reward.actionType);
  
  if (!handler) {
    return {
      success: false,
      message: `Unknown action type: ${reward.actionType}`,
      shouldUpdateStatus: 'failed'
    };
  }

  try {
    const result = await handler.execute(user, reward, redemption);
    return result;
  } catch (error) {
    console.error(`Action execution error for ${reward.actionType}:`, error);
    return {
      success: false,
      message: `Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      shouldUpdateStatus: 'failed'
    };
  }
}

// Helper function to validate action configurations
export function validateActionConfig(actionType: string, config: any): boolean | string {
  const handler = actionRegistry.get(actionType);
  
  if (!handler) {
    return `Unknown action type: ${actionType}`;
  }

  return handler.validateConfig(config);
}