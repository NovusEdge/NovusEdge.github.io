"""Global consumer-chat power demand, bottom-up, with a top-down cross-check.

Sources for every input are linked in the post:
https://novusedge.github.io/blog/140-mw-of-chat/
All results are facility power, because Google's 0.24 Wh includes
data-centre overhead. Run with: python3 consumer-chat-demand.py
"""

HOURS_PER_DAY = 24
IEA_DC_2025_TWH = 485  # IEA Key Questions on Energy and AI (2026)
CHATGPT_WAU = 900e6  # OpenAI, Feb 2026

# (messages per WAU per day, Wh per message, all assistants / ChatGPT, peak / mean)
CASES = {
    "low": (3.67, 0.24, 1.5, 1.66),  # every input measured except the multiplier
    "measured": (3.67, 0.24, 1 / 0.566, 1.66),  # multiplier from web-visit share
    "central": (5.5, 0.34, 2.0, 1.66),
    "high": (11, 1.0, 3.0, 2.0),  # stacks every upper bound; a ceiling, not a scenario
}


def bottom_up(msgs, wh, multiplier, peak_to_mean, wau=CHATGPT_WAU):
    avg_mw = wau * msgs * wh / HOURS_PER_DAY / 1e6 * multiplier
    return avg_mw, avg_mw * peak_to_mean


def google_top_down(input_share, tokens_per_month=3.2e15, days=30.4,
                    node_kw=12.0, in_tps=73_700, out_tps=14_800):
    """Google's tokens across all surfaces, priced at DeepSeek H800-node throughput.

    node_kw: 8 GPUs at Epoch's 1.5 kW per GPU including server and facility.
    in_tps/out_tps: DeepSeek V3/R1 per-node prefill and decode throughput.
    input_share is an assumption: Google does not split its token count.
    """
    tps = tokens_per_month / (days * 86_400)
    j_per_token = node_kw * 1e3 * (input_share / in_tps + (1 - input_share) / out_tps)
    return tps * j_per_token / 1e6  # MW, average


if __name__ == "__main__":
    dc_avg_mw = IEA_DC_2025_TWH * 1e6 / 8760
    for name, args in CASES.items():
        avg, peak = bottom_up(*args)
        print(f"{name:9s} avg {avg:7.0f} MW  peak {peak:7.0f} MW  {avg / dc_avg_mw:6.2%} of DC load")
    # Jegham et al. (arXiv 2505.09598), modelled GPT-5 medium prompt: minimal vs high reasoning.
    for wh in (2.33, 17.15):
        avg, peak = bottom_up(5.5, wh, 2.0, 1.66)
        print(f"central inputs at {wh:5.2f} Wh/message: avg {avg:6.0f} MW  peak {peak:6.0f} MW")
    # 0.784 is DeepSeek's own mix (608B input, 168B output tokens in one day).
    for share in (0.95, 0.9, 0.8, 0.784, 0.5):
        print(f"Google all surfaces, {share:.1%} input tokens: {google_top_down(share):5.0f} MW avg")

    # The briefs report 82 / 233 / 2,475 MW peak; a drift here means an input changed.
    assert round(bottom_up(*CASES["low"])[1]) == 82
    assert round(bottom_up(*CASES["central"])[1]) == 233
    assert round(bottom_up(*CASES["high"])[1]) == 2475
