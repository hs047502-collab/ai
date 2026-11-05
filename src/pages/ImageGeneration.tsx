import { Image as ImageIcon, Link2, RefreshCw, UserRound, Zap } from "lucide-react";
import { BatchStudio, type StudioConfig } from "../components/BatchStudio";

const IMAGE_CONFIG: StudioConfig = {
  kind: "image",
  title: "Image Generation",
  subtitle: "Create stills from text prompts · unlimited batch · custom styles",
  tabs: [
    { id: "t2i", label: "Text to Image", icon: ImageIcon, hint: "One prompt per image block. Separate prompts with a blank line." },
    { id: "i2i", label: "Image to Image", icon: RefreshCw, needsImage: 1, hint: "Upload an image and describe how to transform it." },
    { id: "chain", label: "Chain", icon: Link2, hint: "Each result feeds the next prompt — perfect for storyboards and comics." },
    { id: "fast", label: "Fast Chain", icon: Zap, hint: "A quicker chain mode with lighter detail for rapid ideation." },
    { id: "character", label: "Character", icon: UserRound, hint: "Generate consistent character sheets using your saved cast." },
  ],
  models: ["Nano Banana", "Nano Banana Pro", "Imagen-style HD", "Flux-style Art"],
  resolutions: [
    { id: "1k", label: "1K", sub: "Original size", multiplier: 1 },
    { id: "2k", label: "2K", sub: "Upscaled", multiplier: 1.5 },
    { id: "4k", label: "4K", sub: "Upscaled", multiplier: 2 },
  ],
  ratios: ["16:9 (Landscape)", "9:16 (Portrait)", "1:1 (Square)", "4:5 (Portrait)", "3:2 (Photo)"],
  defaultFolder: "C:\\Users\\Hridoy\\Downloads\\FlowGen images",
  presetStyles: [
    "Photoreal", "3D render", "Anime", "Ghibli", "Pixar", "Editorial", "Watercolour", "Oil painting",
    "Pencil sketch", "Neon pop", "Cyberpunk", "Fantasy art", "Vector flat", "Logo", "Poster",
    "Thumbnail", "Comic", "Pixel art", "Isometric", "Calligraphy", "Bengali alpona", "Product shot",
  ],
  placeholder:
    "Enter your image prompts here…\n\nA glass fox made of violet crystal, glowing from within.\n\nA rainy Dhaka street at night, neon reflections, cinematic.",
  baseCost: 20,
};

export function ImageGeneration() {
  return <BatchStudio config={IMAGE_CONFIG} />;
}
