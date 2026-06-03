## How is generative AI used in this project?
As of 06/03/2026, I'm using a local instance of Qwen (qwen/qwen3-coder-30b) running on a laptop RTX 5060 for codegen. Zoo Code is used to provide tooling. I make no promises about how _intensively_ these tools will be used at this point, but assuming no critical project failures, you should expect code to be at least partially LLM/agent generated. Zoo Code also has a few modes for architecting that I'm evaluating.

I _will not_ use generative AI for any creative aspects of this project - game visuals, sounds, player-facing text, etc. If I have any reason to suspect any assets I've used were generated using AI tools, I will remove and replace them. You should treat this paragraph as a metaphorical canary - if it disappears, then I've lost the battle for my heart and soul, and you should act accordingly.

## Why are AI agents used in this project?
A few reasons, really:
1. One of my career development priorities right now is learning how to use coding agents effectively. Given the state of the industry and my LinkedIn feed (🫠), all evidence points towards a skeptical, cautious approach getting the best results. Less woo and fud going forwards, please!
2. The best use case, if you ask me, is putting a developer in a mental state where she can't justify skimping on the real engineering - planning, design, testing, etc. So far, it seems like there's ways to use generative AI tools towards that end, but it's going to take lots of research and practice to fully figure that out.

### Why local AI agents in particular?
This is primarily an economics question. Now that companies are switching to usage-based pricing, using one of the big cloud-based providers (Microsoft, Anthropic, OpenAI, etc.) means you risk burning vast amounts of cash and electricity if you run one of the complex multi-agent workflows that seem to be in vogue these days. Depending on who you've chosen, you also risk directly funding a bunch of weird right-wing extremists. If you'd like to learn more about that, look at Timnit Gebru and Émile P. Torres' work on the TESCREAL bundle.

I don't have a computer (or datacenter) that's capable of running the largest and most capable agent workflows, but I figure expert use of smaller, more specialized tools sets me up for more success in the long run. Plus, running locally means I'm more likely to study the machine learning work that underlies this entire field.

## Errata
If this document gets stale (i.e, I haven't updated it recently), feel free to drop me a line and ask me where I'm at!