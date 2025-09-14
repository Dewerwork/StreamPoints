import { actionRegistry } from "./index";
import { ChatMessageHandler } from "./chat-message";
import { SoundEffectHandler } from "./sound-effect";
import { ScreenEffectHandler } from "./screen-effect";
import { MusicControlHandler } from "./music-control";
import { CustomActionHandler } from "./custom-action";

// Initialize and register all action handlers
export function initializeActionHandlers() {
  console.log('🎮 Initializing reward action handlers...');
  
  // Register all built-in action handlers
  actionRegistry.register(new ChatMessageHandler());
  actionRegistry.register(new SoundEffectHandler());
  actionRegistry.register(new ScreenEffectHandler());
  actionRegistry.register(new MusicControlHandler());
  actionRegistry.register(new CustomActionHandler());

  const supportedTypes = actionRegistry.getSupportedTypes();
  console.log(`✅ Registered ${supportedTypes.length} action handlers:`, supportedTypes);
}

// Export the action registry for use in routes
export { actionRegistry, executeRewardAction, validateActionConfig } from "./index";