import struct
import math
import random

sample_rate = 16000
duration = 5
num_samples = sample_rate * duration

def write_wav(filename, samples):
    with open(filename, 'wb') as f:
        # RIFF header
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + len(samples) * 2))
        f.write(b'WAVE')
        # fmt chunk
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))
        f.write(struct.pack('<H', 1)) # PCM format
        f.write(struct.pack('<H', 1)) # Mono channel
        f.write(struct.pack('<I', sample_rate)) # Sample rate
        f.write(struct.pack('<I', sample_rate * 2)) # Byte rate
        f.write(struct.pack('<H', 2)) # Block align
        f.write(struct.pack('<H', 16)) # Bits per sample
        # data chunk
        f.write(b'data')
        f.write(struct.pack('<I', len(samples) * 2))
        
        # Write samples
        for s in samples:
            val = int(max(-32767, min(32767, s)))
            f.write(struct.pack('<h', val))

# 1. Ocean (Pink Noise with wave envelope)
b0=0; b1=0; b2=0; b3=0; b4=0; b5=0; b6=0
ocean = []
for i in range(num_samples):
    white = random.uniform(-1, 1)
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    b6 = white * 0.115926
    
    # envelope (waves crashing)
    vol = 0.6 + 0.4 * math.sin(i / sample_rate * 1.5)
    ocean.append(pink * 1500 * vol)

write_wav('c:/Users/daniel/Desktop/growmind/app-src/assets/sounds/ocean.wav', ocean)

# 2. Night (Brown Noise + Crickets)
brown = 0
night = []
for i in range(num_samples):
    white = random.uniform(-1, 1)
    brown = (brown + (0.02 * white)) / 1.02
    
    # high freq crickets
    if random.random() > 0.01:
        chrp = 0
    else:
        chrp = math.sin(i * 0.5) * 4000
    
    night.append(brown * 15000 + chrp)

write_wav('c:/Users/daniel/Desktop/growmind/app-src/assets/sounds/night.wav', night)

# 3. Forest (White Noise wind + Birds)
forest = []
for i in range(num_samples):
    white = random.uniform(-1, 1)
    
    # bird chirp bursts
    if random.random() < 0.0005:
        bird = math.sin(math.sin(i * 0.01) * 5) * 4000
    else:
        bird = 0
        
    forest.append(white * 1000 + bird)

write_wav('c:/Users/daniel/Desktop/growmind/app-src/assets/sounds/forest.wav', forest)
print("WAV generators finished!")
