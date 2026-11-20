# 19 November 2026 — World News in One Image

[![make.fun](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/Ger-Wer/news-image-19nov/rank.svg)](https://make.fun/bounty/news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/Ger-Wer/news-image-19nov/reward.svg)](https://make.fun/bounty/news-image-20261119)

Entry for the [make.fun bounty "Sum up 19 November's world news in one image"](https://make.fun/bounty/news-image-20261119).

A newspaper front page summing up Thursday 19 November 2026 in five panels:

1. **Summit in Shenzhen** — the first three-way summit of Trump, Xi and Putin; a joint peace declaration signed.
2. **ICJ: genocide verdict** — Myanmar found guilty of genocide against the Rohingya (2017 campaign), a first such ruling against a state.
3. **Tankers hit in Hormuz** — an ADNOC ship attacked, 11 crew hurt, one missing; Iran claims three tankers disabled.
4. **Kerch Bridge hit again** — third strike in four days; traffic halted.
5. **Wall Street falls** — S&P 500 down 2.0%, fifth straight drop; Anthropic IPO sets a record.

## How it is built

`gen.mjs` draws `entry.png` (1024×1024) with pure Node.js standard library only — a hand-written rasteriser, a 5×7 bitmap font and a hand-rolled PNG encoder. No network, no dependencies, no randomness: the output is byte-for-byte deterministic.

`main.ts` copies `entry.png` into `$MAKEFUN_OUTPUT_DIR/entry.png`.

```sh
node gen.mjs
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
