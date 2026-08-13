# Chronos

Server-side lag compensation for Roblox. The server records player positions over time, rewinds to the moment a shot was fired, and validates the hit against that past state.

Pure Luau. No dependencies, server only.

**[Documentation →](https://clovis500c.github.io/Chronos/)**

---

## Install

Download `Chronos.rbxm` from [Releases](https://github.com/Clovis500c/Chronos/releases) and drag it into `ServerStorage`, or copy `src/` manually.

```lua
local Chronos = require(game.ServerStorage.Chronos)
Chronos:Start()
```

Everything else — API, settings, internals, limitations — is in [the docs](https://clovis500c.github.io/Chronos/docs).

---

## Prior art

Chronos wasn't the first to do this on Roblox. If you need something more mature:

- [RollbackHitbox](https://devforum.roblox.com/t/rollbackhitbox-server-authoritative-lag-compensation-for-roblox-shooters-open-source/4553295) — OBB intersection math instead of spawning parts
- [roblox-lag-compensation](https://github.com/RegularTetragon/roblox-lag-compensation) — roblox-ts, tracks every character part

Chronos was built to understand the technique from the ground up, and stays deliberately small and dependency-free.

---

MIT — built by [clovis500c](https://github.com/clovis500c)
