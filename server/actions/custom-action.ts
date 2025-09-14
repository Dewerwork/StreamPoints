import { type ActionHandler, type ActionResult } from "./index";
import { type User, type Reward, type Redemption } from "@shared/schema";

export class CustomActionHandler implements ActionHandler {
  readonly actionType = 'custom';

  async execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult> {
    const config = reward.actionConfig as CustomActionConfig;
    
    // Custom actions are designed to be highly flexible
    // They can execute arbitrary logic based on the configuration
    console.log(`[CUSTOM] Executing custom action: ${config.name || 'unnamed'}`, {
      config: config,
      userId: user.id,
      redemptionId: redemption.id,
      triggeredBy: user.displayName
    });

    try {
      let result = '';

      // Handle different custom action types
      switch (config.type) {
        case 'webhook':
          result = await this.executeWebhook(config, user, reward, redemption);
          break;
        case 'api_call':
          result = await this.executeApiCall(config, user, reward, redemption);
          break;
        case 'notification':
          result = await this.executeNotification(config, user, reward, redemption);
          break;
        case 'script':
          result = await this.executeScript(config, user, reward, redemption);
          break;
        default:
          result = `Executed custom action: ${config.name || config.type}`;
      }

      return {
        success: true,
        message: result,
        data: {
          customType: config.type,
          name: config.name,
          parameters: config.parameters
        },
        shouldUpdateStatus: config.autoComplete !== false ? 'completed' : 'processing'
      };
    } catch (error) {
      return {
        success: false,
        message: `Custom action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        shouldUpdateStatus: 'failed'
      };
    }
  }

  private async executeWebhook(config: CustomActionConfig, user: User, reward: Reward, redemption: Redemption): Promise<string> {
    const { url, method = 'POST', headers = {} } = config.parameters || {};
    
    if (!url) throw new Error('Webhook URL is required');

    // In a real implementation, this would make an HTTP request
    console.log(`[WEBHOOK] Would send ${method} request to ${url}`, {
      headers,
      payload: {
        user: { id: user.id, displayName: user.displayName, email: user.email },
        reward: { id: reward.id, title: reward.title, cost: reward.cost },
        redemption: { id: redemption.id, redeemedAt: redemption.redeemedAt }
      }
    });

    return `Webhook sent to ${url}`;
  }

  private async executeApiCall(config: CustomActionConfig, user: User, reward: Reward, redemption: Redemption): Promise<string> {
    const { endpoint, service } = config.parameters || {};
    
    console.log(`[API] Would call ${service || 'service'} API at ${endpoint}`, {
      user: user.id,
      reward: reward.id,
      redemption: redemption.id
    });

    return `API call made to ${service || 'external service'}`;
  }

  private async executeNotification(config: CustomActionConfig, user: User, reward: Reward, redemption: Redemption): Promise<string> {
    const { message, channels = ['desktop'] } = config.parameters || {};
    
    const notificationText = message || `${user.displayName} redeemed ${reward.title}`;
    
    console.log(`[NOTIFICATION] Sending notification to channels: ${channels.join(', ')}`, {
      message: notificationText,
      user: user.id,
      redemption: redemption.id
    });

    return `Notification sent: ${notificationText}`;
  }

  private async executeScript(config: CustomActionConfig, user: User, reward: Reward, redemption: Redemption): Promise<string> {
    const { scriptName, arguments: args = [] } = config.parameters || {};
    
    console.log(`[SCRIPT] Would execute script: ${scriptName}`, {
      arguments: args,
      user: user.id,
      reward: reward.id,
      redemption: redemption.id
    });

    return `Script executed: ${scriptName}`;
  }

  validateConfig(config: any): boolean | string {
    if (!config || typeof config !== 'object') {
      return 'Custom action config must be an object';
    }

    const { type, name, parameters, autoComplete } = config as Partial<CustomActionConfig>;

    if (!type || typeof type !== 'string') {
      return 'Custom action type is required and must be a string';
    }

    const validTypes = ['webhook', 'api_call', 'notification', 'script'];
    if (!validTypes.includes(type)) {
      return `Custom action type must be one of: ${validTypes.join(', ')}`;
    }

    if (name && typeof name !== 'string') {
      return 'Name must be a string';
    }

    if (autoComplete !== undefined && typeof autoComplete !== 'boolean') {
      return 'autoComplete must be a boolean';
    }

    // Type-specific validations
    if (type === 'webhook' && parameters) {
      const { url } = parameters;
      if (!url || typeof url !== 'string') {
        return 'Webhook URL is required and must be a string';
      }
    }

    return true;
  }
}

interface CustomActionConfig {
  type: string;
  name?: string;
  parameters?: any;
  autoComplete?: boolean;
}