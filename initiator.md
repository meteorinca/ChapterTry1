Below is a detailed creative guide for the team building the **4‑week mission experience**.  
I’ve written it as a design brief for writers and web developers, with clear goals, tone, and technical guardrails.

---

# Mission Control: Web App & Video Series – Creative Brief

## The Big Idea

We are not selling a robot. We are selling **a story where the student becomes the robot’s creator**.

Every mission is a chapter in that story. The web app is the student’s **Mission Control** – a beautiful, animated dashboard that tracks progress, holds interactive tools, and makes every action feel like a discovery. Videos are **short, cinematic, and narrated by the NASA engineer** (me), acting as a guide, not a lecturer.

**Golden rule:** No abstract theory. Every concept is introduced **through doing** – you change something, you see the robot change immediately.

---

## Intro Chapter – “First Contact” (Web App Only, no video)

**Goal:**  
Get the robot out of the box, connected, and performing its first transformation in under 10 minutes. This chapter lives entirely inside the web app to reduce friction.

**Web App Experience (describe to devs):**

- **Loading screen:** An animated 3D model of the robot (the same model used in marketing) slowly assembles itself, then waves. No login – just “Start Mission.”
- **Welcome screen:** “Your robot is ready. Let’s wake it up.”
- **Connection wizard:** Simple animated guide to plug in USB and press the button. Use Web Serial API (if possible) or fallback to a simple file‑copy method. Show a live animation of a cable connecting to the robot.
- **Test animation:** The robot waves on command. The student clicks a big “Wave” button and the physical robot waves. Instant success.
- **First customisation:** An OLED face picker. 5 pre‑made faces (happy, curious, sleepy, etc.). Click one, and it appears on the robot’s screen. “You just changed how it looks. Mission 1 is ready for you.”

**Why this works:**  
The student hasn’t “done” anything technical – they clicked a button and the robot obeyed. That’s the hook.

**No video** – the web app is the teacher for this chapter. Videos start with Mission 1.

---

## Mission 1 – “Change How It Looks”

**Core concept:**  
The robot’s face is its identity. Now the student makes it their own.

### Web App Features
- **OLED Canvas:** A simple pixel editor (8×8 or whatever the screen resolution). Students can draw their own face, or choose from a gallery of eyes, mouths, etc.
- **Upload image:** Convert any small image to robot‑friendly format.
- **Animation builder:** Combine 2–3 frames into a blink or idle animation.
- **Preview:** See the face on a simulated OLED before sending.
- **Send to robot:** One‑click deployment.

### Video Script (≈3 minutes)

**[0:00]**  
*Camera shows the robot sitting on a desk, OLED blank. The NASA engineer (me) sits next to it, holding a laptop.*

**Me:** “When you first turned it on, your robot had a face – but it was *my* face for it. Mission 1 is about giving it *your* face.”

**[0:30]**  
*Screen recording of the web app’s pixel editor.*  
**Me:** “You can draw anything – a smile, a wink, your initials. Or upload a picture. This is where you start to see the robot as an extension of your imagination.”

**[1:15]**  
*Cut to me drawing a goofy face, then clicking “Send.” The robot’s OLED lights up with the new face. I react with genuine delight.*

**Me:** “Boom. It’s alive with your design.”

**[1:45]**  
*Fast montage of three different students (actors) holding their robots with different custom faces, each laughing.*

**[2:15]**  
**Me:** “Next mission, we give it a voice. But first – go make your robot’s face. Spend as long as you want. I’ll be right here when you’re ready.”

**[End]**

**Tone:** Enthusiastic, personal, showing the “magic moment.” No mention of pixels, resolution, or file formats. Just “draw, send, see.”

---

## Mission 2 – “Change How It Sounds”

**Core concept:**  
Sound gives personality. The robot can now speak or make noise on command.

### Web App Features
- **Sound library:** Pre‑loaded beeps, chirps, and a few phrases recorded by me (the NASA engineer).
- **Upload audio:** Students can upload their own MP3/WAV (with size limit). Web app converts to robot‑compatible format.
- **Record voice:** Built‑in mic recording to create custom sound bites.
- **Assign trigger:** For now, just a “play” button and the ability to set the robot’s startup sound.

### Video Script (≈3:30)

**[0:00]**  
*Robot sitting silently. Me tapping the table.*

**Me:** “It’s weird when a robot doesn’t make any sound, right? Mission 2 fixes that.”

**[0:20]**  
*Screen recording: I click “Record” in the web app, say “Hello, Earthling!” and click “Send.” Robot plays it back.*

**Me:** “Now it has my voice. But it’s your robot – so you get to choose the voice.”

**[1:00]**  
*Show three options: uploading a sound file, recording your own voice, or using the built‑in sound effects.*

**[1:45]**  
*Cut to me placing the robot near a window, playing a bird chirp sound through it.*

**Me:** “Some people make their robot a sidekick. Others turn it into a tiny DJ. There’s no wrong answer.”

**[2:30]**  
*Fast cuts: robot playing a student’s laugh, robot saying “Let’s go!”, robot making sci‑fi blaster sounds.*

**[3:00]**  
**Me:** “Once you’ve given it a voice, Mission 3 is about how it moves – the robot’s body language. Go make some noise.”

