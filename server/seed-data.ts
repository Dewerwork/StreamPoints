import { db } from "./db";
import { rewards } from "@shared/schema";
import { eq } from "drizzle-orm";

const sampleRewards = [
  {
    title: "Play Sound Effect",
    description: "Play a custom sound effect during stream",
    cost: 100,
    actionType: "sound_effect",
    actionConfig: {
      soundUrl: "/sounds/airhorn.mp3",
      volume: 0.7
    },
    isActive: true
  },
  {
    title: "Chat Message",
    description: "Display a special message in chat",
    cost: 50,
    actionType: "chat_message",
    actionConfig: {
      message: "{{username}} has redeemed a special message!",
      color: "#FFD700",
      highlight: true
    },
    isActive: true
  },
  {
    title: "Screen Effect",
    description: "Trigger a visual effect on screen",
    cost: 200,
    actionType: "screen_effect",
    actionConfig: {
      effect: "confetti",
      duration: 3000,
      intensity: "medium"
    },
    isActive: true
  },
  {
    title: "Skip Current Song",
    description: "Skip the currently playing song",
    cost: 300,
    actionType: "music_control",
    actionConfig: {
      action: "skip",
      requiresConfirmation: true
    },
    isActive: true
  },
  {
    title: "Change Stream Title",
    description: "Temporarily change the stream title",
    cost: 500,
    actionType: "stream_control",
    actionConfig: {
      action: "change_title",
      duration: 300000, // 5 minutes
      allowCustomText: true,
      maxLength: 100
    },
    isActive: true
  },
  {
    title: "Hydrate Reminder",
    description: "Send the streamer a hydration reminder",
    cost: 75,
    actionType: "chat_message",
    actionConfig: {
      message: "💧 {{username}} wants you to stay hydrated! Time for water! 💧",
      color: "#00BFFF",
      highlight: true,
      duration: 5000
    },
    isActive: true
  }
];

export async function seedDatabase() {
  console.log('🌱 Seeding database with sample rewards...');
  
  try {
    // Check if rewards already exist
    const existingRewards = await db.select().from(rewards).limit(1);
    
    if (existingRewards.length === 0) {
      // Insert sample rewards
      for (const reward of sampleRewards) {
        await db.insert(rewards).values(reward);
      }
      console.log(`✅ Inserted ${sampleRewards.length} sample rewards`);
    } else {
      console.log('ℹ️ Database already contains rewards, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export the seed function to be called from other modules