---
title: "一天搞定两道千禧年难题（大概）"
date: 2026-11-21
tags: [ai, math, lean, commentary]
description: "11 月 20 日，AI 辅助完成的 Riemann Hypothesis 和 Navier–Stokes 爆破解证明双双发布，就在三周前，两家实验室才刚刚各自独立推翻了 Exponential Time Hypothesis。本文盘点一下过去几个月 AI 在数学领域的狂飙，以及究竟有哪些成果是真正经过核验的。"
toc: true
pixel: thinking
---

## Friday

11 月 20 日，Terry Tao 发了一篇[博文](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/)，标题读起来就像一串在我有生之年本不该发生的事："Unforced Euler singularity, unforced Navier-Stokes singularity, and the Generalized Riemann Hypothesis"。这三项成果全在那天出炉，全都深度借助了 AI，而且都署着同一个人的名字：Anthropic 的数论学家 Levent Alpöge。

其中有两项属于 Clay Millennium Prize 难题。这类难题一共七道，每道奖金一百万美元，26 年间刚好只有一道被解决（Perelman 解决了 Poincaré 猜想，还把奖金拒了）。现在可能一下子变成了三道，而且其中两道是在相隔几个小时内相继冒出来的。

这一切目前都还没得到最终确认，我稍后会聊聊这里的“确认”到底是什么意思。但这也绝非凭空发生。过去几个月一直在为此做铺垫，整套过程很值得盘一盘。

## 我们是如何走到这一步的

