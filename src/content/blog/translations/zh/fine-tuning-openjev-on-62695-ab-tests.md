---
title: "基于 62,695 次 A/B 测试微调 OpenJev"
date: 2026-09-23
tags: [ml, decision-models, calibration, open-weights, benchmarks]
draft: false
description: "我用人们实际跑过的 A/B 测试数据训练了一个决策模型，而不是去问另一个模型“你怎么看”。它有 90% 的概率帮你避开最差的分支，而且我最初测出来的 benchmark 测了个寂寞 lol"
---

现在大概有 300 个基于新型决策模型构建的公开项目，我翻了翻其中专门做“打分与排序”的（一共 26 个），发现它们每一个给内容打分的方式，都只是直接去问模型“你怎么看”。比如在 8 个质量维度上给这篇文章打分、评估这段文案的品味、判断这篇文档是否相关等等，你懂的。

但说真的，这能算数据吗？那不过是模型自己的看法外加贴了个数字而已，说实话整个赛道都是建在这玩意儿上面的。

所以我用有人真正测量过的实际结果训练了一个模型。如果你想试试，权重已经公开了：**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**，Apache 2.0 协议，435M 参数，单次前向传播，专门给简短的说服性文案打分。基座模型是 [`com-kotobalabs/open-jev-deberta-v3-large`](https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large)，它本身就是在类型化决策（typed decisions）上预训练过的 DeBERTa-v3-large。

| Measure | This model | Published SOTA | Humans |
|---|---|---|---|
| Pairwise accuracy, unseen split | **0.812** | 0.544 | ~chance |
| Clean pairs only | **0.797** | - | - |
| Avoids the worst variant | **90.3%** | - | - |

它是用来自 32,487 个随机标题实验中的 62,695 个真实 A/B 测试分支训练出来的，上面列出的每一个数字都来自模型从未见过的数据划分（split）。具体怎么做到的写在下面，包括我最初的 benchmark 完全测了个寂寞的那部分（没错，我现在想起来还是有点不爽）。

## The setup

