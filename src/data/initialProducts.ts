import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_cyber_neon_depth',
    title: 'NeonVeil 4K: Cinematic Cyberpunk Rain & Depth Motion Assets for AI Animators',
    slug: 'neonveil-4k-cyberpunk-rain-depth',
    tagline: 'Rock-solid 60FPS depth maps, ProRes 4444 rain alphas, and lighting passes engineered for Runway Gen-3, Kling & ComfyUI.',
    priceCents: 2900, // $29.00
    currency: 'USD',
    category: 'Motion Assets',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    fileKey: 'r2://vault-art/neonveil_4k_cyberpunk_pack_v2.zip',
    fileSizeMb: 1420,
    roughBullets: `Cyberpunk rain overlay, 4k 60fps, neon depth maps, works with runway gen 3 and comfyui controlnet, includes alpha prores and png sequence, lifetime commercial license.`,
    hookBullets: [
      '⚡ **Zero-Flicker Temporal Consistency**: Pre-computed 60fps depth and surface normal passes ensure rock-solid character lighting across aggressive camera pans without AI jitter.',
      '🚀 **Instant ComfyUI & Kling Workflow**: Drop into ControlNet or image-to-video pipelines to instantly lock realistic volumetric reflections onto moving subjects.',
      '💎 **Studio-Grade 4K ProRes 4444**: 16-bit unmultiplied alpha channels ready for zero-artefact compositing in After Effects, DaVinci Resolve, or Nuke.',
    ],
    techSpecs: [
      { label: 'Master Resolution', value: '3840 x 2160 (4K UHD) @ 60.00 FPS' },
      { label: 'File Codec & Format', value: 'Apple ProRes 4444 with Alpha + 16-bit PNG Sequences' },
      { label: 'Download Archive', value: '1.42 GB Secure Zip (Uncompressed 4.6 GB)' },
      { label: 'AI Tool Compatibility', value: 'Runway Gen-3 Alpha, Kling 1.5, Sora, ComfyUI, AnimateDiff, Luma Dream Machine' },
      { label: 'Color Space', value: 'ACEScg & Rec.709 Linear Gamma' },
      { label: 'Looping', value: '100% Seamless 10-second and 20-second loop cycles' },
    ],
    faqs: [
      {
        question: 'Can I use these assets in monetized YouTube films and paid client commercials?',
        answer: 'Yes! Your purchase includes a perpetual, royalty-free commercial license for unlimited client, theatrical, broadcast, and streaming projects without royalties or extra fees.',
      },
      {
        question: 'Is attribution or credit required when posting my AI animations?',
        answer: 'No attribution is required. You own 100% of the rendered video outputs produced using these motion assets.',
      },
      {
        question: 'How do I feed these depth maps into ComfyUI or Kling AI?',
        answer: 'Included inside the package is a bonus .json ComfyUI workflow graph and a 2-minute quickstart guide showing how to map the depth sequence to ControlNet (Depth/LineArt) nodes.',
      },
      {
        question: 'How does the secure 10-minute Cloudflare R2 download work?',
        answer: 'To prevent unauthorized file leakage and guarantee top-speed CDN bandwidth, our automated backend issues a cryptographically signed one-time download link valid for 10 minutes immediately upon payment confirmation.',
      },
    ],
    fullMarkdownCopy: `# NeonVeil 4K: Cinematic Cyberpunk Rain & Depth Motion Assets for AI Animators

> *Rock-solid 60FPS depth maps, ProRes 4444 rain alphas, and lighting passes engineered for Runway Gen-3, Kling & ComfyUI.*

---

### 🔥 Key Benefits for AI Animators & Creators
* **Zero-Flicker Temporal Consistency**: Pre-computed 60fps depth and surface normal passes ensure rock-solid character lighting across aggressive camera pans without AI jitter.
* **Instant ComfyUI & Kling Workflow**: Drop into ControlNet or image-to-video pipelines to instantly lock realistic volumetric reflections onto moving subjects.
* **Studio-Grade 4K ProRes 4444**: 16-bit unmultiplied alpha channels ready for zero-artefact compositing in After Effects, DaVinci Resolve, or Nuke.

---

### ⚙️ Technical Specifications & Checklist
- [x] **Master Resolution:** 3840 x 2160 (4K UHD) @ 60.00 FPS
- [x] **File Codec & Format:** Apple ProRes 4444 with Alpha + 16-bit PNG Sequences
- [x] **Download Archive:** 1.42 GB Secure Zip (Uncompressed 4.6 GB)
- [x] **AI Tool Compatibility:** Runway Gen-3 Alpha, Kling 1.5, Sora, ComfyUI, AnimateDiff, Luma Dream Machine
- [x] **Color Space:** ACEScg & Rec.709 Linear Gamma
- [x] **Looping:** 100% Seamless 10-second and 20-second loop cycles

---

### ❓ Frequently Asked Questions & License Terms

#### Q1: Can I use these assets in monetized YouTube films and paid client commercials?
**A:** Yes! Your purchase includes a perpetual, royalty-free commercial license for unlimited client, theatrical, broadcast, and streaming projects without royalties or extra fees.

#### Q2: Is attribution or credit required when posting my AI animations?
**A:** No attribution is required. You own 100% of the rendered video outputs produced using these motion assets.

#### Q3: How do I feed these depth maps into ComfyUI or Kling AI?
**A:** Included inside the package is a bonus .json ComfyUI workflow graph and a 2-minute quickstart guide showing how to map the depth sequence to ControlNet (Depth/LineArt) nodes.

#### Q4: How does the secure 10-minute Cloudflare R2 download work?
**A:** To prevent unauthorized file leakage and guarantee top-speed CDN bandwidth, our automated backend issues a cryptographically signed one-time download link valid for 10 minutes immediately upon payment confirmation.`,
    seoMeta: {
      metaTitle: 'NeonVeil 4K Cyberpunk Rain & Depth Maps for AI Animators | Digital Store',
      metaDescription: 'Download 4K 60fps ProRes 4444 cyberpunk rain & depth map passes for Runway Gen-3, Kling, and ComfyUI. Instant signed 10-min R2 vault download.',
      keywords: ['cyberpunk depth maps', 'AI animation assets', 'ComfyUI controlnet depth', 'Runway Gen-3 overlay', '4K alpha rain pack'],
    },
    compatibility: ['Runway Gen-3', 'Kling 1.5', 'OpenAI Sora', 'ComfyUI', 'AnimateDiff', 'Luma Dream Machine'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'active',
    featured: true,
  },
  {
    id: 'prod_anime_lora_rig',
    title: 'SakuraMotion XL: Anime Character Turnaround LoRA & Multi-Angle Keyframe Kit',
    slug: 'sakuramotion-xl-anime-turnaround-lora',
    tagline: 'High-precision SDXL / Flux LoRA weights with 120+ angle keyframes for flawless character consistency in AI anime films.',
    priceCents: 3900, // $39.00
    currency: 'USD',
    category: 'LoRA Models',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    fileKey: 'r2://vault-art/sakuramotion_xl_lora_bundle_v1.safetensors.zip',
    fileSizeMb: 890,
    roughBullets: `Anime character turnaround lora, SDXL and Flux trained, 360 degree rotation angles, no face deformation, includes comfyui prompt templates and pose reference sheets.`,
    hookBullets: [
      '🎯 **100% Identity Preservation Across 360° Rotations**: Maintain exact facial structure, costume detail, and hair physics across high-speed dynamic anime action cuts.',
      '⚡ **Native SDXL & Flux.1-D Weights**: Includes both .safetensors files with tailored trigger keywords for extreme prompt responsiveness at weight 0.8 - 1.0.',
      '📁 **120+ Pre-Rendered Pose Rig Sheets**: Instant OpenPose and DWPose keyframes to guide AnimateDiff and Kling AI camera sweeps effortlessly.',
    ],
    techSpecs: [
      { label: 'Base Models', value: 'SDXL 1.0 & Flux.1-Dev' },
      { label: 'Weight Format', value: '.safetensors (FP16 & BF16)' },
      { label: 'Trigger Words Included', value: '`sakura_turnaround, 360_view, anime_action_rig`' },
      { label: 'Pose Guides', value: '120 OpenPose & Lineart Keyframes (PNG 2048x2048)' },
      { label: 'Compatibility', value: 'ComfyUI, WebUI Forge, AnimateDiff v3, Kling 1.5, Midjourney Pan' },
      { label: 'Training Dataset', value: '4,500 High-Res Hand-Cleaned Anime Animation Cells' },
    ],
    faqs: [
      {
        question: 'Can I train additional LoRAs on top of this model?',
        answer: 'Yes! You can merge or stack this LoRA with your own custom character LoRAs in ComfyUI at 0.6 - 0.8 weight without loss of style.',
      },
      {
        question: 'Is this compatible with Flux.1 Schnell and Dev?',
        answer: 'Yes, both dedicated SDXL and Flux.1 Dev/Schnell quantized checkpoints are included in the download archive.',
      },
      {
        question: 'Does this come with commercial usage rights?',
        answer: 'Yes, you have full commercial rights to generate and sell video animations, comic panels, game sprites, and client renders.',
      },
    ],
    fullMarkdownCopy: `# SakuraMotion XL: Anime Character Turnaround LoRA & Multi-Angle Keyframe Kit

> *High-precision SDXL / Flux LoRA weights with 120+ angle keyframes for flawless character consistency in AI anime films.*

---

### 🔥 Key Benefits for AI Animators
* **100% Identity Preservation Across 360° Rotations**: Maintain exact facial structure, costume detail, and hair physics across high-speed dynamic anime action cuts.
* **Native SDXL & Flux.1-D Weights**: Includes both .safetensors files with tailored trigger keywords for extreme prompt responsiveness at weight 0.8 - 1.0.
* **120+ Pre-Rendered Pose Rig Sheets**: Instant OpenPose and DWPose keyframes to guide AnimateDiff and Kling AI camera sweeps effortlessly.

---

### ⚙️ Technical Specifications & Checklist
- [x] **Base Models:** SDXL 1.0 & Flux.1-Dev
- [x] **Weight Format:** .safetensors (FP16 & BF16)
- [x] **Trigger Words Included:** \`sakura_turnaround, 360_view, anime_action_rig\`
- [x] **Pose Guides:** 120 OpenPose & Lineart Keyframes (PNG 2048x2048)
- [x] **Compatibility:** ComfyUI, WebUI Forge, AnimateDiff v3, Kling 1.5, Midjourney Pan
- [x] **Training Dataset:** 4,500 High-Res Hand-Cleaned Anime Animation Cells

---

### ❓ Licensing & FAQ
* **Commercial Rights:** Unlimited commercial rendering rights included.
* **Cloudflare R2 Signed Download:** 10-minute temporary signed link generated instantly upon checkout.`,
    seoMeta: {
      metaTitle: 'SakuraMotion XL - Anime Character Turnaround LoRA for AI Animators',
      metaDescription: 'Keep anime character consistency across 360 angles in SDXL, Flux, and ComfyUI with the SakuraMotion XL turnaround LoRA kit.',
      keywords: ['anime character LoRA', 'AI turnaround sheets', 'Flux LoRA anime', 'SDXL anime consistency', 'AnimateDiff character rig'],
    },
    compatibility: ['ComfyUI', 'Flux.1-Dev', 'SDXL 1.0', 'AnimateDiff', 'Kling AI'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active',
    featured: true,
  },
  {
    id: 'prod_fluid_plasma_alpha',
    title: 'HyperPlasma 4K: Stylized Fluid & Explosion VFX Alpha Passes (60 FPS)',
    slug: 'hyperplasma-4k-fluid-explosion-alpha-vfx',
    tagline: 'Over 80 uncompressed 4K alpha VFX motion loops designed for AI video compositing and motion-to-video prompts.',
    priceCents: 3400, // $34.00
    currency: 'USD',
    category: 'Alpha VFX Passes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    fileKey: 'r2://vault-art/hyperplasma_4k_vfx_master.zip',
    fileSizeMb: 2150,
    roughBullets: `Fluid and plasma explosion vfx, 4k 60fps, pre-keyed transparent background, 80+ clips, works as init video for Runway Gen-3 and Sora, commercial use.`,
    hookBullets: [
      '💥 **Instant Hollywood-Grade Impact Frames**: 80+ high-energy plasma blasts, organic fluid splatters, and shockwaves pre-matted with clean alpha edges.',
      '🎬 **Perfect Init Video / Motion Latent Seeds**: Feed directly into Runway Gen-3 Video-to-Video to guide chaotic magic bursts with zero temporal warping.',
      '⚡ **Drag-and-Drop Blend Modes**: Optimized for Add, Screen, and Overlay blending with zero color fringing or dark matte halos.',
    ],
    techSpecs: [
      { label: 'Clip Count', value: '84 Unique Motion VFX Loops' },
      { label: 'Resolution', value: '3840 x 2160 (4K UHD)' },
      { label: 'Framerate', value: '60.00 FPS Smooth Motion' },
      { label: 'Formats', value: 'QuickTime ProRes 4444 + HEVC with Alpha' },
      { label: 'Total Download', value: '2.15 GB Zip via R2 Signed URL' },
      { label: 'Compatible NLEs', value: 'Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, ComfyUI Video Helper' },
    ],
    faqs: [
      {
        question: 'Are these VFX clips pre-rendered or real-time shaders?',
        answer: 'They are pre-rendered, high-fidelity 60 FPS simulations with true 16-bit unmultiplied alpha channels for instant drag-and-drop workflow.',
      },
      {
        question: 'Can I use these as motion input seeds for Runway Gen-3 and Kling?',
        answer: 'Yes! This is one of the most popular use cases. Using our high-contrast plasma loops as motion guides produces crisp, dynamic magical transformations.',
      },
    ],
    fullMarkdownCopy: `# HyperPlasma 4K: Stylized Fluid & Explosion VFX Alpha Passes (60 FPS)

> *Over 80 uncompressed 4K alpha VFX motion loops designed for AI video compositing and motion-to-video prompts.*

---

### 🔥 Key Benefits for AI Animators
* **Instant Hollywood-Grade Impact Frames**: 80+ high-energy plasma blasts, organic fluid splatters, and shockwaves pre-matted with clean alpha edges.
* **Perfect Init Video / Motion Latent Seeds**: Feed directly into Runway Gen-3 Video-to-Video to guide chaotic magic bursts with zero temporal warping.
* **Drag-and-Drop Blend Modes**: Optimized for Add, Screen, and Overlay blending with zero color fringing or dark matte halos.

---

### ⚙️ Technical Specifications & Checklist
- [x] **Clip Count:** 84 Unique Motion VFX Loops
- [x] **Resolution:** 3840 x 2160 (4K UHD)
- [x] **Framerate:** 60.00 FPS Smooth Motion
- [x] **Formats:** QuickTime ProRes 4444 + HEVC with Alpha
- [x] **Total Download:** 2.15 GB Zip via R2 Signed URL
- [x] **Compatible NLEs:** Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, ComfyUI Video Helper`,
    seoMeta: {
      metaTitle: 'HyperPlasma 4K - VFX Alpha Passes & Fluid Loops for AI Creators',
      metaDescription: 'Download 84+ 4K 60FPS fluid & explosion alpha VFX loops. Perfect init seeds for Runway Gen-3 and AI video compositing.',
      keywords: ['AI VFX alpha loops', 'Runway video init seed', '4K explosion alpha', 'ComfyUI VFX assets', 'ProRes 4444 VFX pack'],
    },
    compatibility: ['Runway Gen-3', 'Kling 1.5', 'ComfyUI', 'DaVinci Resolve', 'After Effects'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'active',
    featured: false,
  },
  {
    id: 'prod_director_camera_sora',
    title: 'DirectorMotion: 50+ Cinematography Camera Vectors for Sora, Kling & Gen-3',
    slug: 'directormotion-camera-vectors-ai-cinematography',
    tagline: 'Curated prompt mathematics and trajectory vectors for Dolly-Zoom, FPV Drone, Dutch Tilt, and 360 Arc shots with zero hallucination.',
    priceCents: 2400, // $24.00
    currency: 'USD',
    category: 'Prompt & ComfyUI Workflows',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
    fileKey: 'r2://vault-art/directormotion_cinema_vectors_v3.zip',
    fileSizeMb: 320,
    roughBullets: `Camera movement prompt library, 50+ cinematic moves, includes comfyui camera node workflows, dolly zoom, vertigo effect, orbital arc, works for Sora Kling and Gen3.`,
    hookBullets: [
      '🎥 **Master Complex Camera Choreography**: Effortlessly evoke cinematic Vertigo Dolly Zooms, Hyperlapse whip pans, and continuous one-shot tracking cuts.',
      '⚡ **Engineered Prompt Syntax Formulas**: Tested against 10,000+ AI generations to eliminate camera jitter and unexpected object morphing.',
      '📦 **Includes Native ComfyUI Camera Path Nodes**: Import JSON presets directly into your AnimateDiff and IP-Adapter nodes for pinpoint trajectory control.',
    ],
    techSpecs: [
      { label: 'Preset Count', value: '52 Camera Vectors & Prompt Blueprints' },
      { label: 'Format', value: 'JSON Workflow + Markdown Prompt Bible + Video Guides (1080p)' },
      { label: 'AI Model Coverage', value: 'OpenAI Sora, Kling 1.5, Runway Gen-3 Alpha, Luma Ray 2, Minimax' },
      { label: 'License Type', value: 'Commercial Unlimited / Lifetime Access' },
      { label: 'Download Size', value: '320 MB via Encrypted R2 Link' },
    ],
    faqs: [
      {
        question: 'Does this work with future AI video models?',
        answer: 'Yes! The mathematical camera vectors and prompt structures are model-agnostic and we provide lifetime free updates when new foundation models release.',
      },
    ],
    fullMarkdownCopy: `# DirectorMotion: 50+ Cinematography Camera Vectors for Sora, Kling & Gen-3

> *Curated prompt mathematics and trajectory vectors for Dolly-Zoom, FPV Drone, Dutch Tilt, and 360 Arc shots with zero hallucination.*

---

### 🔥 Key Benefits for AI Animators
* **Master Complex Camera Choreography**: Effortlessly evoke cinematic Vertigo Dolly Zooms, Hyperlapse whip pans, and continuous one-shot tracking cuts.
* **Engineered Prompt Syntax Formulas**: Tested against 10,000+ AI generations to eliminate camera jitter and unexpected object morphing.
* **Includes Native ComfyUI Camera Path Nodes**: Import JSON presets directly into your AnimateDiff and IP-Adapter nodes for pinpoint trajectory control.

---

### ⚙️ Technical Specifications
- [x] **Preset Count:** 52 Camera Vectors & Prompt Blueprints
- [x] **Format:** JSON Workflow + Markdown Prompt Bible + Video Guides (1080p)
- [x] **AI Model Coverage:** OpenAI Sora, Kling 1.5, Runway Gen-3 Alpha, Luma Ray 2, Minimax
- [x] **License Type:** Commercial Unlimited / Lifetime Access
- [x] **Download Size:** 320 MB via Encrypted R2 Link`,
    seoMeta: {
      metaTitle: 'DirectorMotion - Camera Movement Prompts & Workflows for AI Video',
      metaDescription: 'Master cinematic camera moves in Sora, Kling, and Runway Gen-3 with 50+ verified camera vector blueprints.',
      keywords: ['AI camera movements', 'Runway Gen-3 camera prompts', 'Sora camera vectors', 'ComfyUI camera node', 'cinematic AI video prompts'],
    },
    compatibility: ['OpenAI Sora', 'Runway Gen-3', 'Kling 1.5', 'ComfyUI', 'Luma Dream Machine'],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'active',
    featured: false,
  },
];
