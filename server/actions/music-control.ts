import { type ActionHandler, type ActionResult } from "./index";
import { type User, type Reward, type Redemption } from "@shared/schema";

export class MusicControlHandler implements ActionHandler {
  readonly actionType = 'music_control';

  async execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult> {
    const config = reward.actionConfig as MusicControlConfig;
    
    // In a real implementation, this would integrate with music streaming software
    // For now, we'll simulate the music control action
    console.log(`[MUSIC] Music control action: ${config.action}`, {
      requiresConfirmation: config.requiresConfirmation,
      userId: user.id,
      redemptionId: redemption.id,
      triggeredBy: user.displayName
    });

    let resultMessage = '';
    let shouldComplete = true;

    switch (config.action) {
      case 'skip':
        resultMessage = 'Skipped current song';
        break;
      case 'play':
        resultMessage = 'Started music playback';
        break;
      case 'pause':
        resultMessage = 'Paused music playback';
        break;
      case 'volume_up':
        resultMessage = 'Increased volume';
        break;
      case 'volume_down':
        resultMessage = 'Decreased volume';
        break;
      case 'request_song':
        resultMessage = 'Song request submitted for review';
        shouldComplete = false; // Requires manual approval
        break;
      default:
        resultMessage = `Executed music action: ${config.action}`;
    }

    if (config.requiresConfirmation && config.action !== 'request_song') {
      resultMessage += ' (pending confirmation)';
      shouldComplete = false;
    }

    return {
      success: true,
      message: resultMessage,
      data: {
        action: config.action,
        requiresConfirmation: config.requiresConfirmation,
        customData: config.customData
      },
      shouldUpdateStatus: shouldComplete ? 'completed' : 'processing'
    };
  }

  validateConfig(config: any): boolean | string {
    if (!config || typeof config !== 'object') {
      return 'Music control config must be an object';
    }

    const { action, requiresConfirmation, customData } = config as Partial<MusicControlConfig>;

    if (!action || typeof action !== 'string') {
      return 'Action is required and must be a string';
    }

    const validActions = ['skip', 'play', 'pause', 'volume_up', 'volume_down', 'request_song'];
    if (!validActions.includes(action)) {
      return `Action must be one of: ${validActions.join(', ')}`;
    }

    if (requiresConfirmation !== undefined && typeof requiresConfirmation !== 'boolean') {
      return 'requiresConfirmation must be a boolean';
    }

    return true;
  }
}

interface MusicControlConfig {
  action: string;
  requiresConfirmation?: boolean;
  customData?: any;
}