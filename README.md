# Chronos

Server-side lag compensation for Roblox. The server records player positions over time, rewinds to the moment a shot was fired, and validates the hit against that past state.

Pure Luau. No dependencies, server only.

**[Documentation →](https://clovis500c.github.io/Chronos/)**

---

## Why

Your screen shows other players where they *were* a few frames ago — the information took time to reach you. So you aim perfectly and fire, but on the server they've already moved and your ray hits empty space.

Chronos rewinds the world to the instant the shooter actually pulled the trigger, so a correctly aimed shot registers even on high ping.

---

## Install

Grab `Chronos.rbxm` from [Releases](https://github.com/Clovis500c/Chronos/releases) and drag it into `ServerStorage`, or copy `src/` manually.

---

## Usage

**Server**

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

local Chronos = require(ServerStorage.Chronos)
local ShootRemote = ReplicatedStorage.Shoot

Chronos:Start()

ShootRemote.OnServerEvent:Connect(function(Player, ClientTime, Origin, Direction)
	if not Chronos:IsTimeValid(ClientTime) then
		return
	end

	local Hit = Chronos:ValidateHit(Player, Origin, Direction, ClientTime)

	if Hit then
		local Humanoid = Hit.Character and Hit.Character:FindFirstChild("Humanoid")
		if Humanoid then
			Humanoid:TakeDamage(25)
		end
	end
end)
```

**Client**

```lua
local Camera = workspace.CurrentCamera
local Mouse = UserInputService:GetMouseLocation()
local Ray = Camera:ViewportPointToRay(Mouse.X, Mouse.Y)

ShootRemote:FireServer(workspace:GetServerTimeNow(), Ray.Origin, Ray.Direction)
```

The timestamp **must** come from `workspace:GetServerTimeNow()`. It's the only clock that reads the same on both sides — `tick()`, `os.time()` and `os.clock()` measure local machine time and will produce wrong results.

Full API reference, settings and internals: **[the docs](https://clovis500c.github.io/Chronos/docs)**.

---

## Limitations

- **One hitbox per player.** Only the `HumanoidRootPart` is tracked, so no headshots or limb-accurate hits.
- **Parts are created per shot.** Fine for normal fire rates, not for high volumes. An OBB intersection test would avoid this.
- **NPCs aren't tracked.** Only `Players`.
- **Roblox already interpolates replicated characters**, so the rewind stacks on top of an existing offset.
- **The victim can be hit after taking cover** on their own screen. Inherent to lag compensation — every competitive shooter makes the same tradeoff.

---

## Prior art

Chronos wasn't the first to do this on Roblox. If you need something more mature:

- [RollbackHitbox](https://devforum.roblox.com/t/rollbackhitbox-server-authoritative-lag-compensation-for-roblox-shooters-open-source/4553295) — OBB intersection math instead of spawning parts
- [roblox-lag-compensation](https://github.com/RegularTetragon/roblox-lag-compensation) — roblox-ts, tracks every character part

Chronos was built to understand the technique from the ground up, and stays deliberately small and dependency-free.

---

MIT — built by [clovis500c](https://github.com/clovis500c)
