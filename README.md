# Chronos

Server-side lag compensation for Roblox. Records player positions over time and rewinds the world to validate hits from the shooter's point of view.

Written in pure Luau. No dependencies, no framework required.

---

## The problem

Your screen always lies. What you see of another player is where they were a few frames ago, because the information took time to reach you.

So when you shoot someone's head:

- **On your screen:** you aim perfectly, you fire, it's a clean hit.
- **On the server at that same moment:** they've already moved a meter away. Your ray goes through empty space.

Without compensation, you shoot *exactly* on target and it doesn't register. That's the "I hit them but nothing happened" feeling in badly networked games.

## The solution

The server keeps a log of everyone's position, several times per second. When a shot arrives, it looks at *when* the client fired, rewinds to that moment, and tests the shot against the world as the shooter actually saw it.

Think of it as the server filming the match continuously. When a shot comes in, it pauses the tape, rewinds a bit, checks where everyone was on that frame, tests the shot against that, then resumes.

---

## Installation

Place the module in `ServerStorage` (or anywhere server-only) with this structure:

```
Chronos/
├── init.lua      -- main module
├── Config.lua    -- tunable settings
└── Types.lua     -- type definitions
```

```lua
local Chronos = require(game.ServerStorage.Chronos)
Chronos:Start()
```

---

## Quick start

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

	local Hit, Result = Chronos:ValidateHit(Player, Origin, Direction, ClientTime)

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

The timestamp **must** come from `workspace:GetServerTimeNow()`. It's the only clock that reads the same on both sides. `tick()`, `os.time()` and `os.clock()` all measure local machine time and will produce wrong results.

---

## API

### `Chronos:Start()`

Starts recording. Server only — warns and returns if called on the client. Safe to call twice, the second call is ignored.

### `Chronos:Stop()`

Stops recording, disconnects everything and clears the history.

### `Chronos:GetTime(): number`

Current server time. Shorthand for `workspace:GetServerTimeNow()`.

### `Chronos:GetState(Time: number): State?`

Returns the world state at the given time, interpolated between the two surrounding recorded states. Returns `nil` if no history exists yet.

```lua
type State = {
	Time: number,
	Positions: { [number]: CFrame }  -- keyed by UserId
}
```

### `Chronos:GetPositionAt(Player: Player, Time: number): CFrame?`

Convenience wrapper around `GetState` for a single player.

### `Chronos:IsTimeValid(ClientTime: number): boolean`

Whether a client timestamp is plausible — not in the future, and not further back than `MaxRewind`. Use this to reject suspicious timestamps outright.

### `Chronos:GetSafeDelay(ClientTime: number): number`

The delay between the client timestamp and now, clamped to `[0, MaxRewind]`. Use this instead of `IsTimeValid` if you'd rather clamp than reject — a player on 400ms ping isn't cheating, they're just lagging, and rejecting all their shots makes the game unplayable for them.

### `Chronos:ValidateHit(Shooter, Origin, Direction, ClientTime, Filter?): (Player?, RaycastResult?)`

Casts a ray against the world as it was when the shooter fired. The shooter is always excluded.

`Filter` is optional — a function receiving a `Player` and returning `true` if they should be hittable. Use it for teams, alive state, or anything else. Chronos has no opinion on who counts as a target.

```lua
local Hit, Result = Chronos:ValidateHit(Player, Origin, Direction, ClientTime, function(Target)
	return Target.Team ~= Player.Team
end)
```

Returns the player hit and the raycast result, or `nil, nil` if nothing was hit.

---

## Configuration

Edit `Config.lua`:

| Setting | Default | Description |
|---|---|---|
| `HistoryDuration` | `1` | Seconds of position history kept |
| `MaxRewind` | `0.3` | Maximum rewind allowed, in seconds |
| `HitboxSize` | `Vector3.new(4, 5, 1)` | Size of the reconstructed hitbox |
| `MaxDistance` | `500` | Maximum ray length in studs |
| `Debug` | `false` | Print lifecycle messages |

`MaxRewind` is your anti-cheat guard. Without it, a client could send a timestamp from five seconds ago and hit players who were standing there back then.

---

## How it works

**Recording.** On every `Heartbeat`, the server stores a snapshot: a timestamp plus every player's `HumanoidRootPart` CFrame, keyed by UserId. Snapshots older than `HistoryDuration` are dropped.

**Lookup.** Requested timestamps almost never land exactly on a snapshot. `GetState` finds the two snapshots surrounding the requested time and interpolates between them:

```
alpha = (requested - previous) / (next - previous)
```

That gives a value from 0 to 1 representing how far along the interval the requested time falls. `CFrame:Lerp` then produces the position — handling rotation as well as translation.

At 30Hz, snapshots are 33ms apart and a running character covers about half a stud between them. Picking the nearest snapshot instead of interpolating would introduce a quarter-stud error on average, for free.

**Validation.** `ValidateHit` reconstructs the past state, spawns invisible anchored parts at those positions, and raycasts with `RaycastFilterType.Include` whitelisting only those parts. The real characters are never touched, so the live world can't interfere with the result. The parts are destroyed immediately after.

---

## Limitations

Worth knowing before you use this:

- **Single hitbox per player.** Only the `HumanoidRootPart` is tracked, so there's no headshot detection or limb-accurate hits. The hitbox size is a rough approximation of a character.
- **Parts are created per shot.** `ValidateHit` spawns and destroys Instances on every call. Fine for normal fire rates, not ideal for high volumes. An OBB intersection test would avoid this entirely.
- **NPCs aren't tracked.** Only `Players` are recorded.
- **Roblox already interpolates replicated characters**, so the position the server sees is itself slightly behind reality. The rewind stacks on top of an existing offset.
- **The victim can be hit after taking cover** on their own screen, because the server validated a shot against the past. This is inherent to lag compensation, not a bug — every competitive shooter makes the same tradeoff.

---

## Prior art

Chronos wasn't the first to do this on Roblox. If you need something more mature:

- [RollbackHitbox](https://devforum.roblox.com/t/rollbackhitbox-server-authoritative-lag-compensation-for-roblox-shooters-open-source/4553295) — uses OBB intersection math instead of spawning parts
- [roblox-lag-compensation](https://github.com/RegularTetragon/roblox-lag-compensation) — roblox-ts, tracks every character part

Chronos was built to understand the technique from the ground up, and stays deliberately small and dependency-free.

---

## License

MIT

---

Built by [clovis500c](https://github.com/clovis500c)
