---
title: "Shaderresor: Del 1"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: "Startar en ny serie om att lära sig shaders från grunden. Fragment, vertices och en hel del förvirrat stirrande på matte."
thumbnail: shader-journeys-thumb.gif
---

Jag har pillat lite med shaders i Godot tidigare, men tappade det efter ett tag. Efter att ha parkerat [Engrammic](https://engrammic.ai) för tillfället har jag lite mer fritid, så jag bestämde mig för att ta tag i det här ämnet igen. Men den här gången ska jag plåga mig själv genom att ge mig på ren GLSL direkt, och jag måste säga att det inte känns så farligt ändå >.>

Stort tack till [Book of Shaders](https://thebookofshaders.com/), helt ärligt har det gjort det SÅ mycket lättare att lära sig det här. Men här är en komplett logg från min första dag med shaders. enjoy~ ^_^

---

Jag har hållit på med spelutveckling ett bra tag nu och jobbade på [en indiestudio](https://store.steampowered.com/developer/coniferdigital/) under mitt första universitetsår med att skapa [Versebound](https://store.steampowered.com/app/2672520/Versebound/). Medan jag jobbade med dem, och även senare, stötte jag på den här väldigt intressanta videon av [Acerola](https://www.youtube.com/@Acerola_t/featured): 

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

Sedan dess har jag följt honom och _verkligen_ velat ge shaders ett ärligt försök. Och nu är vi här. Jag skriver det här både för dig som läser, men också som en dokumentation av mitt eget lärande, så jag skriver allt i farten. Ha överseende med random hopp och allmänt flummig meningsbyggnad.

Hursomhelst, för er som inte är bekanta med datorgrafikens mysterier: om du någonsin har ägt en dator har du förmodligen använt _någon_ form av grafikkort (GPU) i den. Våra datorer visar grejer via skärmar som har en viss **upplösning** och storlek (och om du inte använder en skärm... hur i hela friden navigerar du ens enheten? På ren minnesbild? Respekt, förlåt oss dödliga). I grund och botten visas all grafik på en skärm med hjälp av pixlar, och varje pixel behöver renderas vid en viss uppdateringsfrekvens per sekund. Det betyder att datorn måste utföra en sjuk mängd beräkningar bara för att visa bilder på anime-kattjejer (ja Elon, vi vet).

Processorer (CPU) suger ganska hårt på det här. Alltså, de är grymma på att göra en enda komplex grej supersnabbt, men rendering innebär att göra en *enkel* grej (sätt färg på den här pixeln) miljontals gånger per bildruta. Det är här den ödmjuka GPUn kommer in i bilden. Den kör bara parallelliserade grejer med massor av pyttesmå processorer där var och en hanterar en pixel (eller ett fåtal), och alla gör det _samtidigt_. Shaders är de små programmen som talar om för var och en av dessa processorer vad de ska göra, och det är hela grejen. Det är hela mysteriet. Vi skriver en funktion som tar in lite info om var en pixel befinner sig och spottar ur sig vilken färg den ska ha, och sedan kör GPUn den funktionen en miljard gånger per sekund över hela skärmen. Helt sjukt.

När man kommer från Godot kändes ren GLSL inte så värst annorlunda, men det finns en del syntaxskillnader. Samma gradient-shader i båda:

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
- `uniform` - värden som skickas in utifrån (kan inte ändras per pixel)
- `gl_FragCoord` - nuvarande pixelposition
- `u_resolution` - canvas-storlek. `gl_FragCoord.xy / u_resolution` = normaliserad UV (0-1)
- `u_time` - sekunder sedan laddning
- `u_mouse` - musposition i pixlar
- `gl_FragColor` - utdatafärg (vec4 RGBA)
- `precision mediump float` - "medium precision floats tack" (krävs i WebGL)

Godot ger oss `UV` gratis och skriver till `COLOR`. I ren GLSL beräknar vi normaliserade koordinater från `gl_FragCoord` själva och skriver till `gl_FragColor`. Godot sköter all boilerplate kring `precision` och `shader_type`.

En av de första shaderna från Book of Shaders: 

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

ganska enkelt och rakt på sak, loopa igenom färger med `sin` av `u_time` för att oscillera mellan -1 och 1 och skicka sedan in det i shaderns blåa färgvärde. 

(att rendera det här på webben och på min blogg var också ett rätt kul projekt, gud välsigne claude ToT)

Hursomhelst, nästa shader-snutt är ganska okomplicerad. `smoothstep` verkar vara lite av arbetshästen för att rita saker, och den returnerar hur långt ett värde har nått inom ett intervall, fast med en S-kurva istället för en linjär kurva. Så `smoothstep(0.02, 0.0, dist)` ger oss 1.0 när `dist` är 0 och tonar ut till 0.0 vid `dist=0.02`. Omvända tröskelvärden vänder på utdatan, så vi använder det för att rita kantutjämnade former genom att mata in avståndet till kanten:

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

HSB/HSV är bra mycket mer intuitivt än RGB för procedurgenererad färg (men det är också en hel del trolleri). Istället för att blanda tre primärfärger tänker vi i termer av:

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

där $\text{sat} = 0$ är grått/vitt och $\text{sat} = 1$ är ren, intensiv färg.

**Nyans (Hue)** är vilken färg på hjulet det rör sig om, beräknad styckvis baserat på vilken RGB-kanal som är störst. Varför multiplicera med 6? Färghjulet har 6 segment där en kanal stiger medan en annan sjunker:

```hue-diagram
```

Matten för nyans är styckvis uppdelad beroende på vilken kanal som är max:

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{om } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{om } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{om } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

Men vi kan inte bara använda `max()` för att hitta vinnaren, eftersom vi behöver veta VILKEN kanal som vann, inte bara värdet. Villkorssatser är långsamma på GPUn (SIMD-lockstep innebär att alla trådar kör alla vägar), så vi använder `mix(a, b, step(edge, x))` istället för `if/else`:

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

Åt andra hållet använder hsb2rgb ett triangelvågsknep:

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

Grundversion: x är nyans, y är ljusstyrka:

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

Och här är versionen med polära koordinater där vinkeln är nyans, radien är mättnad. Ärligt talat känns den här mer bekant:

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

btw om du någonsin har använt Minecraft-shaders (Seus, BSL, Complementary osv.) så är det bokstavligen precis det här. Alla vattenreflektioner, volymetriska ljusstrålar, vajande gräs, bloom-effekter, allt är bara fragment- och vertex-shaders som kör matte på varje pixel varje bildruta. Sjukt att tänka på att samma `smoothstep`- och `mix`-anrop vi leker med här är det som får Minecraft att se ut som ett RTX-demo.

Headern/bannern för det här inlägget har också en shader igång :3 shoutout till [paper](https://paper.design/) för inspirationen till den.

Jaja, det var allt för den här gången. Mer senare~ :3

~ A.
