---
title: "Shader Journeys: Teil 1"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: "Ich starte eine neue Reihe darüber, Shader von Grund auf zu lernen. Fragmente, Vertices und jede Menge verwirrtes Starren auf Mathe."
thumbnail: shader-journeys-thumb.gif
---

Tja, ich habe mich früher schon mal mit Shadern in Godot herumgeschlagen, bin aber nach ein bisschen Rumprobieren irgendwie wieder davon abgekommen. Nachdem ich [Engrammic](https://engrammic.ai) fürs Erste auf Eis gelegt habe, habe ich wieder etwas mehr Freizeit, also habe ich beschlossen, mich diesem Thema noch einmal zu widmen – diesmal allerdings, indem ich mich selbst damit quäle, direkt in GLSL rumzudoktern, und ich muss sagen: Ich finde es gar nicht mal so übel >.>

Riesiges Dankeschön an das [Book of Shaders](https://thebookofshaders.com/), ehrlich, das hat das Lernen von dem Zeug SO viel einfacher gemacht. Aber hier ist das komplette Protokoll meines ersten Tages mit Shadern. Viel Spaß~ ^_^

---

Ich beschäftige mich schon ziemlich lange mit Gamedev und habe während meines ersten Uni-Jahres bei [einem Indie-Studio](https://store.steampowered.com/developer/coniferdigital/) an [Versebound](https://store.steampowered.com/app/2672520/Versebound/) mitgearbeitet. Während der Arbeit dort und auch später bin ich auf dieses extrem interessante Video von [Acerola](https://www.youtube.com/@Acerola_t/featured) gestoßen:

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

Seitdem folge ich dem Typen und wollte Shadern _wirklich_ mal eine echte Chance geben. Und nun sind wir hier. Ich schreibe das hier sowohl für euch als Leser als auch als Gedankenstütze für mein eigenes Lernen, d. h. ich schreibe das einfach frei von der Leber weg – verzeiht also willkürliche Gedankensprünge und absolut chaotische Schreibmuster.

Wie auch immer, für diejenigen, die mit den Mysterien der Computergrafik nicht vertraut sind: Wenn ihr jemals einen Computer besessen habt, hattet ihr wahrscheinlich _irgendeine_ Art von Grafikkarte (GPU) darin verbaut. Nun zeigen uns unsere Computer den ganzen Kram über Monitore an, die eine bestimmte **Auflösung** und Größe haben (und falls ihr keinen Monitor benutzt... wie zur Hölle bedient ihr das Gerät? Aus dem Gedächtnis? Verdammt, alles klar, vergib uns Sterblichen). Im Grunde wird alles Grafische auf einem Monitor durch Pixel dargestellt, und jedes einzelne muss mit einer bestimmten „Bildwiederholrate“ (Refresh-Rate) pro Sekunde gerendert werden. Das bedeutet, dass der Computer eine riesige Menge an Rechenleistung aufbringen muss, nur um euch Bilder von Anime-Catgirls anzuzeigen (ja Elon, wir wissen Bescheid).

CPUs sind darin ziemlich mies. Sie sind zwar großartig darin, eine komplexe Sache ultraschnell zu erledigen, aber Rendering bedeutet, eine *einfache* Sache (färbe diesen Pixel) millionenfach pro Frame zu tun. Hier kommt also die bescheidene GPU ins Spiel, die das Ganze einfach parallelisiert und jede Menge winzige Prozessoren am Start hat, von denen jeder einen Pixel (oder ein paar) übernimmt – und zwar alle auf _einmal_. Shader sind die kleinen Programme, die jedem dieser Prozessoren sagen, was er tun soll, und das war's auch schon. Das ist das ganze Geheimnis. Wir schreiben eine Funktion, die Infos darüber bekommt, wo sich ein Pixel befindet, und ausspuckt, welche Farbe er haben soll – und die GPU führt diese Funktion dann eine Milliarde Mal pro Sekunde über unseren gesamten Bildschirm aus. Wild.

Wenn man von Godot kommt, war pures GLSL gar nicht so viel anders, aber es gibt ein paar Syntax-Unterschiede. Derselbe Gradient-Shader in beiden:

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
- `uniform` – von außen übergebene Werte (können sich nicht pro Pixel ändern)
- `gl_FragCoord` – aktuelle Pixelposition
- `u_resolution` – Canvas-Größe. `gl_FragCoord.xy / u_resolution` = normalisierte UV (0-1)
- `u_time` – Sekunden seit dem Laden
- `u_mouse` – Mausposition in Pixeln
- `gl_FragColor` – Ausgabefarbe (vec4 RGBA)
- `precision mediump float` – „mittlere Fließkomma-Präzision bitte“ (in WebGL erforderlich)

Godot gibt uns `UV` direkt mit und schreibt nach `COLOR`. In purem GLSL berechnen wir die normalisierten Koordinaten aus `gl_FragCoord` selbst und schreiben nach `gl_FragColor`. Godot übernimmt den Boilerplate für `precision` und `shader_type`.

Einer der ersten Shader aus dem Book of Shaders:

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

Ziemlich simpel und unkompliziert: mit `sin` von `u_time` durch die Farben rotieren, um zwischen -1 und 1 zu oszillieren, und das dann in den Blau-Farbwert des Shaders einspeisen.

(Diesen Kram im Web und auf meinem Blog zu rendern war auch ein ziemlicher Spaß, Gott segne Claude ToT)

Wie auch immer, das nächste Shader-Fragment ist ziemlich geradlinig. `smoothstep` scheint so etwas wie das Arbeitstier unter den Funktionen zum Zeichnen von Zeug zu sein; sie gibt zurück, wie weit ein Wert in einem Bereich liegt, aber mit einer S-Kurve statt linear – `smoothstep(0.02, 0.0, dist)` liefert uns also 1.0, wenn `dist` gleich 0 ist, und blendet bei `dist=0.02` auf 0.0 ab. Umgekehrte Schwellenwerte invertieren die Ausgabe, daher nutzen wir das, um kantengeglättete (anti-aliased) Formen zu zeichnen, indem wir den Abstand zur Kante übergeben:

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

HSB/HSV ist für prozedurale Farben viel intuitiver als RGB (aber es ist auch eine Menge Zauberei). Statt drei Primärfarben zu mischen, denken wir in:

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

wobei $\text{sat} = 0$ Grau/Weiß ist und $\text{sat} = 1$ reine, lebendige Farbe.

**Hue** (Farbton) bestimmt, welche Farbe auf dem Farbkreis gemeint ist, stückweise berechnet basierend darauf, welcher RGB-Kanal gewinnt. Warum mal 6 multiplizieren? Der Farbkreis hat 6 Segmente, in denen ein Kanal ansteigt, während ein anderer abfällt:

```hue-diagram
```

Die Mathematik für den Farbton (Hue) ist stückweise definiert, je nachdem, welcher Kanal das Maximum ist:

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{if } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{if } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{if } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

Aber wir können nicht einfach `max()` verwenden, um den Gewinner zu ermitteln, weil wir wissen müssen, WELCHER Kanal gewonnen hat, nicht nur den Wert. Verzweigungen (Branches) sind auf der GPU langsam (SIMD-Lockstep bedeutet, dass alle Threads alle Pfade ausführen), also nutzen wir `mix(a, b, step(edge, x))` statt `if/else`:

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

In die andere Richtung nutzt hsb2rgb einen Trick mit Dreieckswellen:

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

Basisversion – x ist der Farbton (Hue), y ist die Helligkeit (Brightness):

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

Und hier ist die Polarkoordinaten-Version, bei der der Winkel der Farbton und der Radius die Sättigung ist; ehrlich gesagt kommt mir das vertrauter vor:

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

Übrigens, falls ihr jemals Minecraft-Shader (SEUS, BSL, Complementary usw.) benutzt habt – genau das ist dieses Zeug. All diese Wasserreflexionen, volumetrischen God-Rays, wehendes Gras, Bloom-Effekte – einfach nur Fragment- und Vertex-Shader, die in jedem Frame auf jedem Pixel Mathematik betreiben. Verrückt zu wissen, dass dieselben `smoothstep`- und `mix`-Aufrufe, mit denen wir hier rumspielen, Minecraft wie eine RTX-Demo aussehen lassen.

Übrigens läuft auf dem Banner/Hero-Bild für diesen Post auch ein Shader :3 Shoutout an [paper](https://paper.design/) für die Inspiration dazu.

Nun denn, das war's fürs Erste. Mehr später~ :3

~ A.
