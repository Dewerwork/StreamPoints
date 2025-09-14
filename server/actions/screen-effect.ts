import { type ActionHandler, type ActionResult } from "./index";
import { type User, type Reward, type Redemption } from "@shared/schema";

export class ScreenEffectHandler implements ActionHandler {
  readonly actionType = 'screen_effect';

  async execute(user: User, reward: Reward, redemption: Redemption): Promise<ActionResult> {
    const config = reward.actionConfig as ScreenEffectConfig;
    
    // In a real implementation, this would trigger visual effects in the streaming software or browser
    // For now, we'll log the screen effect trigger
    console.log(`[SCREEN] Triggering screen effect: ${config.effect}`, {
      duration: config.duration || 3000,
      intensity: config.intensity || 'medium',
      color: config.color,
      userId: user.id,
      redemptionId: redemption.id,
      triggeredBy: user.displayName
    });

    // Simulate effect duration
    const duration = config.duration || 3000;
    setTimeout(() => {
      console.log(`[SCREEN] Screen effect completed for redemption ${redemption.id}`);
    }, duration);

    return {
      success: true,
      message: `Screen effect triggered: ${config.effect}`,
      data: {
        effect: config.effect,
        duration: duration,
        intensity: config.intensity,
        color: config.color
      },
      shouldUpdateStatus: 'completed'
    };
  }

  validateConfig(config: any): boolean | string {
    if (!config || typeof config !== 'object') {
      return 'Screen effect config must be an object';
    }

    const { effect, duration, intensity, color } = config as Partial<ScreenEffectConfig>;

    if (!effect || typeof effect !== 'string') {
      return 'Effect type is required and must be a string';
    }

    const validEffects = ['confetti', 'fireworks', 'rain', 'snow', 'hearts', 'stars', 'explosion'];
    if (!validEffects.includes(effect)) {
      return `Effect must be one of: ${validEffects.join(', ')}`;
    }

    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      return 'Duration must be a positive number';
    }

    if (intensity !== undefined) {
      const validIntensities = ['low', 'medium', 'high', 'extreme'];
      if (!validIntensities.includes(intensity)) {
        return `Intensity must be one of: ${validIntensities.join(', ')}`;
      }
    }

    if (color && (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      return 'Color must be a valid hex color code';
    }

    return true;
  }
}

interface ScreenEffectConfig {
  effect: string;
  duration?: number;
  intensity?: string;
  color?: string;
}