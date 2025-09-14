import { type ActionHandler, type ActionResult } from "./index";
import { type User, type Reward, type Redemption } from "@shared/schema";

export class SoundEffectHandler implements ActionHandler {
  readonly actionType = 'sound_effect';

  async execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult> {
    const config = reward.actionConfig as SoundEffectConfig;
    
    // In a real implementation, this would trigger a sound effect in the streaming software
    // For now, we'll log the sound effect trigger
    console.log(`[SOUND] Playing sound effect: ${config.soundUrl}`, {
      volume: config.volume || 1.0,
      userId: user.id,
      redemptionId: redemption.id,
      triggeredBy: user.displayName
    });

    // Simulate sound effect duration
    const duration = config.duration || 3000;
    setTimeout(() => {
      console.log(`[SOUND] Sound effect completed for redemption ${redemption.id}`);
    }, duration);

    return {
      success: true,
      message: `Sound effect triggered: ${config.soundUrl}`,
      data: {
        soundUrl: config.soundUrl,
        volume: config.volume,
        duration: duration
      },
      shouldUpdateStatus: 'completed'
    };
  }

  validateConfig(config: any): boolean | string {
    if (!config || typeof config !== 'object') {
      return 'Sound effect config must be an object';
    }

    const { soundUrl, volume, duration } = config as Partial<SoundEffectConfig>;

    if (!soundUrl || typeof soundUrl !== 'string') {
      return 'Sound URL is required and must be a string';
    }

    if (volume !== undefined && (typeof volume !== 'number' || volume < 0 || volume > 1)) {
      return 'Volume must be a number between 0 and 1';
    }

    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      return 'Duration must be a positive number';
    }

    return true;
  }
}

interface SoundEffectConfig {
  soundUrl: string;
  volume?: number;
  duration?: number;
}