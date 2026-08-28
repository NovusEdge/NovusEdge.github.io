---
title: "シェーダーの旅：Part 1"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: "シェーダーをゼロから学ぶ新シリーズをスタート。フラグメント、頂点、そして数式を前に呆然と立ち尽くす日々。"
thumbnail: shader-journeys-thumb.gif
---

まあ、以前にもGodotでシェーダーをかじったことはあったんだけど、少し触っただけでフェードアウトしちゃってたんだよね。一旦[Engrammic](https://engrammic.ai)の開発をひと区切りにして、少し自由な時間ができたから、もう一度このテーマに戻ってくることにした。でも今回は、直接GLSLをいじって自分を痛めつけてみることにしたんだけど……正直、思ってたほど悪くないかも >.>

[Book of Shaders](https://thebookofshaders.com/)には大感謝。これのおかげで学習のハードルがめちゃくちゃ下がった。というわけで、シェーダー初日の全記録がこちら。楽しんでいってね〜 ^_^

---

自分は結構前からゲーム開発にハマっていて、大学1年生のときには[とあるインディースタジオ](https://store.steampowered.com/developer/coniferdigital/)で[Versebound](https://store.steampowered.com/app/2672520/Versebound/)の制作に携わっていた。彼らと仕事をしている最中（そしてその後も）、[Acerola](https://www.youtube.com/@Acerola_t/featured)によるすごく興味深い動画を見かけたんだ：

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

それ以来彼をフォローしていて、シェーダーに_本気で_挑戦してみたいとずっと思っていた。そして今、ここに至るというわけ。読者のみんなに向けて書いていると同時に、自分自身の学習記録でもあるので、思いつくままに書いていくよ。話が急に飛んだり、めちゃくちゃな文体になったりするのはご容赦を。

さて、コンピュータグラフィックスの仕組みに詳しくない人向けに説明すると、PCを持っていれば、大抵は何かしらのグラフィックカード（GPU）が載っているはず。で、PCは**解像度**とサイズを持つモニターを通じていろんな画面を表示してくれる（モニターを使ってない人は……一体どうやって操作してるの？ 記憶力？ すげえな、凡人を許してくれ）。基本的にモニター上のグラフィックはすべてピクセルで表示されていて、それぞれが1秒間に一定の「リフレッシュレート」で描画される必要がある。つまりPCは、アニメの猫耳美少女を表示するためだけに膨大な計算をこなさなきゃいけないってこと（そうだよElon、みんな分かってる）。

CPUはこういう処理がちょっと苦手なんだ。1つの複雑な処理を超高速でこなすのは得意なんだけど、描画ってのは1フレームあたり何百万回も「1つの*単純な*処理（このピクセルに色を塗る）」を繰り返すことだからね。そこで登場するのがGPU様。GPUは並列処理に特化していて、無数の小さなプロセッサがそれぞれ1個（または数個）のピクセルを担当し、それらを_一斉に_処理する。シェーダーは、そのプロセッサたちに何をすべきかを指示する小さなプログラムに過ぎない。謎の正体はこれだけ。ピクセルの位置情報を受け取って、どんな色にすべきかを出力する関数を書くと、GPUが画面全体でその関数を毎秒10億回も実行してくれる。ヤバすぎる。

Godotから入った自分にとって、生のGLSLもそこまで違わなかったけど、構文の違いはいくつかある。両者で同じグラデーションシェーダーを書くとこうなる：

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

**要約（TLDR）:**
- `uniform` - 外部から渡される値（ピクセルごとに変更不可）
- `gl_FragCoord` - 現在のピクセル位置
- `u_resolution` - キャンバスのサイズ。`gl_FragCoord.xy / u_resolution` = 正規化されたUV（0-1）
- `u_time` - ロードからの経過秒数
- `u_mouse` - マウス位置（ピクセル単位）
- `gl_FragColor` - 出力色（vec4 RGBA）
- `precision mediump float` - 「中精度のfloatで頼む」（WebGLで必須）

Godotは `UV` を勝手に用意してくれて `COLOR` に書き込むだけだけど、生のGLSLでは `gl_FragCoord` から正規化座標を自分で計算して `gl_FragColor` に書き込む。Godotは `precision` や `shader_type` などのボイラープレートもよしなに処理してくれている。

Book of Shadersの最初のシェーダーの一つがこれ：

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

かなりシンプルで分かりやすい。`u_time` の `sin` を使って-1から1の間で周期的に色を変化させ、それをシェーダーの青成分の値に流し込んでいる。

（Web上やこのブログでこれをレンダリングするのも結構楽しかった、Claudeマジでありがとう ToT）

さて、次のシェーダーフラグメントもかなりストレートだ。`smoothstep` は図形を描くための万能関数のようで、ある値が範囲内のどの位置にあるかを返すんだけど、線形ではなくS字カーブを描く。だから `smoothstep(0.02, 0.0, dist)` は `dist` が0のときに1.0になり、`dist=0.02` で0.0へとフェードする。しきい値を反転させると出力も反転するので、エッジまでの距離を渡してアンチエイリアス処理された形状を描くのに使える：

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

プロシージャルカラーを扱う場合、RGBよりもHSB/HSVのほうがはるかに直感的（でもマジックも多い）。3原色を混ぜる代わりに、以下のように考える：

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

ここで $\text{sat} = 0$ はグレー/白で、$\text{sat} = 1$ は完全な原色。

**Hue（色相）**はカラーホイール上のどの色かを表し、どのRGBチャンネルが最大かに基づいて区分的に計算される。なぜ6を掛けるのか？ カラーホイールは、あるチャンネルが増加しながら別のチャンネルが減少する6つのセグメントで構成されているから：

```hue-diagram
```

色相の計算式は、どのチャンネルが最大（max）かに応じて区分的に分かれている：

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{if } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{if } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{if } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

でも、単に `max()` を使って値を取得するだけじゃダメで、値だけでなく「どの」チャンネルが最大になったのかを知る必要がある。GPUでは分岐処理が遅い（SIMDのロックステップ実行のため、すべてのスレッドがすべての分岐パスを実行してしまう）ので、`if/else` の代わりに `mix(a, b, step(edge, x))` を使う：

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

逆に変換する場合、hsb2rgbは三角波のトリックを使う：

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

基本バージョン - xが色相、yが明度：

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

そしてこちらが極座標バージョン。角度が色相で、半径が彩度になる。正直こっちのほうが見慣れてるよね：

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

ちなみに、Minecraftのシェーダー（Seus、BSL、Complementaryなど）を使ったことがあるなら——まさにこれがそれ。水面の反射、ボリュメトリックな光条（God Rays）、揺れる草、ブルーム効果など、すべて毎フレーム全ピクセルに対して数式を計算しているフラグメントシェーダーと頂点シェーダーそのもの。ここでいじっているのと同じ `smoothstep` や `mix` の呼び出しが、MinecraftをRTXのデモみたいに見せていると思うとヤバいよね。

あと、この投稿のバナー/ヒーロー画像でもシェーダーが動いてるよ :3 そのアイデアをくれた[paper](https://paper.design/)に感謝。

さて、今回はここまで。続きはまた今度〜 :3

~ A.
