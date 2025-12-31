
import { MazeConfig } from "../types";

const ATMOSPHERES = [
  "Ancient whispers echo through these stone corridors, where light and shadow dance in an eternal struggle.",
  "Deep within the crystalline hollows, a path reveals itself only to those who possess true clarity of mind.",
  "The steampunk mechanisms hum with rhythmic precision, guarding the vault of forgotten blueprints.",
  "Neon veins pulse across the digital landscape, a complex sequence waiting to be decrypted.",
  "Scribed on brittle parchment centuries ago, this challenge was designed by the Grand Architect herself.",
  "In the quiet depths of the oceanic trench, pressure and mystery build within the coral labyrinth.",
  "A haunting mist clings to the jagged walls, obscuring the way forward and the way back.",
  "The cosmic geometry aligns for a brief moment, opening a gateway for the persistent traveler."
];

const RIDDLES = [
  "I have cities, but no houses. I have mountains, but no trees. What am I?",
  "The more of me there is, the less you see. What am I?",
  "I can be cracked, made, told, and played. What am I?",
  "I am full of holes but still hold water. What am I?",
  "The one who makes it, doesn't want it. The one who buys it, doesn't use it. What am I?"
];

/**
 * Procedurally generates a story or riddle locally to avoid API calls and quota issues.
 */
export const generateMazeStory = async (config: MazeConfig): Promise<string> => {
  // Use config to seed pseudo-randomness for consistent stories for same settings
  const seed = config.seed.length + config.size + config.generatorType.length;
  
  if (config.difficulty === 'hard') {
    return RIDDLES[seed % RIDDLES.length];
  }
  
  return ATMOSPHERES[seed % ATMOSPHERES.length];
};