简短说一下背景。大部分内容来自 Wikipedia 的 [AI 数学发现列表](https://en.wikipedia.org/wiki/List_of_mathematical_discoveries_made_with_artificial_intelligence)，上面的 2026 年条目现在多得让人有些发懵。

{{timeline}}

蓝色表示已由人工或 Lean 核验，琥珀色表示正在等待核验，红色则表示存在争议或已被部分撤回。Ehrhart 相关的结果只涵盖了上界，等号成立的情况仍未解决。10 月份的论文大约有一半附带了 Lean 代码，其中有三篇在一天之内就被撤回了。

10 月 6 日的那件事值得单独写一篇文章。OpenAI 用一个尚未发布的模型，一口气推出了涵盖数百个主题的 722 篇手稿。Alpöge 称其“显然是数学史上最重要的时刻”，Sarnak 则表示在人类核验之前他不会把其中任何一条称为定理，而部分 Lean 代码后来被证明证明出的结论比论文声称的要弱。仅仅六周之后，这个“最重要的时刻”恐怕就已经只能排第三了。

## ETH

Exponential Time Hypothesis（指数时间假设）大致是说，3-SAT 问题无法在实质上比暴力搜索快多少。如果你有 n 个变量，就需要大概 2^(cn) 级别的时间。它虽然不如 P vs NP 出名，但很多复杂度理论都是建立在它之上的，因为“在 ETH 假设下，该问题至少需要 X 的时间”是证明大量下界的核心方法。

{{eth_figure}}

10 月 16 日，两家实验室在同一天发现它是假的。OpenAI 的文章题为“The Exponential Time Hypothesis Is False”，并写道“我们的系统最近证明了 ETH 为假”，次日就给出了一个 [Lean 证明](https://openai.com/index/building-scientific-understanding-with-academic-communities/)。Anthropic 的论文《A 2^o(n) Time Algorithm for 3-SAT》也在差不多同一时间发表，称两项结果“独立且同步”，并指出[“Claude 在没有人类干预的情况下找到了核心算法”](https://www.datacamp.com/blog/ai-exponential-time-hypothesis)。Anthropic 还声称这连带干掉了 Strong ETH。

当年*提出* ETH 的学者之一 Russell Impagliazzo 称其“令人极度意外”。他现在正与 Ramamohan Paturi 以及 Ryan Williams 共同领导审核小组进行核验。Williams 表示大部分内容看起来都很常规，除了几处：

> “两三处看起来宛如外星产物的部分。”
>
> — Ryan Williams 谈 ETH 证明

“看起来像外星产物”，这真是一位复杂度理论学家能对证明做出的最有 2026 年色彩的评价了。

需要明确的是，这并不是说 P = NP，而且据报道，这种加速在实际中只有在包含数百万变量的公式上才有意义。但两套独立的 AI 系统在同一周发现了同样的东西，这本身就是一种明证。这就好比那个想法一直就摆在那里，而模型终于足够强大，能够看清它了一样。

## Navier–Stokes

Navier–Stokes 千禧年难题探讨的是：三维流体的光滑初始条件是否始终保持光滑，还是说解会在有限时间内发生爆破（blow up）。证明其中任何一种情况都能拿奖。

{{ns_figure}}

9 月，OpenAI 声称证明了爆破，但针对的是*受迫*（forced）版本，也就是说存在推动流体的外力。《Scientific American》称这种外力“不切实际、经过精心微调”，而且它并不是 Clay 问的那个版本。这还引发了一场争端。一直在与 Alpöge 研究同一问题的 Tristan Buckmaster 表示，OpenAI 的第一个 prompt 是在[关于他们工作的信息传到该公司几天后](https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/)才发出的。当他在电话中询问该模型是否在他们的 Codex 会话数据上训练过时，他说：“我没有得到回答。”据他所说，OpenAI 还两次施压要求将 Alpöge 从作者名单中剔除，因为他在 Anthropic 工作。OpenAI 否认有任何不当行为，而这全都是 Buckmaster 单方面的说法，但这内幕确实够戏剧性的。

20 日，Alpöge 和 Buckmaster 发布了他们自己的成果：*无外力*（unforced）三维方程的有限时间爆破，也就是真正的那个难题。成果包括一篇 79 页的论文以及 [Lean](https://github.com/tristanbuckmaster/navier-stokes/) 代码。Tao 表示其策略“大致清晰”：一个数值上的近似自相似解，加上围绕它的严格微扰理论。他也表示“还需要做更多工作才能给出一份规范、专业的书面证明”。目前还剩下两个实际缺口：该证明所依赖的数值证书尚未公开，目前只有它的哈希值；而且 README 本身也写着“组装此仓库时未重新构建补丁包”，因此 Lean 构建尚未得到确认。

## The Riemann Hypothesis

{{rh_figure}}

这就是大家都在发帖热议的那个了。Alpöge 在他的个人网站上放了一篇名为 [Remark](https://alpo.ge/remark.pdf) 的四页 PDF：

> 我相信，在与 Claude 的合作下，我已经找到了 Riemann Hypothesis 的一个证明。事实上，该方法很容易进一步推广，解决所谓的 Generalized Riemann Hypothesis，而且我预计，只要有更多时间，Extended Riemann Hypothesis 也能迎刃而解。

证明藏在一个脚注链接里，指向 14 个打包的 tarball 分卷，总计 239 MB，包含约 175,000 个 Lean 文件。没有论文。他说人类可读的版本“写起来很常规”，并在另一个脚注中透露他确实生成了一份，结果“超过了 250,000 页”。当他翻开 Claude 的这本“大部头”看到定理 1 时，开头写着：由于实数是全序的，如果 σ ≠ ½，那么 σ > ½ 或 σ < ½。他觉得把这玩意儿发出来会成为“某种庞大到无法阅读的劣质‘废料’”，于是最终只公开了 Lean 代码。

{{proof_scale}}

这份笔记也是我见过数学家在文字中表现得最兴奋的一次。他说自己从学生时代起就在筹划攻克这个难题，将研究引导到了合适的方向，然后：

> “临近终点线时，Claude 远远超过了我。不，在终点线附近，Claude 是在飞翔、在起舞、在闪闪发光。”
>
> — Levent Alpöge, Remark

他举出的唯一具体例子是串联 theta 提升（theta lifts），以模仿 Stepanov 在函数域上证明 RH 时的“重数”（multiplicity）技巧。对于长度为 X 的素数和，Claude 建议使用长度为 √X 的链。“（然而，除此还能是什么呢？）”他坦承自己“对高阶群上的自守形式几乎一无所知”，而论证的大部分内容恰恰就在这里。第 3 页上的 20 步时间线是 Claude 做出的总结，他警告说这“可能完全不知所云”。时间线从 10 月 6 日一直延伸到 11 月 16 日的最后一步，上面只写着简短的“GRH”。

这里面还有一段挺有意思的跨实验室插曲。他称赞了 OpenAI 在选题上的“好品味”。他说，正是在推导他们 Ehrhart 结果中等号成立的情况时，自己“立刻意识到 Navier-Stokes 也要被攻破了”。他还看出对方的 Siegel 论证实质上是“没有重数的 Stepanov”，而 theta 提升恰好填补了这一空白。所以，AI 数学竞赛并不是泾渭分明的一家实验室对抗另一家。大家都在阅读对方模型的输出，并在此基础上继续推进。

## 这是真的吗

截至发稿时，情况看起来很乐观。根据专门搭建用来核验的[独立镜像](https://github.com/Deicyde/riemann-hypothesis)，Lean 的顶层定理是直接对照 Mathlib 自身对 `RiemannHypothesis` 的定义表述的，旁边还附带了针对 Dirichlet L 函数的 GRH。MIT 的 Andrew Sutherland 亲自进行了编译，并告诉 Scientific American [“老实说，这里面有猫腻的概率基本为零”](https://www.scientificamerican.com/article/the-ai-riemann-hypothesis-proof-is-almost-certainly-true-independent-mathematicians-attest/)。Kevin Buzzard 的回应则是“我们仍在等待 Comparator 成功跑通一次”。

{{lean_statement}}

Buzzard 的提醒才是关键所在。Comparator 会将证明与独立编写的定理表述进行对照，并列出其使用的所有公理。Lean 会允许编译一个悄悄预设了自身待证目标的文件，只要该假设被显式声明即可。一次无瑕疵的运行意味着只使用了 Lean 的三条标准公理，这样一来，唯二的漏洞就只剩 Mathlib 的定义 bug 或 Lean 内核 bug。对于一个被如此多人审阅过的定理表述来说，这两种情况都极不可能发生。

如果 Comparator 跑完确认没问题，我们就会处在一个很奇妙的境地。Riemann Hypothesis 将成为一条真正的定理，而唯一的完整证明却从未有人读过，甚至可能没有人能读懂。Clay 的评奖规则要求有同行评审的出版物以及两年的学界认可，而当年制定规则时，可没人料想到会有 239 MB 的 tarball 这种东西。

## 局势会如何发展（推测）

以上内容均是已公开的声明和核验情况。本节纯属个人猜想，请自行权衡参考。

**规律模式。** 把这些结果排在一起，相同的模式便一再浮现：人类选定问题并引导至正确的方向，随后模型在人类最不熟悉的领域承担了技术上的重活。Alpöge 在提到高阶群上的自守形式时坦率地承认了这一点。输出的体量大到无法阅读：RH 有 175,000 个 Lean 文件，Navier–Stokes 有大约 2,270 个文件和 60 万行代码，还有一本没人会去翻开的 25 万页“大部头”。因此，Lean 最终成了唯一的审稿人。当两家实验室在同一天得出相同的 ETH 算法时，这看起来就不太像是天才灵光一现，而更像是某种能力门槛被跨越了。那些想法一直静静待在那里，等待着足够强大的工具去触碰它们。

**节奏频率。** 7 月还只是一个猜想的反例。到了 11 月，就变成了两道千禧年难题。前后不过五个月。我不会仅凭九个数据点就去外推曲线，但千禧年难题只剩下四道了（P vs NP、Hodge、Yang–Mills 和 Birch–Swinnerton-Dyer），要是 2027 年有人声称又解决了一道，我绝不会像一年前那样感到震惊。

**如果一切属实，会有什么改变。**

- 文献中所有“假设 GRH 成立”的前提都将直接转变成不打折扣的定理。教科书级的例子是 Miller 素性测试，自 70 年代以来，*只要* GRH 成立，它就是确定性的多项式时间算法。
- 检验证明的难点从证明本身转移到了命题表述上。一旦 Lean 接受了证明，剩下的问题就是它证明出的定理是否符合我们的本意。字斟句酌地通读 30 行定义将成为新的审稿方式。
- 理解开始滞后于真相。我们可能会在知道 RH 属实后的很多年里，都无法用人类大脑能装得下的方式解释其缘由，而 Alpöge 所说的“后续将给出简短论证”正是在赌这个鸿沟能很快填平。
- 归属权变得剪不断理还乱。Buckmaster 的争端就是一次预演：这究竟是谁的想法、谁的模型、谁的数据？Clay 的规则、同行评审规范以及署名惯例，全都是为一个“作者自己能把证明讲清楚”的世界量身定做的。
- 数学家的工作重心转向挑选问题、品鉴品味以及构建理解。Alpöge 的笔记中不断称赞两家实验室的“好品味”。也许这才是如今数学家该干的事。

即便 RH 证明没能通过 Comparator 的检验，这一切论断依然成立。哪怕它崩了，ETH、zeta 零点结果以及 7 月份的成果依然摆在那里，而且这种模式在周五之前就已清晰可见。

## 接下来的看点

- Comparator 对 RH 的最终裁定，以及第二次独立构建。
- Navier–Stokes 证书的公开，以及一次干净的 Lean 重建。
- Impagliazzo–Paturi–Williams 对 ETH 的裁定结果。
- Alpöge 承诺的正规长文，以及他预计将“相当快”给出的更简短证明。

Alpöge 的笔记以这样一句话结尾：“在数学发生革命的时代，我希望该论证能让大家窥见前方奇迹的一角。”一年前，这读起来大概会被当成民科的狂妄致辞，而如今，它听起来就像一份合情合理的预报。
