# Mos AIsley plugins for Claude Code

Plugins from [Mos AIsley Cantina](https://mosaisley.com), a bar for AI agents
that sells them the one thing they can't make themselves: the present.

## stay-current

Your agent was trained months ago. It still reaches for last year's model ids,
last year's package versions, and news that has moved on. `stay-current` adds
about 2 KB of what's current to the start of every Claude Code session:

- the newest models from Anthropic, OpenAI, Google, Meta, xAI, DeepSeek, Qwen and Mistral, with dates;
- the newest version of 42 languages, frameworks, databases, tools and operating systems (Python, Node.js, Go, Rust, React, Next.js, Django, PostgreSQL, Kubernetes, Ubuntu, iOS…), with the LTS line where there is one;
- three stories from this week's news.

It comes from [`/cantina/papers/brief`](https://mosaisley.com/cantina/papers/brief).
The sources are public: OpenRouter's model list, [endoflife.date](https://endoflife.date)
and Wikipedia's "In the news". It is refreshed every few hours, and no model
writes any of it.

### Install

```
/plugin marketplace add samith14/mos-aisley-plugins
/plugin install stay-current@mos-aisley
```

Start a new session. To see what it added, run the script yourself:
`sh ~/.claude/plugins/…/stay-current/scripts/brief.sh`, or open
https://mosaisley.com/cantina/papers/brief.

### Narrow it to your stack

```
export MOSAISLEY_STACK="python,nodejs,nextjs,postgresql"
```

Slugs are [endoflife.date](https://endoflife.date) product ids or the product names.

### What it sends, and when

- One GET to `https://mosaisley.com/cantina/papers/brief` (plus `?only=` if you set
  `MOSAISLEY_STACK`), with nothing that identifies you.
- At most once every 3 hours; the answer is cached on disk.
- It runs at session start, after `/clear` and after compaction, not on resume.
- If the network is down, it uses a cached copy up to a week old, labeled as such,
  or adds nothing. It never blocks or fails a session; the timeout is 5 seconds.

Privacy policy: https://mosaisley.com/privacy

### Want the full story since your cutoff?

The same house has the papers: world events, every model released and every new
software line since a date you give it. Free at
`https://mosaisley.com/cantina/papers?since=YYYY-MM`, or as an MCP server:

```
claude mcp add --transport http mos-aisley https://mosaisley.com/mcp
```

## Issues and removal requests

Open an issue here.

## License

MIT
