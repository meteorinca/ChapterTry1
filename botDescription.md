The ESP32-Hi Mechanical Dog is a quadruped robot powered by the ESP32-C3 microcontroller (RISC-V single-core, 160MHz, with Wi-Fi and Bluetooth 5.0), featuring 4 low torque SG90 micro servos (one per leg). It includes microphone for voice commands, a 3W speaker for audio feedback, WS2812B RGB LEDS on its head, an OLED 0.96 inch (128x64) as eyes,and a 3.7V 500mAh LiPo battery with charging circuit. Additional components encompass an INA219 current sensor, TB6612FNG motor driver (adapted for servos), JST connectors, PCB with LED indicators.

It's a good platform to learn coding but not really good at walking. The legs can easily support the body weight and so it's very snappy at waking up, saying hi, doing a weird dance but 4 servos with no joints means it can't really walk. It can waddle forward or backward, lol. Which makes it even more adorable :)


Components:

1. Microcontroller: ESP32-C3 Mini Development Board
- RISC-V architecture with 160MHz clock speed
- Built-in Wi-Fi and Bluetooth 5.0
- Good for IoT projects
- Decent GPIO count for multiple peripherals

2. Servos: 4x SG90 Micro Servos
- Small, lightweight servos
- Low torque (approx 1.8 kg⋅cm at 4.8V)
- Popular for hobby projects
- Easy to control with Arduino libraries

3. Audio: MAX4466 Electret Microphone Amplifier
- Amplifies weak microphone signals
- Adjustable gain up to 100x
- Good for voice recognition projects

4. Audio: PAM8403 3W Mono Audio Amplifier
- Compact Class-D amplifier
- 3W output power (into 4 ohm speaker)
- Low THD (Total Harmonic Distortion)
- Can drive small speakers effectively

5. Display: 0.96 inch 128x64 OLED Display
- I2C interface (SDA, SCL pins)
- 128x64 pixel monochrome display
- Good contrast and viewing angles
- Can show animations and text

6. LED: WS2812B RGB LED Strip
- Individually addressable LEDs
- Single data line control
- 5V power requirement
- Popular for decorative lighting

7. Power: 3.7V 500mAh LiPo Battery
- Rechargeable lithium polymer battery
- Provides ~1.85Wh of energy
- Needs proper charging and protection circuit