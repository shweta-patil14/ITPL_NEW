# Flow AI Video Generation Guide — Infoyashonand Technology PVT. LTD.

This document contains the prompt, settings, storyboard, and implementation code to generate a 10-second cinematic video for the website's Hero section using **Flow AI** (or Google Veo / Runway Gen-3 / Sora / Kling / Luma Dream Machine).

> **Update:** The prompt below ensures the **official company logo stays prominently in the center for the entire 10 seconds from the start**, while the company's IT services dynamically fan out and showcase around it.

---

## 1. Primary Flow AI Prompt (Image-to-Video Mode)

> **Upload the official company logo (`company-logo.jpg`) as an image reference in Flow AI and paste this prompt:**

```text
Cinematic 10-second commercial opener for enterprise IT software company "Infoyashonand Technology".

[CRITICAL REQUIREMENT: The official circular Infoyashonand Technology logo from the uploaded reference image is prominently centered in the frame right from 00:00 and remains locked in the center for the entire 10 seconds with subtle 3D metallic bevel, gentle hovering float, and crisp, perfectly clear text].

[0-3s] Opens immediately focused on the centered official Infoyashonand Technology logo in a dark luxury cyber-tech studio with deep navy sapphire blue lighting. Radiant golden and cyan data circuit rings pulse outward from behind the centered logo. The first service appears floating beside the logo: a sleek holographic glass card displaying "Custom Software & Enterprise ERP" with live code syntax and 3D architectural nodes.

[3-7s] The company logo stays firmly anchored in the center with a gentle breathing pulse. Translucent holographic displays smoothly fan out and rotate around the logo showcasing core services: "Modern Web & Android Mobile Apps" with glowing smartphone UI wireframes and banking dashboards, followed by "Official WhatsApp Business API" with green neon messaging nodes and automated workflows.

[7-10s] The central logo continues hovering proudly in the middle as glowing volumetric light beams sweep across its beveled surface. Surrounding service cards for "Digital Marketing & SEO" and "IT Training & Placement Academy" lock into an interconnected hexagonal ecosystem around the centered logo. Subtle amber rim-lighting, floating particles of light, photorealistic reflections, 4k resolution, Unreal Engine 5 render, zero camera shake, perfectly steady central logo throughout.
```

---

## 2. Negative Prompt (To Prevent Distortions & Ensure Logo Stays Centered)

> **Paste this into Flow AI's Negative Prompt field:**

```text
logo disappearing, logo moving off-center, distorted text, warped emblem, low resolution, blurry graphics, cartoonish, 3D clay, grainy noise, pixelated, chaotic camera spin, rapid flickering, jittery movement.
```

---

## 3. Second-by-Second Storyboard Breakdown

| Timestamp | Central Element (Persistent) | Dynamic Services Showcased Around Logo | Lighting & Atmosphere |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:03** | **Official Infoyashonand Logo** centered with 3D bevel and soft glow from the first frame. | Holographic card expands: **"Custom Software & Enterprise ERP"** with glowing circuit lines. | Deep Midnight Sapphire (`#0B132B`) with soft cyan energy rings. |
| **00:03 – 00:06** | **Logo remains locked in center** with gentle hovering float and light sheen. | Two dynamic holographic displays orbit into view: **"Web & Android App Development"** and **"Official WhatsApp Business API"**. | Translucent glass cards, volumetric light rays, and glowing UI nodes. |
| **00:06 – 00:08** | **Logo remains in center**, front and forward. | Additional service cards appear: **"Digital Marketing & SEO"** and **"IT Training & Placement Academy"**. | Golden and sapphire ambient illumination reflecting off metallic logo edge. |
| **00:08 – 00:10** | **Logo centered in crisp focus** with an elegant anamorphic lens flare sweep. | All core IT services form a synchronized ecosystem revolving around the central brand emblem. | Ultra-clean, loop-ready final frame for website hero background. |

---

## 4. Recommended Generation Settings

| Parameter | Recommended Value | Purpose |
| :--- | :--- | :--- |
| **Aspect Ratio** | `16:9` (1920×1080 or 4K) | Standard wide layout for website hero sections. |
| **Duration** | `10 Seconds` | Optimal length for web looping without heavy bandwidth load. |
| **Motion Strength** | `3` or `4` (Low-Medium) | Keeps the central logo rock-solid while animating the surrounding service cards. |
| **Framerate** | `30fps` or `60fps` | Silky-smooth playback in web browsers. |
| **Image Fidelity / Weight** | High (`0.85` – `1.0`) | Keeps the official circular logo shape, colors, and typography exact. |

---

## 5. How to Embed the Generated Video in the Website Hero

Once Flow AI finishes rendering and you download `hero-video.mp4`:

1. Copy the downloaded video file to:
   ```
   c:\ITPL New\public\hero-video.mp4
   ```

2. In `src/components/HeroSection.tsx`, add the video background element:
   ```tsx
   {/* Background Video Player */}
   <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
     <video
       autoPlay
       loop
       muted
       playsInline
       className="w-full h-full object-cover opacity-25"
     >
       <source src="/hero-video.mp4" type="video/mp4" />
     </video>
     <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white"></div>
   </div>
   ```

---
*Created for Infoyashonand Technology PVT. LTD. — Vishrambag, Sangli.*