**[End]**

---

## Mission 3 – “Change How It Moves”

**Core concept:**  
Movement is emotion. The robot’s wave is just the start – now students choreograph its body.

### Web App Features
- **Motion Simulator:** A simple 3D representation of the robot with sliders for each servo (or a timeline for sequences). Students drag to pose the robot.
- **Pre‑set gestures:** Wave, nod, excited bounce, sad slump, etc.
- **Sequence builder:** Chain 2–3 poses into a mini‑routine (e.g., wave + nod + bounce).
- **Save & Send:** One click to upload the new gesture to the robot.

### Video Script (≈4 minutes)

**[0:00]**  
*Robot standing still. I approach it like a dog you’re trying to get to play.*

**Me:** “Right now your robot only knows one move – the wave. But it has four legs. It can do so much more.”

**[0:30]**  
*Screen recording: I drag a slider and the simulated robot in the app raises one leg.*

**Me:** “Every joint is under your control. You can make it strike a pose, wobble, or even dance.”

**[1:15]**  
*I create a simple two‑step dance: raise left legs, raise right legs, repeat. I send it to the robot. The physical robot does the dance.*

**Me:** “See? You just programmed a behavior without writing a single line of code.”

**[2:00]**  
*Montage: robot doing a “thinking” pose (legs tucked, head tilt), robot doing an excited bounce, robot “sneaking” (slow creeping legs).*

**[2:45]**  
*I introduce the “mood presets” – happy, curious, tired – each with a unique movement signature.*

**[3:30]**  
**Me:** “Mission 3 is about finding the robot’s body language. Once it moves the way you want, the final mission makes it *react* to you.”

**[End]**

---

## Mission 4 – “Change How It Responds”

**Core concept:**  
The robot becomes interactive – it listens and reacts to its environment.

### Web App Features
- **Simple rule builder:** “When [sound] then [action].” Use the microphone to detect claps, loud sounds, or even a word (simple volume threshold, not speech recognition – that’s an upsell).
- **Reaction library:** Pre‑made reactions: clap → wave, snap → change face, loud noise → dance.
- **Custom rules:** Students can combine any sound trigger with any action from previous missions.
- **Final showcase:** A “presentation mode” where the robot shows off all four missions in sequence.

### Video Script (≈4 minutes)

**[0:00]**  
*Robot stands still. I clap. Nothing happens. I look at camera.*

**Me:** “It’s been great at doing what we tell it, but what if it could listen?”

**[0:25]**  
*Screen recording: I open the rule builder, choose “Clap” → “Wave.” I clap. Robot waves.*

**Me:** “That’s it. One rule, and now the robot is paying attention to you.”

**[1:00]**  
*I add a second rule: “Snap” → “Change face.” I snap, the OLED switches to a surprised face.*

**Me:** “Now it’s having a conversation with you through sound.”

**[1:45]**  
*Show more complex rules: loud sound → do the dance from Mission 3; soft sound → nod and play a quiet sound.*

**[2:30]**  
*Me sitting with the robot, clapping, snapping, talking to it. The robot reacts fluidly.*

**Me:** “This is the final mission because it’s where the robot stops being a collection of parts and starts feeling like a companion.”

**[3:15]**  
*I put the robot on the table, look at camera.*

**Me:** “You’ve given it a face, a voice, a way to move, and now the ability to respond. That’s four weeks of making it yours. You’ve done more with a robot than most people do in a year.”

**[3:45]**  
*Text on screen: “You’ve earned your 1‑hour session with a NASA engineer. Let’s build the next thing together.”*

---

## What We Do NOT Cover (And Why)

- **“What is programming?”** – Not a single video mentions code, syntax, or variables. The concepts are embedded in the actions: sequencing (Mission 3), cause/effect (Mission 4), customization (Missions 1 & 2).  
- **LLM / AI** – We mention it nowhere. It becomes an *upsell* after Mission 4: “Want your robot to talk back with AI? Check out the Brain Upgrade.”  
- **Hardware details** – No mention of servos, microcontrollers, or file systems. The web app abstracts everything.

The only “technical” moment is the intro chapter’s USB connection, and that’s presented as “waking it up,” not “installing drivers.”

---

## Tone & Visual Style for Web App

- **Animations:** Smooth, playful, with a slight sci‑fi sheen. Use the 3D robot model as a recurring character.  
- **Interactivity:** Every button press gives haptic‑like visual feedback (pulse, glow).  
- **Progress:** A circular progress bar fills as missions are completed. After each mission, the robot model in the app gets a new accessory (a glowing eye for Mission 1, a sound wave around it for Mission 2, etc.).  
- **Text:** Short, punchy. “Draw a face.” “Record a sound.” “Pose the robot.” “Make a rule.”

---

## Summary

The four missions form a clear arc:  
1. **Identity** (look)  
2. **Voice** (sound)  
3. **Body language** (movement)  
4. **Interaction** (response)

Each mission builds on the previous one, and the web app is the unified tool that makes it feel like a game, not a curriculum.

This is not “too simple.” It’s simple enough that the customer immediately understands the value: *I get to transform a robot in four fun sessions, with a NASA engineer as my safety net.*