事实证明，早就有个现成的完美数据集放在那儿了，从 2021 年起就一直公开着。在 2013 年 1 月到 2015 年 4 月期间，Upworthy（没错，就是*那个*发“接下来发生的事你绝对想不到”标题的 Upworthy）针对他们的文章标题跑了 32,487 次随机 A/B 测试。真实流量、真实随机化、5.38 亿次分流展示，后来康奈尔大学把这整套数据以 CC BY 协议发布为 [the Upworthy Research Archive](https://osf.io/jd64p/)。包含每一个标题变体、每一次曝光展示、每一次点击。

在简短的说服性文案领域，这已经尽可能接近 ground truth 了。因为你既有写出来的文案，又有真实人类看到后的实际反应，而且由于分流是随机的，拿来对比才真正具有统计意义。

所以：带有回归头的 ModernBERT-large，目标值是以每次测试自身均值为中心收缩后的 logit 点击率（shrunk logit click rate）。顺便说一句，去中心化非常关键，因为点击率的大部分方差是由*文章本身*决定的，标题根本解释不了这部分方差，所以你真正想要预测的，是一个测试分支偏离其所在测试均值的程度。然后针对该均值进行 Beta-Binomial 收缩（shrinkage），这样只有 600 次曝光的分支主要受先验影响，而有 20,000 次曝光的分支则主要由实际证据主导。

在单张 L4 上跑了 25 分钟，花了大概 4 毛钱。我把 2015 年 1 月之后的所有数据留作测试集，测出来的 **pairwise accuracy 是 0.704**。

作为对比，该数据集上已发表的 SOTA 是 [0.544](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0281682)，由多伦多大学的一个团队在 24,333 对样本上使用人工构建的语言特征得出，他们的论文结论认为这个问题“本质上很困难，而不仅仅是样本量的问题”。让人类来做同样的任务，准确率基本等同于随机猜测；文献中还有一个经过 LoRA 微调的 Llama-3-8B，得分是 0.469，甚至*低于*随机猜测 lmao。

花了 4 毛钱，比公开发表的最好成绩高出 16 个点。于是我顺理成章地写了篇报告，标题就叫：《标题信号历经两年数据漂移依然稳固》。

## And yet

那个标题里的主张是信号能够抵御*漂移*（drift），因为训练数据是 2013 到 2014 年的，测试集是 2015 年的，准确率几乎没怎么动。就好像互联网文化变迁了两年，模型却完全不受影响一样。如果这是真的，那绝对是一个重大发现。这之所以重要，是因为做这一切的最终目的，是打算把模型用在邮件主题行（email subject lines）上。如果它连在同一个媒体内部跨越两年都撑不过去，那显然更不可能跨越到完全不同的媒介上去。

该存档数据集分为三个划分（exploratory、confirmatory、holdout）。我之前是在 confirmatory 上做的训练和测试，所以主要是出于严谨起见，且满心以为能印证自己已经“知道”的结论，我用同一套权重在另外两个划分上也跑了分。

```
confirmatory 2015:  0.704
holdout:            0.637
exploratory:        0.624
```

很好。

两个我从未碰过的划分，在*每一个效应量层级（effect-size tier）*上的差异都在 0.013 以内，而且它们俩都在告诉我：我之前得出的标题数字被虚夸了整整 7 个点。

![Upworthy 存档三个划分上的成对准确率。confirmatory 2015 的折线明显高于 holdout 和 exploratory，而后面两者彼此高度吻合。](/assets/img/blog/decision-models/splits.png)

红线是我之前发出来显摆的那个，下面两条才是真相。

## The time machine that only travels sideways

于是我这次老老实实把存档文档仔细读了一遍，结果发现该数据集给各划分分配测试的方式是**随机的**。不是按时间顺序，而是随机分配。

![两根柱状图。第一根显示干净的时间序列划分，先训练后测试。第二根显示实际结构：训练和测试块交错分布在整个时间段内。](/assets/img/blog/decision-models/split-structure.png)

| Split | Arms | Date range | Share before 2015 |
|---|---|---|---|
| confirmatory | 51,891 | 2013-01-24 → 2015-04-30 | 83.5% |
| holdout | 11,231 | 2013-01-24 → 2015-04-29 | 82.8% |
| exploratory | 10,804 | 2013-01-26 → 2015-04-29 | 83.8% |

所有三个划分都以相同的比例覆盖了相同的时间段。这意味着当我在 holdout 上打分时，我测试的内容中有 83% 来自*训练期内部*。相同的时期、相同的写作风格、相同的一切，只是模型没见过的测试而已，但模型在那上面的表现却依然比 2015 年尾部数据*更差*。

反过来看这其实挺搞笑的，时间几乎没有让模型付出任何代价，而来自同一时期的未见测试却让它掉了 7 个点。我精心设计的漂移测试自始至终测的都只是测试本身的身份识别（test identity），只不过披了一件“时间泛化”的外衣罢了。

我造了一台只能横向穿越的时空机器。

## Two hypotheses, both backwards

显然，接下来的想法就是数据泄漏。Upworthy 会为同一篇文章改写出几十个不同的标题变体，所以如果你是随机划分*测试*，那么一篇文章的各种改写就会散落到所有三个划分中，holdout 应该充满了训练文本的近似副本。

我顺手写了个倒排索引的小脚本，用来测量每个评估标题与模型实际拟合的 38,950 个标题之间的最大 Jaccard token 重合度（之前精确字符串匹配在 650 个样本中只找到了 5 个相同标题，没错，我当时就是据此断定“排除了泄漏”）。

| Evaluation set | n | ≥0.9 overlap | median |
|---|---|---|---|
| confirmatory 2015 | 1,300 | 0.5% | 0.227 |
| holdout | 4,274 | **30.5%** | 0.300 |

30%，比 2015 年尾部数据的污染程度高出 60 倍，然而它的得分却**更低**。

所以数据泄漏解释不了这个差距，方向完全反了。真要说有什么影响的话，那意味着一旦你把这些近似副本剔除掉，真实的 holdout 分数应该比 0.637 *更差*才对。我也测试了这一点：把每对样本的分数导出来切片分析，在真正干净的样本对上，模型得到了 0.646，反而略微*更好*一点，所以近乎重复的样本根本没给它带来任何优势。

行吧，那难道是标签噪声（label noise）？如果 holdout 里的样本对曝光量较少，观察到的胜者往往就不是真正的胜者，这就限制了模型能够达到的最高分。

| Evaluation set | median impressions | median z | median CTR ratio |
|---|---|---|---|
| confirmatory 2015 | 2,462 | 2.37 | 2.24 |
| holdout | 3,096 | 2.64 | 1.99 |

结果又反了 lol。holdout 样本对拥有*更多*的曝光量和*更高*的 z-score，所以它们的标签其实更可信。2015 年的数据集确实有着更宽的中位数点击率比值（2.24 对比 1.99），所以它的样本对确实更容易区分，这是事实，但怎么也构不成 7 个点的差距。

于是我在文档里写了句“原因不明”，然后就翻篇了。0.63 就是最终数字，两个独立的划分都印证了这一点，那个不一致的才是离群值，至于为什么我也说不上来。

**!! 技术细节疯狂输出预警 :3 !!**

## The part that actually mattered

把自己最亮眼的标题成果亲手推翻之后，我觉得至少该把消融实验（ablations）好好跑一遍了。

我本以为数据量会是胜出的关键，因为这是最乏味的先验认知：手里有 62,695 个分支，把第三个划分也塞进训练集，数据变多了嘛。于是我设置了两次运行，一次是在训练集中加入 exploratory 划分，另一次是替换损失函数，两者都在相同的 2,137 对 holdout 样本上进行评估。

```
Phase 0        confirmatory       MSE              0.637
more-data      expl+confirmatory  MSE              0.724
rank           confirmatory       Bradley-Terry    0.775
rank+more      expl+confirmatory  Bradley-Terry    0.787
```

![消融实验结果。增加数据比基线提升了 0.087；切换到 Bradley-Terry 提升了 0.138，最佳运行达到了 0.812。](/assets/img/blog/decision-models/ablations.png)

增加 28% 的训练数据带来了 **+0.053** 的提升，而更换损失函数带来了 **+0.107** 的提升（而且只跑了 2 个 epoch 而不是 3 个，用的还是较小的训练集），优势依然翻了一倍。

事后看来这是显而易见的，最让人懊恼的那种显而易见。评测基准是*成对准确率*（pairwise accuracy），即给出两个标题选出胜者，而我之前却在对点击率做回归。也就是说，我优化的是指标的代理变量，最后却拿指标本身来给自己打分。

[Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) 优化的才是本质。对于单次测试内的每一对分支，你去最大化 `logsigmoid(score_winner - score_loser)`，并用曝光较少那一侧分支的 log 曝光量加权，因为对比的可信度取决于曝光量较少的那一方。我的 38,950 个训练分支就这样变成了 63,597 个同测试内的样本对。

同样的模型，同样的数据，不同的目标函数，差了整整 14 个点。

出于好奇我还跑了 ModernBERT-*base*（参数量只有三分之一），它达到了 0.761。所以这其中的大部分提升来自于目标函数和数据，而不是模型大小。如果你以后想在 CPU 上运行它，这倒是个好消息。

接着就是差点被我错过的那个。我尝试了一个在决策任务上预训练过的 DeBERTa-v3-large 变体，结果在全部 4,804 步中它的 loss 都死死停留在 `-log(0.5)`，最终得分 0.519，跟随机猜测毫无二致，纹丝不动。

很容易把这理解为“DeBERTa 不行”然后直接略过，我差点就这么干了。但是，一条在代表“我完全在瞎猜”的数值上*完全水平*的 loss 曲线是一个极其特殊的特征，模型学得不好通常不是长这样的。Encoder 加载也没问题，只有 classifier 和 pooler 是重新初始化的，这本来就很正常。

罪魁祸首是学习率。DeBERTa-v3-large 在 ModernBERT 适用的 2e-5 下[出了名的不稳定](https://github.com/microsoft/DeBERTa/issues/77)，它需要的学习率更接近 6e-6。而我之前给两个模型用了同一套配置，毕竟谁顺手不这么干呢。

用 6e-6 重跑了一遍，loss 变成了 0.709 → 0.682 → 0.620 → 0.360，最终拿到了 **0.812**，整个项目中的最高分，比 ModernBERT 高出 2.5 个点，在最高置信度层级上甚至达到了 0.913。

我也在它上面跑了近似重复样本的切片分析，因为到了这一步我已经不太敢相信自己了。在真正干净的样本对上（没有任何类似于训练集的内容），它拿到了 **0.797**，而 ModernBERT 是 0.769。而且它的记忆差距（memorization gap）在得分更高的同时反而比 ModernBERT *更小*，这与模型靠死记硬背取胜的表现完全相反。

所以整个系统一直都运行良好，我之前只是搞错了一个数字而已。

## But what does 0.812 actually *mean*

说实话，对人类来说，这没有任何直观意义。这就是把成对准确率当作结论宣传的弊端所在：它说明排序是对的，但完全没告诉你差距有多大。在 81.2% 的情况下把两个标题排对顺序，可能价值千金，也可能分文不值，全看它们实际的差距到底有多大。

所以我去衡量了一个真正负责发文案的人会有什么感受。对于每次测试，取出模型打分最高的分支，将其真实点击率与该测试中所有分支的平均值进行对比。因为如果没有模型，你没有任何理由偏向某一个变体，所以你本来可能发出的内容的平均水平，才是诚实的反事实参考基准。

| | CTR |
|---|---|
| Test mean, no model | 1.20% |
| Model's pick | 1.42% |
| Oracle, perfect pick | 1.60% |

在 2,140 次测试中，这相当于 **+18.3% 的相对点击率提升**。不过，我马上就得把这盆冷水泼回给你。

### The lift number does not travel

18.3% 只是属于 Upworthy 的特定事实。它取决于他们 1.20% 的基准点击率，以及他们的文案写手在各个变体之间拉开的差距。如果把这个模型用到点击率为 2.5% 且变体之间差异更小的 B2B 邮件周报上，这个数字就会发生变化，至于会变好还是变坏我真的无法预测。

真正*具有迁移性*的，是单次测试内部的比率类指标：

| Measure | Value |
|---|---|
| Avoids the worst variant | **90.3%** |
| Beats the test average | 76.6% |
| Picks the actual best variant | 47.7% |
| Headroom captured, median test | 89.2% |
| Spearman, score vs click rate | 0.526 |

**90.3% 才是我真正敢打包票的数字。** 它几乎绝不会让你发出写得最烂的那篇文案，而且这种能力在基准率、受众和媒介发生变化时依然有效，而“+18.3%”就做不到这一点。此外，在通常有 4 到 5 个分支的情况下，47.7% 的 Top-1 命中率大约是随机概率的 2.2 倍。

不过其中有一项有点耍滑头。捕获的潜在提升空间（Headroom captured）中位数是 89.2%，四分位距为 5% 到 100%，而汇总到所有测试中看则是 55.4%。该模型的表现呈双峰分布：在大多数测试中它能拿走几乎所有的潜在收益，但在少数测试中几乎颗粒无收，而这部分测试把整体平均值拉了下来。所以光报中位数有粉饰之嫌，光报汇总数字又低估了典型情况下的表现。

接着我在上面拟合了一个[保序回归](https://en.wikipedia.org/wiki/Isotonic_regression)（isotonic regression），好让打分拥有具体单位，而不是只靠直觉。保序回归非常适合这里，因为它只做单调性假设（分数越高，点击率越高），这正是 Bradley-Terry 所保证的，也是它唯一能保证的，任何参数化方法都是在强行臆造模型从未承诺过的结构。置信区间是通过对*测试（tests）*而非分支进行 bootstrap 抽样得出的，因为单次测试内的分支共享同一篇文章，并非相互独立。

| Score | vs base | 90% interval |
|---|---|---|
| −2.72 | **−19.1%** | [−0.252, −0.209] pp |
| −1.06 | −8.2% | [−0.111, −0.086] pp |
| −0.20 | −0.7% | [−0.023, −0.000] pp |
| +0.56 | +3.7% | [+0.030, +0.056] pp |
| +1.62 | +11.1% | [+0.115, +0.147] pp |
| +2.82 | **+21.8%** | [+0.231, +0.274] pp |

![校准曲线。相对于基线的点击率随模型评分单调上升，90% 置信区间仅在接近中间位置跨越零点。](/assets/img/blog/decision-models/calibration.png)

这意味着你可能发送的最差与最佳主题行之间，存在 41 个百分点的差距。再看看中间那几行，置信区间在那里跨越了零点，这正是模型正确地表明“这两个标题半斤八两，抛硬币决定吧”。一个懂得说*我不知道*的打分模型，价值远高于一个不懂装懂的模型。

## Okay here's where I ruin it

上面所有的数字，全部来自同一家媒体在 2013 到 2015 年间的病毒式社交媒体标题，而我真正想做的是给邮件主题行打分。

这两者根本不是一回事。发给 4,000 名主动订阅用户的 B2B 邮件周报，跟“这个小孩仅用一句话就彻底击垮了反疫苗的所有论点”这种标题几乎没有任何共同之处。不同的媒介、不同的受众、不同的年代，一切都不同。

于是我开始寻找包含真实发送结果测量的公开邮件数据，结果一无所获。

| Source | Size | Availability |
|---|---|---|
| Return Path subject-line study | 9M subject lines | Proprietary, 2015, never released |
| Belkins B2B corpus | 5.5M emails | Aggregate statistics only |
| Yahoo (IEEE 7004277) | 100k+ lines, billions of impressions | Proprietary |
| Oracle's NLORP paper | 300 lines | Scraped off Google, rates not measured |
| Various Kaggle "email campaign" sets | varies | Mock or synthetic |

其中有一篇来自两位 Oracle 首席数据科学家的 arXiv 论文，他们的整个数据集居然是“通过 Google 搜索从多个互联网来源收集的 300 多个不同特惠邮件主题行”。顺便说一句，我不是在嘲讽他们，现实中公开发布的真就只有这种东西。

那些汇总出来的统计结论到处都在传（6 到 10 个词效果最好、打开率最佳长度是 21 到 40 个字符、带数字能提升几个点），但没有一个是单次发送级别的结果数据，也没有一个能用来训练任何模型。

## Which reframes the whole exercise

直到听取了另一位同行的意见把我点醒之前，我一直在用一套自欺欺人的漂亮叙事安慰自己。那个叙事是：*模型架构是平价的大路货，真正持久的壁垒是专有的结果标签*。前半句没错，但后半句纯属扯淡，因为我根本就*没有*专有标签。Upworthy 是公开的，任何拥有 GPU 的人花一个周末、花不到一杯咖啡的钱就能复现我 0.812 的结果，这也是为什么我把权重直接开源的原因之一：它们一共才花了我 4 块钱，我总不能假装这是什么商业护城河吧。

我真正拥有的只是一张入场券。真正的资产应该是一个基于实时流量的持续测量闭环，而这目前还根本不存在。

想通了这点反而豁然开朗，因为它告诉我真正的价值在哪里。我需要的数据正静静躺在各大邮件服务提供商（ESP）的服务器里睡大觉。每一家带有 A/B 测试功能的 ESP 都有数以百万计带有实际测量结果的主题行实验，而几乎没有任何一家在拿这些数据训练模型。所以我需要的不是另一个分类头或另一个 benchmark，我需要的是一个手握这些日志的人。

## The thing this generalises to

这套方法平淡无奇，一句话就能讲完：只要存在测量出来的实际结果，就拿它来训练，别再去问模型的主观意见了。

真正值得强调的是这些结果数据早已存在于何处。你们公司跑过的每一次 A/B 测试，都躺在某个实验平台里，带着标签，附带结果，闲置在那里。Optimizely、Statsig、LaunchDarkly，不管你们用的是哪一家，里面都沉淀了多年“我们试了这五个方案，这个赢了”的数据，却从来没人拿来训练过任何东西。

任何拥有候选集合并能在下游产生数值的地方，同样的方法都适用：

| Decision | The label you already have |
|---|---|
| Subject lines, headlines, push copy | opens, clicks |
| Support macro selection | resolved without escalation |
| Retrieval reranking | which result the user accepted |
| Error message wording | self-served, or filed a ticket |
| Product listing titles | conversions |
| Agent tool choice | did the trajectory succeed |

如果你在构建 Agent，最后一行会很有意思。Jev 的三个原语是 choice、score 和 noul，本文中涉及的一切都属于 `score`，但同样的逻辑也适用于 `choice`，只要有人记录了决策之后发生的事情即可。不过对于目前的绝大多数 Agent 路由来说，还没人在做这件事。

但老实说这里有一个局限：我手头只有这唯一一个数据点。在*某一项具体任务*上，基于结果的训练大幅击败了 zero-shot 的主观评判，但这种优势能否推广到其他领域尚未经过验证。因此我敢押注的是这个方向，而不是具体的数值。

## VERA

**V**ariant **E**valuation from **R**eal **A**nalytics，毕竟每个模型都需要一个强凑出来的缩写名。

**[`NovusEdge/vera-deberta-v3-large`](https://huggingface.co/NovusEdge/vera-deberta-v3-large)**，Apache 2.0 协议。

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

tok = AutoTokenizer.from_pretrained("NovusEdge/vera-deberta-v3-large")
model = AutoModelForSequenceClassification.from_pretrained(
    "NovusEdge/vera-deberta-v3-large")

# Score a set of candidates for ONE piece of content. Higher wins.
enc = tok(candidates, padding=True, truncation=True, max_length=64,
          return_tensors="pt")
scores = model(**enc).logits.squeeze(-1)
```

请将打分作为一个集合来理解，绝不要看单条分数。训练目标是针对单次测试自身均值的偏差，所以单个分数本身没有任何意义；你给它针对某次发送所写的 3 到 6 个变体，它会进行排序。里面还包含一个将分数映射为预期提升率的校准器。

如果觉得 435M 太笨重，还有一个适合 CPU 运行的版本：ModernBERT-base 在参数量仅为三分之一的情况下达到了 0.761。

## What it will not do

迁移到邮件领域，或者说至少我完全不知道它能不能迁移过去。这里的一切都来自同一家媒体在 2013 到 2015 年间的病毒式社交媒体标题，而你的邮件周报很可能跟“这个小孩仅用一句话就彻底击垮了反疫苗的所有论点”八竿子打不着。

所以如果你负责运营一份邮件周报，手头有测过打开率或点击率的历史发送数据，我真心希望能一起探究一下，欢迎联系我，数据始终归你所有。

## The takeaway

该领域的一个开源权重模型在它自己的类型化决策 zero-shot 评测基准上得分只有 0.362，甚至低于 0.461 的多数类基线，所以必须针对特定任务进行微调才能派上用场，仅凭架构本身发挥的作用微乎其微。

而且 0.544 到 0.812 之间的差距也并非源于什么精妙的模型设计：三分之二的提升来自于选择了与指标相匹配的损失函数，剩下的则归功于那 62,695 行有人认真测量过实际结果的数据。所以说，如果你还在靠询问大模型来给数据打标，不妨先去找找现实中的 ground truth，它们很可能早就静静躺在某个角落了。

---

*数据来源：[The Upworthy Research Archive](https://osf.io/jd64p/)。Matias, J., Munger, K., Le Quere, M.A., Ebersole, C. (2021), Nature Scientific Data. CC BY 4.0。因维护团队在 2024 年披露的随机化失效问题，全文均剔除了 2013 年 6 月 25 日至 2014 年 1 月 10 日期间进行的实验。模型权重 DOI：[10.57967/hf/10573](https://doi.org/10.57967/hf/10573)。*
