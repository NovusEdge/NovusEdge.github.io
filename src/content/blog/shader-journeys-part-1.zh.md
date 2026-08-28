---
title: "Shader 之旅：第 1 篇"
date: 2026-07-15
tags: [shader-journeys, shaders, graphics]
description: "开启一个从零开始学 Shader 的全新系列。片元、顶点，以及对着一堆数学公式发懵。"
thumbnail: shader-journeys-thumb.gif
---

好吧，我之前在 Godot 里捣鼓过一点 Shader，但稍微浅尝了一下就没再坚持。在把 [Engrammic](https://engrammic.ai) 暂时搁置后，我发现自己空闲时间多了些，于是决定重新拾起这个话题，不过这次我打算狠狠自虐一番——直接上手硬啃 GLSL。讲真，我觉得好像也没那么糟糕 >.>

特别感谢 [Book of Shaders](https://thebookofshaders.com/)，说实话它让学这玩意儿变得容易了太多。下面是我接触 Shader 第一天的完整记录，希望大家喜欢~ ^_^

---

我接触游戏开发（gamedev）已经有蛮长时间了，大一的时候还在[一家独立工作室](https://store.steampowered.com/developer/coniferdigital/)参与制作过 [Versebound](https://store.steampowered.com/app/2672520/Versebound/)。在跟他们共事期间，以及后来，我看到了 [Acerola](https://www.youtube.com/@Acerola_t/featured) 做的这个非常有意思的视频：

![Games to Pixels](https://youtu.be/gg40RWiaHRY?si=ACxmo4WqWew1iPaU)

从那之后我就一直在关注他，而且也*真心*想认真尝试一下写 Shader。于是，就有了现在这篇记录。我写这些既是给各位读者看的，也是作为我自己学习的记录——也就是说，我是随手现写的，要是有些莫名其妙的跳步和稀烂的写作风格，还请多多包涵。

言归正传，对于那些不太了解计算机图形学奥秘的人来说，只要你用过电脑，多半就用过某种显卡（GPU）。我们的电脑通过显示器向我们展示各种画面，显示器有特定的**分辨率**和尺寸（要是你不用显示器……那你到底是怎么操作设备的？全凭肌肉记忆吗？大佬牛逼，请原谅我们这些凡人）。从根本上说，显示器上的所有图形画面都是由像素构成的，每个像素每秒都要按照一定的“刷新率”被渲染出来，这意味着电脑光是为了给你展示二次元猫娘图片（对，Elon，我们懂的），就必须进行海量的计算。

CPU 干这事儿就挺拉胯的。它非常擅长极快地处理一件复杂的事情，但渲染意味着每一帧都要做数百万次*极简单*的事情（给这个像素上色）。所以，默默奉献的 GPU 就派上用场了，它靠的就是高度并行化，塞进了一大堆微型处理器，每个处理器负责处理一个（或几个）像素，而且它们是*同时*进行的。Shader（着色器）就是告诉每个处理器该干嘛的小程序，仅此而已。这就是全部的奥秘。我们写一个函数，接收关于像素位置的信息，吐出它应该是什么颜色，然后 GPU 就会在整个屏幕上每秒运行这个函数上亿次。简直疯狂。

从 Godot 转过来，原生 GLSL 并没有差很多，只是有些语法上的差异。下面是两种环境下相同的渐变 Shader：

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

**太长不看（TLDR）：**
- `uniform` - 从外部传入的值（不能按像素更改）
- `gl_FragCoord` - 当前像素位置
- `u_resolution` - 画布尺寸。`gl_FragCoord.xy / u_resolution` = 归一化的 UV（0-1）
- `u_time` - 加载以来的秒数
- `u_mouse` - 鼠标位置（像素为单位）
- `gl_FragColor` - 输出颜色（vec4 RGBA）
- `precision mediump float` - “请给我中等精度的浮点数”（WebGL 中必需）

Godot 直接白送了我们 `UV` 并写入 `COLOR`。原生 GLSL 中我们需要自己从 `gl_FragCoord` 计算归一化坐标并写入 `gl_FragColor`。Godot 还会帮我们处理 `precision` 和 `shader_type` 这类样板代码。

来自 Book of Shaders 的最初几个 Shader 之一：

```glsl-live
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
```

非常简单直观，利用 `u_time` 的 `sin` 在 -1 和 1 之间震荡来循环切换颜色，然后把这个值传给 Shader 的蓝色通道。

（在 Web 端和我的博客上把这玩意渲染出来也是件挺好玩的事，感谢 Claude 保佑 ToT）

总之，下一个 Shader 片段也相当简单。`smoothstep` 似乎是画图的主力函数，它返回一个值在某个区间内的进度，但走的是 S 型曲线而非线性——所以 `smoothstep(0.02, 0.0, dist)` 在 `dist` 为 0 时返回 1.0，在 `dist=0.02` 时渐隐至 0.0。反转阈值会翻转输出，因此我们通过给它传入到边缘的距离（distance-to-edge）来绘制抗锯齿形状：

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

在程序化色彩方面，HSB/HSV 比 RGB 直观得多（但里面也有很多神奇的黑魔法）。我们不再是混合三原色，而是从以下角度来思考：

$$
\begin{aligned}
\text{Brightness} &= \max(R, G, B) \\[0.5em]
\text{Saturation} &= \frac{\Delta}{\max} \\[0.5em]
& \scriptstyle{\Delta = \max - \min}
\end{aligned}
$$

其中 $\text{sat} = 0$ 表示灰/白，$\text{sat} = 1$ 则是纯粹鲜艳的色彩。

**色相（Hue）**是色轮上的哪种颜色，它是根据哪个 RGB 通道占主导进行分段计算的。为什么要乘以 6？因为色轮有 6 个色段，每个色段中都是一个通道上升而另一个通道下降：

```hue-diagram
```

计算色相的数学公式是根据哪个通道最大来分段的：

$$
H \times 6 = \begin{cases}
\frac{G - B}{\Delta} + 0 & \text{if } R = \max \\[0.5em]
\frac{B - R}{\Delta} + 2 & \text{if } G = \max \\[0.5em]
\frac{R - G}{\Delta} + 4 & \text{if } B = \max
\end{cases}
\quad \scriptstyle{\Delta = \max - \min}
$$

但我们不能只用 `max()` 来找胜出者，因为我们需要知道是*哪个*通道胜出了，而不仅仅是它的值。分支在 GPU 上很慢（SIMD 锁步执行意味着所有线程都会执行所有分支路径），所以我们使用 `mix(a, b, step(edge, x))` 来代替 `if/else`：

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

反过来，hsb2rgb 则是利用了三角波的技巧：

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

基础版本——x 是色相，y 是亮度：

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

这是极坐标版本，角度代表色相，半径代表饱和度，讲真这个看起来更眼熟：

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

顺便说一句，如果你用过 Minecraft 的光影 Shader（Seus、BSL、Complementary 等）——底层其实全都是这套东西。所有的水面反射、体积丁达尔光（god rays）、草地摇曳、辉光（bloom）效果——都不过是片元和顶点 Shader 在每一帧对每个像素做数学计算。想想挺不可思议的，我们在这里折腾的同款 `smoothstep` 和 `mix` 调用，正是让 Minecraft 看起来像 RTX 光追 Demo 的幕后功臣。

另外，这篇文章顶部的 Banner/Hero 图其实也跑着一个 Shader 呢 :3 在这里给 [paper](https://paper.design/) 点个赞，感谢带来的灵感。

好啦，这篇就先到这里。后续再更新~ :3

~ A.
