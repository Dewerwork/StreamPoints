import { type ActionHandler, type ActionResult } from "./index";
import { type User, type Reward, type Redemption } from "@shared/schema";

export class ChatMessageHandler implements ActionHandler {
  readonly actionType = 'chat_message';

  async execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult> {
    const config = reward.actionConfig as ChatMessageConfig;
    
    // Replace template variables
    let message = config.message || "Reward redeemed!";
    message = message.replace('{{username}}', user.displayName);
    message = message.replace('{{reward}}', reward.title);

    // In a real implementation, this would send the message to the chat system
    // For now, we'll log it and return success
    console.log(`[CHAT] ${message}`, {
      color: config.color,
      highlight: config.highlight,
      duration: config.duration,
      userId: user.id,
      redemptionId: redemption.id
    });

    // Simulate processing time
    if (config.duration) {
      setTimeout(() => {
        console.log(`[CHAT] Message duration expired for redemption ${redemption.id}`);
      }, config.duration);
    }

    return {
      success: true,
      message: `Chat message displayed: ${message}`,
      data: {
        chatMessage: message,
        color: config.color,
        highlight: config.highlight,
        duration: config.duration
      },
      shouldUpdateStatus: 'completed'
    };
  }

  validateConfig(config: any): boolean | string {
    if (!config || typeof config !== 'object') {
      return 'Chat message config must be an object';
    }

    const { message, color, highlight, duration } = config as Partial<ChatMessageConfig>;

    if (message && typeof message !== 'string') {
      return 'Message must be a string';
    }

    if (color && (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      return 'Color must be a valid hex color code';
    }

    if (highlight !== undefined && typeof highlight !== 'boolean') {
      return 'Highlight must be a boolean';
    }

    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      return 'Duration must be a positive number';
    }

    return true;
  }
}

interface ChatMessageConfig {
  message: string;
  color?: string;
  highlight?: boolean;
  duration?: number;
}