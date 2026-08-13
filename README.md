# Chronos

Server-side lag compensation for Roblox. The server records player positions over time, rewinds to the moment a shot was fired, and validates the hit against that past state.

Pure Luau. No dependencies, server only.

---

## Why

Your screen shows other players where they *were* a few frames ago — the information took time to reach you. So you aim perfectly and fire, but on the server they've already moved and your ray hits empty space.

Chronos rewinds the world to the instant the shooter actually pulled the trigger, so a correctly aimed shot registers even on high ping.

---

## Install

Grab `Chronos.rbxm` from [Releases](https://github.com/Clovis500c/Chronos/releases) and drag it into `ServerStorage`, or copy `src/` manually:

```
Chronos/
├── init.lua      -- main module
├── Config.lua    -- settings
└── Types.lua     -- type definitions
```

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
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local ShootRemote = ReplicatedStorage.Shoot
local Camera = workspace.CurrentCamera

UserInputService.InputBegan:Connect(function(Input, Processed)
	if Processed or Input.UserInputType ~= Enum.UserInputType.MouseButton1 then
		return
	end

	local Mouse = UserInputService:GetMouseLocation()
	local Ray = Camera:ViewportPointToRay(Mouse.X, Mouse.Y)

	ShootRemote:FireServer(workspace:GetServerTimeNow(), Ray.Origin, Ray.Direction)
end)
```

The timestamp **must** come from `workspace:GetServerTimeNow()`. It's the only clock that reads the same on both sides — `tick()`, `os.time()` and `os.clock()` measure local machine time and will produce wrong results.

---

## API

| Method | Returns | Description |
|---|---|---|
| `Start()` | — | Starts recording. Server only, safe to call twice. |
| `Stop()` | — | Stops recording, disconnects and clears the history. |
| `GetTime()` | `number` | Current server time. |
| `GetState(Time)` | `State?` | World state at that time, interpolated. `nil` if no history yet. |
| `GetPositionAt(Player, Time)` | `CFrame?` | Position of one player at that time. |
| `IsTimeValid(ClientTime)` | `boolean` | Whether a client timestamp is plausible — not in the future, not older than `MaxChronos`. |
| `GetSafeDelay(ClientTime)` | `number` | The delay, clamped to `[0, MaxChronos]`. Clamps instead of rejecting. |
| `ValidateHit(Shooter, Origin, Direction, ClientTime, Filter?)` | `Player?, RaycastResult?` | Casts a ray against the past world. The shooter is always excluded. |

```lua
type State = {
	Time: number,
	Positions: { [number]: CFrame } -- keyed by UserId
}
```

`Filter` is optional — a function receiving a `Player`, returning `true` if they should be hittable. Chronos has no opinion on who counts as a target:

```lua
local Hit = Chronos:ValidateHit(Player, Origin, Direction, ClientTime, function(Target)
	return Target.Team ~= Player.Team
end)
```

Use `IsTimeValid` to reject suspicious timestamps outright, or `GetSafeDelay` to clamp instead — a player on 400ms ping isn't cheating, and rejecting all their shots makes the game unplayable for them.

---

## Config

| Setting | Default | Description |
|---|---|---|
| `HistoryDuration` | `1` | Seconds of position history kept |
| `SampleRate` | `30` | Snapshots recorded per second |
| `MaxChronos` | `0.3` | Maximum rewind allowed, in seconds |
| `HitboxSize` | `Vector3.new(4, 5, 1)` | Size of the reconstructed hitbox |
| `MaxDistance` | `500` | Maximum ray length in studs |
| `Debug` | `false` | Print lifecycle messages |

`MaxChronos` is the anti-cheat guard. Without it a client could send a timestamp from five seconds ago and hit players who were standing there back then.

---

## How it works

**Recording.** `SampleRate` times per second, the server stores a snapshot: a timestamp plus every player's `HumanoidRootPart` CFrame, keyed by UserId. Snapshots older than `HistoryDuration` are dropped.

**Lookup.** A requested timestamp almost never lands exactly on a snapshot, so `GetState` finds the two surrounding it and `CFrame:Lerp` builds the position in between.

**Validation.** `ValidateHit` reconstructs that past state, spawns invisible anchored parts at those positions, and raycasts with `RaycastFilterType.Include` whitelisting only those parts — the real characters are never touched. The parts are destroyed immediately after.

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
