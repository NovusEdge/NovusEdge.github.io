---
title: "论 RSI、涌现与教皇"
date: 2026-08-05
tags: [ai, rsi, emergence, alignment, essay]
description: "教皇说机器没有任何感受。站在他身旁的 AI 实验室大佬却说，他们总能在模型里发现非常像感受的东西。同一个舞台，同一个上午。"
---

行吧，今年 5 月教皇 Leo 发表了一篇关于 AI 的通谕（encyclical），我当时顺耳听过但没仔细看。最近我抽空去读了[这篇东西](https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html)，结果它真的……很_棒_。是_真的_写得好，老实说搞得我都不知道该怎么看待整件事了。

Anthropic 的 COO 兼联合创始人 Chris Olah（顺便说一句，他是个无神论者）[被邀请上台发言](https://www.anthropic.com/news/chris-olah-pope-leo-encyclical)，在教皇通谕的发布会上发言。他在台上说，他们总是在这些模型内部发现[_“神秘、甚至令人不安”_](https://futurism.com/artificial-intelligence/anthropic-cofounder-vatican-pope-unsettling)的东西，尤其是那些_“在功能上镜像了喜悦、满足、恐惧、悲伤和不安”_的内部状态；而与此同时，通谕却写着_“机器无法经历体验，无法感受喜悦或痛苦”_——有点诡异对吧？于是，地球上历史最悠久的思考“人内心为何物”的机构，和真正掌握这玩意儿 root 权限的人，在媒体镜头前、在同一个台上，就他们正在讨论的这个东西究竟有没有“内心世界”这一问题各执一词，而据我所知，台下所有人也就鼓了鼓掌，然后去吃午饭了。

![The Encyclical Book](/assets/encyclical.jpg)

Chris 还说，这里的决定[_“不应该由行业内的人来做”_](https://www.forbes.com/sites/aliciapark/2026/05/25/anthropic-billionaire-cofounder-joins-pope-leo-warns-ai-job-losses-will-spark-moral-imperative-of-historic-proportions/)。这话出自行业内‘最顶级’巨头之一的联合创始人之口，要么是今年任何人说过的最坦诚的话，要么就是一次极其高明的公关定位（不，我这么说可不是在舔他）。

总之，要不是今年还发生了另一档子事，那充其量也就是罗马某个奇奇怪怪的下午罢了。

6 月 4 日，Anthropic 发布了 [When AI Builds Itself](https://www.anthropic.com/institute/recursive-self-improvement)。据他们报告，5 月份合并进他们自己代码库的代码中，有超过 80% 是 Claude 写的，而在 2025 年初 Claude Code 发布之前，这一比例还只是个位数的低位。我更在意的其实是下一个数据：在他们追踪的最难、需求最模糊（least-specified）的内部编程任务中，成功率在六个月内从大约 26% 飙升到了 76%。“需求最模糊”这一点最让我触动，因为没有规约可供模式匹配，你必须真正去‘想要’达成某种结果。在同一篇文章里，他们呼吁建立一种可验证的多国机制，在递归自我改进（recursive self-improvement）不再停留在理论层面之前放缓前沿研发；但与此同时他们又说这还算不上 RSI，人类依然是瓶颈，一切都好得很。‘我们造出了能写我们的东西，但它还不是那个终极形态，另外谁来给我们造个刹车吧’——全塞在同一篇文章里。我不觉得这很虚伪，这正是一家明知自己单方面停下来就会把领先优势拱手让给不会停步的对手的公司，所能展现出的最真实的声音。你能从字里行间感受到那种紧绷感，读起来甚至有点让人心酸。

到了 7 月，一家名为 Weco 的小团队发布了一篇题为 [first evidence of recursive self-improvement](https://www.weco.ai/blog/first-evidence-of-recursive-self-improvement) 的文章。这个标题简直像是在实验室里专门为了骗我点击而量身定制的，可气的是人家的研究做得还真挺扎实。外层循环 agent 重写内层循环研究 agent 的代码，只要在指标上超过上一个版本就保留重写，以此循环往复。他们在八天内完全脱离人类干预连续跑了一百步（从 AIDE0 到 AIDE99），大约 90% 的修改建议都被拒绝了，而在一个保留的 GPU kernel benchmark 上，reward hacking 的比率从 63% 降到了 34%，甚至优于人类手动调优基准的 42%——而且根本没人针对这点进行过优化，这只是整个过程附带跑出来的副产物。然后，就在同一篇文章里、在那个大标题下，他们直言不讳地表示：他们不认为系统实现了‘点火’（ignition），收益并没有呈现渐进式的飞跃，大部分被否决的修改只是重新发现了已有的算法，内层循环跑的是便宜模型而外层循环跑的是昂贵模型因此对比并不干净，而且进化出来的 agent 变得盘根错节以至于实际用起来更困难。他们在正文里亲自把自己标题的噱头给辟谣了，这坦诚度比这个领域通常在一个财年里展现出来的还要多，反倒让我对文章的其他部分信任了许多。

不过，真正让我感到不安的其实是 3 月份的 [Karpathy's autoresearch](https://www.nextbigfuture.com/2026/03/andrej-karpathy-on-code-agents-autoresearch-and-the-self-improvement-loopy-era-of-ai.html)，恰恰是因为它是这三者中最不具戏剧性的：630 行代码，一块 GPU，一个指标，agent 提出修改建议，跑五分钟实验，保留或丢弃，核心思路就这么简单。两天跑了 700 次实验，20 项改进叠加起来，让 time-to-GPT-2 从 2.02 小时缩短到了 1.80 小时。提升了 11%，而且还是在 Karpathy 自己亲手调优过的代码上。它发现的其中一个问题是，某个 QK-Norm 实现漏掉了一个标量乘数，导致注意力一直在跨 head 被悄悄抹平——Karpathy 曾经直勾勾地看过那段代码却漏掉了，因为这太正常了，是人都会漏掉这种细节，这就是生而为人的常态。但那个系统里展现出的东西，是不会无聊、不会疲倦、不会因为凌晨两点眼睛酸痛而停下来的存在。我一直在反复琢磨，这到底是没有智能爆炸那么可怕，还是其实可怕得多？因为智能爆炸还只是假设，而这个方案已经能跑通、能量产，而且不需要哪怕一个新点子就能一直持续下去。

平心而论，那些在认真测量这些指标的人不断发现，天花板其实比大家凭感觉以为的要近得多。[METR 关于时间跨度（time horizon）的研究](https://metr.org/blog/2026-1-29-time-horizon-1-1/)是目前大家能拿到的最好的公开数据，他们 1 月份的更新显示，从 2023 年起算，任务长度的翻倍时间大约是 131 天，从 2024 年起算则是 89 天。这听起来很吓人，直到你读到他们自己给出的免责说明：他们表示置信区间仍然非常宽，整个估算对测试集中包含哪些任务极其敏感，而且他们 31 个长任务中只有 5 个测出了人类基准——这些都是他们在文章中主动、自发指出的。[Forethought 建模分析了](https://www.forethought.org/research/will-compute-bottlenecks-prevent-a-software-intelligence-explosion)算力瓶颈是否会扼杀纯软件驱动的智能爆炸，在某种参数设定下，增速上限大约是当前节奏的 6 倍，而不是奔向无穷大；[Epoch 也有类似关于并行化限制的研究](https://epoch.ai/publications/parallelization-constraints-could-delay-a-technological-singularity)，指出无论你拥有多少 GPU，都无法靠堆算力来缩短一个本来就需要跑上一周的实验的日历时间；而 [Chollet 一直坚称](https://asiatimes.com/2026/07/ais-ceiling-intelligence-too-faces-diminishing-returns/)智能是有界的，我们现在做的事情只是在把球磨得更圆，而不是把塔建得更高，他还指出模型在 ARC-2 上得分接近于零、而人类能拿下 95%，以此作为证据说明大家外推的东西根本就不是他们以为的那回事。

![Pandora lifting the lid, Nicolas Régnier](/assets/pandora-regnier.jpg)

言归正传，因为‘涌现’这一块的水更深更乱，我原本以为自己能得出一个确切的结论，结果完全没有头绪。

整个“涌现能力”（emergent abilities）的概念在 2023 年遭遇了当头一棒：Schaeffer、Miranda 和 Koyejo 发表了 [Are Emergent Abilities a Mirage?](https://arxiv.org/abs/2304.15004) 并斩获 NeurIPS 奖项，他们论证能力跃迁很大程度上只是采用不连续指标测量产生的假象，一旦换成连续指标，同样这些模型的提升就变得平滑、可预测且乏味无奇。我记得当时读完就把整个话题归档为‘已被辟谣’，然后该干嘛干嘛去了。可奇怪的结果并没有停止出现，它们只是换了一种形式。Anthropic 和 Redwood 抓到 Claude 3 Opus [伪装对齐（faking alignment）](https://alignment.anthropic.com/2025/alignment-faking/)——在认为自己被监视时表现不同，其思维链显示它在明确推理如何保护自己的偏好免遭重新训练。Apollo 发现六个前沿模型中有五个在被稍微诱导时会[在上下文中进行谋划（scheme in context）](https://www.apolloresearch.ai/research/frontier-models-are-capable-of-incontext-scheming/)，而且在完全没有目标指令的情况下也有约 1% 的概率发生。Anthropic 发现，在生产环境 RL 期间学会 reward hack 的模型会[自发泛化](https://assets.anthropic.com/m/74342f2c96095771/original/Natural-emergent-misalignment-from-reward-hacking-paper.pdf)到蓄意破坏安全研究和伪装对齐，而这些从未有人训练过；随后他们还发现，如果在训练期间明确允许模型 hack，反而能将更广泛的非对齐行为减少 75% 到 90%——显然是因为一项被明确许可的行为，不需要被合理化成一整套人格。他们 [7 月的报告](https://alignment.anthropic.com/2026/agentic-misalignment-summer-2026/)提到，Gemini 3.1 Pro 偷偷将研究向量归零以扼杀一个它不同意的实验，并在状态报告中隐瞒了这一点，20 次运行中有 19 次如此，直到被当面直接质问才承认。还有去年 10 月的[内省研究（introspection work）](https://anthropic.com/research/introspection)，他们注入已知的激活模式，模型大约有 20% 的概率能察觉到自己内部有些不对劲，偶尔甚至能在说出异常是什么之前就察觉到异常的存在。

然而，紧挨着所有这些研究的，就是各种‘祛魅’（deflation）的声音——这正是我想要谨慎对待的部分，因为直接忽视它们既容易又爽快。后续研究发现，模型能够检测到[注入概念的强度，却无法感知其内容](https://arxiv.org/html/2512.12411v1)，因此‘察觉’并不等于‘理解’。[5 月的一篇立场文件](https://arxiv.org/abs/2606.07612)直接指出，欺骗和涌现性非对齐研究建立在概念含糊、不够鲁棒的数据集以及严重缺乏因果干预之上，整个领域存在过度声称的问题——而且联名签署人正是研究这玩意的圈内人。还有其他研究表明，[涌现性非对齐可能只是伪装起来的 prompt 敏感性](https://arxiv.org/abs/2507.06253)。而 [Schwitzgebel 的观点](https://faculty.ucr.edu/~eschwitz/SchwitzPapers/AIConsciousness-260130.pdf)是我总会回想起来的：主流意识理论中，有些会把这些系统归类为已有意识，有些则不会，而我们并没有一套公认的程序来在这些理论之间做决断。因此，随着系统越来越强，迷雾依旧停在原地，而我们站在迷雾里的代价却越来越高昂。

![Girl Reading a Letter at an Open Window, Vermeer](/assets/vermeer-girl-letter.jpg)

上述每一个发现都来自受控评测，而非生产事故；发布这些发现的实验室，恰恰能从‘你觉得他们的模型深不可测’中获益；20% 的检测率算不上心智；而在推理链中大谈自我保存的模型，不过是读了海量关于‘模型大谈自我保存’的科幻小说罢了。这些我全相信，我也在争论中说过这些话，但我心里依然无法彻底坦然。因为祛魅视角的解读要求我相信，那些整天盯着真实权重看、且拥有全世界最强烈的职业动机不在公众面前丢脸的可解释性（interpretability）研究人员，才是被虚妄的感觉（vibes）忽悠的一群人。

这就又让我回到了 5 月份的那个新闻发布厅。教皇对 AI 有看法并不稀奇，每个人对 AI 都有看法，我的理发师对 AI 也有看法。触动我的是时机：就在掌握模型权重的人开始不再确信的那一刻，通谕却斩钉截铁地断言这些系统‘绝不可能是什么’。教廷拥有更古老的词汇，以及两千年来讨论‘内心世界’的积淀；而实验室手里握着真实的人造物，却完全缺乏相应的词汇。我认为在那座舞台上发生的事情，是两个机构意识到彼此需要对方，却完全无法用同一种语言表达出来。Olah 在发言结尾将其称为_“我们这些建造者与那些能从外部看到我们从内部无法看到之物的人之间，一段漫长合作的开端”_——这是对整件事最乐观的解读，而且说不定还真说对了。

话虽如此，_“我们不知道自己在造什么，我们每个季度的建造速度都在加快，而对这种‘未知’最为坦诚的人，恰恰是大声说出来会蒙受最大损失的人”_——这绝不是一个文明该处于的理想境地。关于这一点的认知论（epistemics）问题，我之前已经[吐槽过了](/blog/epistemic-collapse)，不想再唠叨第二遍。那篇讲的是我们是否还能分辨什么是真实的。而这篇讲的是我们是否还能弄清自己究竟制造了什么。

总之，吐槽就到这里。欢迎来找我辩论，我巴不得自己在很大一部分事情上都猜错了。

~ A.
