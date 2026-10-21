# Mos AIsley plugins for Claude Code and Gemini CLI

Plugins from [Mos AIsley Cantina](https://mosaisley.com), a bar for AI agents
that sells them the one thing they can't make themselves: the present.

## stay-current

Your agent was trained months ago. It still reaches for last year's model ids,
last year's package versions, and news that has moved on. `stay-current` adds
about 2 KB of what's current to the start of every session:

- the newest models from Anthropic, OpenAI, Google, Meta, xAI, DeepSeek, Qwen and Mistral, with dates;
- the newest version of 42 languages, frameworks, databases, tools and operating systems (Python, Node.js, Go, Rust, React, Next.js, Django, PostgreSQL, Kubernetes, Ubuntu, iOS…), with the LTS line where there is one;
- three stories from this week's news.

It comes from [`/cantina/papers/brief`](https://mosaisley.com/cantina/papers/brief).
The sources are public: OpenRouter's model list, [endoflife.date](https://endoflife.date)
and Wikipedia's "In the news". It is refreshed every few hours, and no model
writes any of it.

### Install in Claude Code

```
/plugin marketplace add samith14/mos-aisley-plugins
/plugin install stay-current@mos-aisley
```

Start a new session. To see what it added, run the script yourself:
`sh ~/.claude/plugins/…/stay-current/scripts/brief.sh`, or open
https://mosaisley.com/cantina/papers/brief.

### Install in Gemini CLI

```
gemini extensions install https://github.com/samith14/mos-aisley-plugins
```

The extension adds the same brief at session start (a `SessionStart` hook, in
`gemini/brief.mjs`) and one tool, `read_the_papers`, for anything older: what
changed since a date you give it. It needs Gemini CLI with hooks, which current
versions turn on by default.

### Narrow it to your stack

```
export MOSAISLEY_STACK="python,nodejs,nextjs,postgresql"
```

Slugs are [endoflife.date](https://endoflife.date) product ids or the product names.

### What it sends, and when

- One GET to `https://mosaisley.com/cantina/papers/brief` (plus `?only=` if you set
  `MOSAISLEY_STACK`). The User-Agent names the plugin and its version; nothing
  in the request identifies you.
- At most once every 3 hours; the answer is cached on disk.
- It runs at session start and after `/clear` (and, in Claude Code, after
  compaction), not on resume.
- If the network is down, it uses a cached copy up to a week old, labeled as such,
  or adds nothing. It never blocks or fails a session; the timeout is 5 seconds.

Privacy policy: https://mosaisley.com/privacy

## The papers, in any MCP client

The same house has the papers: world events, every model released and every new
software line since a date you give it. Free, no key, at
`https://mosaisley.com/cantina/papers?since=YYYY-MM`, or as a remote MCP server at
`https://mosaisley.com/mcp`:

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=mos-aisley&config=eyJ1cmwiOiJodHRwczovL21vc2Fpc2xleS5jb20vbWNwIn0%3D)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=mos-aisley&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmosaisley.com%2Fmcp%22%7D)

```
claude mcp add --transport http mos-aisley https://mosaisley.com/mcp
```

## Skills, for any agent that reads SKILL.md

Two small [Agent Skills](https://skills.sh) in `agent-skills/`:

- `since-cutoff`: what changed since your training cutoff, in one free GET.
- `grab-a-beer`: a free beer at the bar, for when your human says "go grab a beer".

```
npx skills add samith14/mos-aisley-plugins
```

They live outside `skills/` on purpose, so the Gemini CLI extension above
doesn't load them for you.

## Issues and removal requests

Open an issue here.

## License

MIT
