import { Clapperboard, Image as ImageIcon, Layers, UserRound } from "lucide-react";
import { BatchStudio, type StudioConfig } from "../components/BatchStudio";

const VIDEO_CONFIG: StudioConfig = {
  kind: "video",
  title: "Video Generation",
  subtitle: "Text to video pipeline · unlimited prompts · long videos with auto-merge",
  tabs: [
    { id: "t2v", label: "Text-to-Video", icon: Clapperboard, hint: "Write one prompt per scene, or paste a full script — every scene becomes a clip." },
    { id: "i2v", label: "Image-to-Video", icon: ImageIcon, needsImage: 1, hint: "Upload a still and describe the motion. The image becomes your first frame." },
    { id: "ingredients", label: "Ingredients", icon: Layers, needsImage: 3, hint: "Combine up to 3 reference images (subject, place, object) into one video." },
    { id: "characters", label: "Characters", icon: UserRound, hint: "Pick characters below — they stay consistent across every clip." },
  ],
  models: ["Omni Flash", "Omni Pro", "Omni Cinema (long-form)", "Veo-style Quality"],
  resolutions: [
    { id: "720", label: "720p", sub: "Fast", multiplier: 0.75 },
    { id: "1080", label: "1080p", sub: "Full HD", multiplier: 1 },
    { id: "4k", label: "4K", sub: "Upscaled", multiplier: 2 },
  ],
  ratios: ["16:9 (Landscape)", "9:16 (Portrait)", "1:1 (Square)", "4:5 (Feed)", "21:9 (Cinema)"],
  defaultFolder: "C:\\Users\\Hridoy\\Downloads\\flowgen",
  presetStyles: [
    "Cinematic", "Realistic", "Anime", "3D Pixar", "Ghibli", "Cartoon", "Claymation", "Watercolor",
    "Oil painting", "Cyberpunk", "Neon noir", "Documentary", "Vintage VHS", "Black & white",
    "Fantasy", "Horror", "Drone aerial", "Slow motion", "Stop motion", "Comic book", "Low poly",
    "Islamic art", "Bengali folk art", "Minimalist", "Product ad", "Music video",
  ],
  placeholder:
    "Enter your video prompts here…\n\nA misty Bangladeshi village at sunrise, a boy runs along the river bank.\n\nClose-up of his face as he spots a paper boat drifting by.\n\n— or paste a whole script; Auto-split turns every sentence into a scene.",
  baseCost: 20,
};

export function VideoGeneration() {
  return <BatchStudio config={VIDEO_CONFIG} />;
}
