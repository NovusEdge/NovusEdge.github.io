---
title: "Shader-seikkailut: Osa 1"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: "Aloitetaan uusi sarja shaderien opettelusta ihan nollasta. Fragmentteja, verteksejä ja paljon hämmentynyttä matikan tuijottelua."
thumbnail: shader-journeys-thumb.gif
---

No niin, olen aiemmin räpeltänyt shadereiden parissa Godotilla, mutta se vähän jäi alkukokeilujen jälkeen. Laitettuani [Engrammicin](https://engrammic.ai) toistaiseksi jäihin minulla on taas vähän enemmän vapaa-aikaa, joten päätin palata tämän aiheen pariin. Tällä kertaa päätin kiduttaa itseäni yrittämällä koodata suoraan GLSL:ää, ja täytyy sanoa, ettei tämä olekaan niin paha >.>

Iso shoutout [Book of Shadersille](https://thebookofshaders.com/), rehellisesti sanottuna se teki tämän oppimisesta NIIIIN paljon helpompaa. Mutta tässä on koko loki ensimmäisestä päivästäni shaderien parissa. Nauttikaa~ ^_^

---

Olen harrastanut pelikehitystä jo jonkin aikaa ja olin töissä [indie-studiolla](https://store.steampowered.com/developer/coniferdigital/) ensimmäisenä yliopistovuotenani tekemässä peliä [Versebound](https://store.steampowered.com/app/2672520/Versebound/). Työskennellessäni heidän kanssaan, ja myöhemminkin, törmäsin tähän tosi mielenkiintoiseen [Acerolan](https://www.youtube.com/@Acerola_t/featured) videoon: 

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

Siitä lähtien olen seurannut tyyppiä ja halunnut _oikeasti_ antaa shadereille kunnon mahdollisuuden. Ja tässä sitä ollaan. Kirjoitan näitä sekä teille lukijoille että itselleni muistiinpanoiksi oppimisestani, eli kirjoitan näitä lennosta, joten pahoittelut satunnaisista hyppelystä ja aivan päättömistä kirjoitustyyleistä. 

Joka tapauksessa, niille jotka eivät tunne tietokonegrafiikan ihmeitä: jos olet koskaan omistanut tietokoneen, olet todennäköisesti käyttänyt siinä _jonkinlaista_ näytönohjainta (GPU). Tietokoneemme näyttävät meille tavaraa näyttöjen kautta, joilla on jokin **resoluutio** ja koko (ja jos et käytä näyttöä... miten ihmeessä edes käytät laitetta? Ulkomuistista? Huhhuh bro, anna meille kuolevaisille anteeksi). Pohjimmiltaan kaikki graafiset asiat näytöllä esitetään pikseleinä, ja jokainen niistä täytyy renderöidä tietyllä virkistystaajuudella per sekunti. Tämä tarkoittaa, että tietokoneen täytyy tehdä aivan helvetisti laskentaa vain näyttääkseen sinulle kuvia anime-kissatytöistä (kyllä Elon, me tiedämme).

CPU:t ovat aika surkeita tässä. Siis ne ovat mahtavia tekemään yhden monimutkaisen asian todella nopeasti, mutta renderöinti tarkoittaa yhden *yksinkertaisen* asian tekemistä (väritä tämä pikseli) miljoonia kertoja per ruutu. Tässä kohtaa apuun tulee nöyrä GPU, joka vain tekee asioita rinnakkain valtavalla määrällä pieniä prosessoreita, joista jokainen käsittelee yhtä pikseliä (tai muutamaa), ja ne tekevät sen kaikki _yhtä aikaa_. Shaderit ovat niitä pieniä ohjelmia, jotka kertovat kullekin noista prosessoreista mitä tehdä, ja siinä se. Se on koko mysteeri. Kirjoitamme funktion, joka ottaa sisään tietoa siitä missä pikseli sijaitsee ja sylkee ulos minkä värinen sen pitäisi olla, ja sitten GPU ajaa tuon funktion miljardi kertaa sekunnissa läpi koko näytön. Älytöntä.

Godot-taustalla puhdas GLSL ei ollut kovin erilaista, mutta syntaksissa on vähän eroja. Sama liukuväri-shader molemmilla:

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
- `uniform` - ulkopuolelta syötetyt arvot (eivät voi muuttua pikselikohtaisesti)
- `gl_FragCoord` - nykyisen pikselin sijainti
- `u_resolution` - kankaan koko. `gl_FragCoord.xy / u_resolution` = normalisoitu UV (0-1)
- `u_time` - sekunnit latauksesta
- `u_mouse` - hiiren sijainti pikseleinä
- `gl_FragColor` - ulostuloväri (vec4 RGBA)
- `precision mediump float` - "medium-tarkkuuden liukuluvut kiitos" (pakollinen WebGL:ssä)

Godot antaa `UV`:n ilmaiseksi ja kirjoittaa suoraan muuttujaan `COLOR`. Puhtaassa GLSL:ssä laskemme normalisoidut koordinaatit itse `gl_FragCoord`:sta ja kirjoitamme muuttujaan `gl_FragColor`. Godot hoitaa `precision`- ja `shader_type`-toistot.

Yksi ensimmäisistä shadereista Book of Shadersista: 

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

aika yksinkertaista ja suoraviivaista: kierrätetään värejä käyttämällä `u_time`-muuttujan `sin`-funktiota heilahtelemaan -1:n ja 1:n välillä ja syötetään se sitten shaderin sinisen värin arvoksi. 

(tämän paskan renderöiminen verkossa ja blogissani oli myös melko hauska juttu, luoja siunatkoon Claudea ToT)

Joka tapauksessa, seuraava shader-pätkä on melko suoraviivainen. `smoothstep` tuntuu olevan jonkinlainen grafiikan piirtämisen työjuhta, ja se palauttaa tiedon siitä, kuinka pitkällä arvo on tietyllä välillä, mutta S-käyrällä lineaarisen sijaan – joten `smoothstep(0.02, 0.0, dist)` antaa arvon 1.0 kun `dist` on 0, ja häivyttyy arvoon 0.0 kun `dist=0.02`. Käänteiset kynnysarvot kääntävät ulostulon toisinpäin, joten käytämme sitä reunapehmennettyjen muotojen piirtämiseen syöttämällä sille etäisyyden reunaan:

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

HSB/HSV on paljon intuitiivisempi kuin RGB proceduraaliselle värille (mutta siinä on myös paljon taikuutta). Kolmen päävärin sekoittamisen sijaan ajattelemme näin:

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

missä $\text{sat} = 0$ on harmaa/valkoinen ja $\text{sat} = 1$ on puhdas kirkas väri.

**Hue** (sävy) kertoo mikä väri väripyörällä on kyseessä, ja se lasketaan paloittain sen mukaan, mikä RGB-kanavista voittaa. Miksi kertoa 6:lla? Väripyörässä on 6 lohkoa, joissa yksi kanava nousee samalla kun toinen laskee:

```hue-diagram
```

Sävyn matematiikka on paloittaista riippuen siitä, mikä kanava on maksimi:

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{if } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{if } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{if } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

Mutta emme voi vain käyttää `max()`-funktiota voittajan löytämiseen, koska meidän pitää tietää MIKÄ kanava voitti, eikä vain sen arvoa. Haarautuminen on hidasta GPU:lla (SIMD-tahdistus tarkoittaa, että kaikki säikeet suorittavat kaikki polut), joten käytämme lauseketta `mix(a, b, step(edge, x))` `if/else`-rakenteen sijaan:

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

Toiseen suuntaan mentäessä hsb2rgb käyttää kolmioaaltokikkaa:

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

Perusversio – x on sävy, y on kirkkaus:

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

Ja tässä on napakoordinaattiversio, jossa kulma on sävy ja säde on kylläisyys, rehellisesti sanottuna tämä on tutumpi:

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

muuten, jos olet koskaan käyttänyt Minecraft-shadereita (Seus, BSL, Complementary jne.) – se on kirjaimellisesti tätä samaa kamaa. Kaikki ne veden heijastukset, volumetriset auringonsäteet, heiluva ruoho, bloom-efektit – pelkkiä fragment- ja vertex-shadereita tekemässä matikkaa jokaiselle pikselille joka ikinen ruutu. Älytöntä ajatella, että samat `smoothstep`- ja `mix`-kutsut, joita me tässä pyörittelemme, saavat Minecraftin näyttämään RTX-demolta.

myös tämän postauksen bannerissa/hero-kuvassa pyörii shaderi :3 kiitokset [paperille](https://paper.design/) inspiksestä siihen.

No, siinä kaikki tältä erää. lisää myöhemmin~ :3

~ A.
