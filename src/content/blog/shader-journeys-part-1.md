---
title: "Shader Journeys: Part 1"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: Starting a new series on learning shaders from scratch. Fragments, vertices, and a lot of confused staring at math.
thumbnail: shader-journeys-thumb.gif
---

Well, I've dabbled before in shaders with godot before but I kinda fell off after a bit of dabbling. After parking [Engrammic](https://engrammic.ai) for the meantime, I find myself with some more free time, so I've decided to revisit this topic yet again, but this time I've decided to torture myself thru trying to dabble directly in GLSL, and I must say, I don't think it's that bad >.>

Big shoutout to the [Book of Shaders](https://thebookofshaders.com/), honestly it's made learning this stuff SO much more easier. But here's a full log of my first day with shaders. enjoy~ ^_^

---

I've been into gamedev for quite some time now and I've worked at [an indie studio](https://store.steampowered.com/developer/coniferdigital/) during my first year of university creating [Versebound](https://store.steampowered.com/app/2672520/Versebound/). While working with them, and also later, I came across this very interesting video by [Acerola](https://www.youtube.com/@Acerola_t/featured): 

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

Ever since I've been following the guy and I've _really_ wanted to give shaders an earnest try. And so, here we are. Now I'm writing these both for you, the reader, but also as a record of me learning i.e. I'm writing these on the fly so pardon randomass skips and absolutely bullshit writing patterns. 

Anw, for those unfamiliar with the mysteries of computer graphics, if you've ever owned a computer, you've probably used _some_ kinda graphics card (GPU) in there. Now, our computers show us shit through our monitors which have some **resolution** and size (and if you don't use a monitor... how in the hell are you operating the device? By memory? Damn ait dawg forgive us mortals). Fundamentally all graphical things on a monitor are shown using pixels, and each one needs to be rendered at some "refresh-rate" per second, this means that the computer needs to perform a shit load of compute just to show you images of anime catgirls (yes elon, we know).

CPUs are kinda shit at this. Like, they're great at doing one complex thing really fast, but rendering means doing one *simple* thing (color this pixel) millions of times per frame. So this is where the humble GPU comes along, which just does parallelized shit to have a load of tiny processors where each one handles a pixel (or a few), and they all do it at _once_. Shaders are the little programs that tell each of those processors what to do and that's that. That's the whole mystery. We write a function that takes in some info about where a pixel is and spits out what color it should be, and then the GPU runs that function a billion times per second across our entire screen. Wild.

Coming from Godot, raw GLSL wasn't that different but there's some syntax stuff. Same gradient shader in both:

```compare
// Godot
shader_type canvas_item;

void fragment() {
    COLOR = vec4(UV.x, UV.y, 0.5, 1.0);
}
---
// GLSL
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
```

**TLDR:**
- `uniform` - values passed in from outside (can't change per-pixel)
- `gl_FragCoord` - current pixel position
- `u_resolution` - canvas size. `gl_FragCoord.xy / u_resolution` = normalized UV (0-1)
- `u_time` - seconds since load
- `u_mouse` - mouse pos in pixels
- `gl_FragColor` - output color (vec4 RGBA)
- `precision mediump float` - "medium precision floats pls" (required in WebGL)

Godot gives us `UV` for free and writes to `COLOR`. Raw GLSL we compute normalized coords from `gl_FragCoord` ourselves and write to `gl_FragColor`. Godot handles the `precision` and `shader_type` boilerplate.

One of the first shaders from the book of shaders: 

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

pretty simple and straightforward, cycle through colors using `sin` of `u_time` to oscillate between -1 and 1 and then feed that into the blue color val of the shader. 

(rendering this shit on web and on my blog was also quite a fun thing, god bless claude ToT)

Anw, the next shader frag is pretty straightforward. `smoothstep` is kinda the workhorse function for drawing shit it would seem and it returns how far a value is through a range, but with an S-curve instead of linear - so `smoothstep(0.02, 0.0, dist)` gives us 1.0 when `dist` is 0, fades to 0.0 at `dist=0.02`. Reversed thresholds flip the output so we use it to draw anti-aliased shapes by feeding it distance-to-edge:

```glsl-live
precision mediump float;
uniform vec2 u_resolution;

float plot(vec2 st) {
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    float y = st.x;
    vec3 color = vec3(y);
    float pct = plot(st);
    color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);
    gl_FragColor = vec4(color, 1.0);
}
```

HSB/HSV is way more intuitive than RGB for procedural color (but it's also a lot of magic). Instead of mixing three primaries, we think in terms of:

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

where $\text{sat} = 0$ is gray/white and $\text{sat} = 1$ is pure vivid color.

**Hue** is which color on the wheel, computed piecewise based on which RGB channel wins. Why multiply by 6? The color wheel has 6 segments where one channel rises while another falls:

```hue-diagram
```

The math for hue is piecewise depending on which channel is max:

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{if } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{if } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{if } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

But we can't just use `max()` to find the winner because we need to know WHICH channel won, not just the value. Branches are slow on GPU (SIMD lockstep means all threads execute all paths), so we use `mix(a, b, step(edge, x))` instead of `if/else`:

```c
// step(edge, x) = 1.0 if x >= edge, else 0.0
// mix(a, b, t) = a*(1-t) + b*t, so:
//   mix(a, b, 0.0) = a
//   mix(a, b, 1.0) = b

// branchless "if G >= B, use pathA, else pathB":
vec4 result = mix(pathB, pathA, step(rgb.b, rgb.g));

// rgb2hsb uses two comparisons to find the winner:
vec4 gbWinner = mix(
    vec4(rgb.bg, -1.0, 0.66),    // B wins: (B, G, offset_helper, offset_B)
    vec4(rgb.gb, 0.0, -0.33),    // G wins: (G, B, offset_R, offset_G)
    step(rgb.b, rgb.g)           // 1.0 if G >= B
);

vec4 rgbWinner = mix(
    vec4(gbWinner.xyw, rgb.r),   // G or B stays winner
    vec4(rgb.r, gbWinner.yzx),   // R wins, swizzle grabs the right slots
    step(gbWinner.x, rgb.r)      // 1.0 if R >= max(G,B)
);
// now rgbWinner.x = max, .y = valB, .z = offset, .w = valA
```

Going the other way, hsb2rgb uses a triangle wave trick:

```c
vec3 hsb2rgb(vec3 c) {
    // hue -> 6-segment wheel, stagger R/G/B by +0/+4/+2
    vec3 wheel = c.x * 6.0 + vec3(0.0, 4.0, 2.0);
    
    // mod wraps around 6, -3 centers at zero, abs = triangle wave
    vec3 triangle = abs(mod(wheel, 6.0) - 3.0);
    
    // shift down by 1, clamp to 0-1
    vec3 rgb = clamp(triangle - 1.0, 0.0, 1.0);
    
    // cubic smoothstep for perceptually smoother gradients
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    
    // brightness * (blend white->color by saturation)
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

Basic version - x is hue, y is brightness:

```glsl-live
precision mediump float;
uniform vec2 u_resolution;

vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = hsb2rgb(vec3(uv.x, 1.0, uv.y));
    gl_FragColor = vec4(color, 1.0);
}
```

And here's the polar coordinate version where the angle is hue, radius is saturation, tbh this one's more familiar:

```glsl-live
precision mediump float;
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;

vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec2 toCenter = vec2(0.5) - st;
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    vec3 color = hsb2rgb(vec3((angle / TWO_PI) + 0.5, radius, 1.0));
    gl_FragColor = vec4(color, 1.0);
}
```

btw if you've ever used Minecraft shaders (Seus, BSL, Complementary, etc.) - that's literally this stuff. All those water reflections, volumetric god rays, waving grass, bloom effects - just fragment and vertex shaders doing math on every pixel every frame. Wild to think the same `smoothstep` and `mix` calls we're messing with here are what make Minecraft look like an RTX demo.

also the banner/hero for this post has a shader running on it too :3 shoutout to [paper](https://paper.design/) for the inspo on that one.

Well, that's all for this one. more later~ :3

~ A.
