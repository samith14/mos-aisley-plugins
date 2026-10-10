// stay-current for Gemini CLI: a SessionStart hook that adds what's current
// (newest AI models, newest software versions, this week's news) to the
// session as context. The Claude Code plugin does the same in scripts/brief.sh.
//
// One GET to https://mosaisley.com/cantina/papers/brief, with nothing that
// identifies you, at most once every 3 hours: the answer is cached on disk.
// If the network fails, a cached copy up to a week old is used; otherwise the
// hook prints nothing and the session starts as usual. It never blocks or fails
// a session.
//
// Optional: MOSAISLEY_STACK="python,nodejs,nextjs" narrows the software list
// (endoflife.date slugs or product names).
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const FRESH_MS = 3 * 3600_000;
const STALE_MS = 7 * 86400_000;
const UA = 'stay-current/1.0 (Gemini CLI extension; +https://github.com/samith14/mos-aisley-plugins)';

const stack = (process.env.MOSAISLEY_STACK ?? '').replace(/[^A-Za-z0-9,._ -]/g, '').trim();
const url = `https://mosaisley.com/cantina/papers/brief${stack ? `?only=${encodeURIComponent(stack)}` : ''}`;
const dir = join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'mos-aisley-stay-current');
const cache = join(dir, `brief-gemini-${createHash('sha256').update(url).digest('hex').slice(0, 12)}.txt`);

const emit = text => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }));
};
const age = () => { try { return Date.now() - statSync(cache).mtimeMs; } catch { return Infinity; } };
const cached = () => { try { return readFileSync(cache, 'utf8'); } catch { return ''; } };

try {
  if (age() < FRESH_MS && cached()) {
    emit(cached());
  } else {
    let text = '';
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(5000) });
      if (res.ok) text = await res.text();
    } catch { /* offline: fall through to the cache */ }
    if (text.trim()) {
      try {
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${cache}.${process.pid}`, text);
        renameSync(`${cache}.${process.pid}`, cache);
      } catch { /* no cache this time; still use the answer */ }
      emit(text);
    } else if (age() < STALE_MS && cached()) {
      const when = new Date(Date.now() - age()).toISOString().slice(0, 16).replace('T', ' ');
      emit(`(stay-current: offline, so this is the copy from ${when} UTC)\n${cached()}`);
    }
  }
} catch { /* never fail a session */ }
process.exit(0);
