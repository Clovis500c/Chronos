--[[
	Chronos by clovis500c
]]--

--|| Services ||--
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

--|| Modules ||--
local Chronos = {}
Chronos.__index = Chronos

local Config = require(script.Config)
local Types = require(script.Types)

--|| Functions ||--
function Chronos.new(): typeof(Chronos)
	local self = setmetatable({}, Chronos)

	self._States = {} :: { Types.State }
	self._Started = false
	self._Accumulator = 0
	self._Connections = {} :: { [string]: RBXScriptConnection }

	return self
end

-- Returns the current time in seconds
function Chronos:GetTime(): number
	return workspace:GetServerTimeNow()
end

-- Remove all the states before the given time
function Chronos:RemoveStatesBefore(Time: number): ()
	while #self._States > 0 and self._States[1].Time < Time do
		table.remove(self._States, 1)
	end
end

-- Saves the current state of the players
function Chronos:SaveCurrentState(): ()
	local State = {
		Time = self:GetTime(),
		Positions = {}
	}

	for _, Player: Player in Players:GetPlayers() do
		local Character = Player.Character
		local HumanoidRootPart = Character and Character:FindFirstChild("HumanoidRootPart")

		if HumanoidRootPart then
			State.Positions[Player.UserId] = HumanoidRootPart.CFrame
		end
	end

	table.insert(self._States, State)
end

-- Builds an intermediate state between two recorded states
function Chronos:Interpolate(Previous: Types.State, Next: Types.State, Alpha: number): Types.State
	local State = {
		Time = Previous.Time + (Next.Time - Previous.Time) * Alpha,
		Positions = {}
	}

	for UserId, PreviousCFrame in Previous.Positions do
		local NextCFrame = Next.Positions[UserId]

		if NextCFrame then
			State.Positions[UserId] = PreviousCFrame:Lerp(NextCFrame, Alpha)
		else
			State.Positions[UserId] = PreviousCFrame
		end
	end

	return State
end

-- Check if the client time is valid
function Chronos:IsTimeValid(ClientTime: number): boolean
	local Delay = self:GetTime() - ClientTime

	return Delay >= 0 and Delay <= Config.MaxChronos
end

-- Return the delay between the client time and the server time within a safe range
function Chronos:GetSafeDelay(ClientTime: number): number
	return math.clamp(self:GetTime() - ClientTime, 0, Config.MaxChronos)
end

-- Returns the world state at the given time
function Chronos:GetState(Time: number): Types.State?
	if #self._States == 0 then
		return nil
	end

	if Time <= self._States[1].Time then
		return self._States[1]
	end

	if Time >= self._States[#self._States].Time then
		return self._States[#self._States]
	end

	for i = 1, #self._States - 1 do
		local Previous = self._States[i]
		local Next = self._States[i + 1]

		if Time >= Previous.Time and Time <= Next.Time then
			local Duration = Time - Previous.Time
			local Total = Next.Time - Previous.Time
			local Alpha = Duration / Total

			return self:Interpolate(Previous, Next, Alpha)
		end
	end
end

-- Returns the position of the player at the given time
function Chronos:GetPositionAt(Player: Player, Time: number): CFrame?
	local State = self:GetState(Time)

	return State and State.Positions[Player.UserId]
end

-- Casts a ray against the world as it was at the given client time.
function Chronos:ValidateHit(
	Shooter: Player,
	Origin: Vector3,
	Direction: Vector3,
	ClientTime: number,
	Filter: ((Player) -> boolean)?
): (Player?, RaycastResult?)
	local State = self:GetState(self:GetTime() - self:GetSafeDelay(ClientTime))
	if not State then
		return nil, nil
	end

	local Hitboxes = {}
	local Owners = {}

	for UserId, PlayerCFrame in State.Positions do
		if UserId == Shooter.UserId then
			continue
		end

		local Target = Players:GetPlayerByUserId(UserId)
		if not Target then
			continue
		end

		if Filter and not Filter(Target) then
			continue
		end

		local Hitbox = Instance.new("Part")
		Hitbox.Size = Config.HitboxSize
		Hitbox.CFrame = PlayerCFrame
		Hitbox.Anchored = true
		Hitbox.CanCollide = false
		Hitbox.CanQuery = true
		Hitbox.Transparency = 1
		Hitbox.Parent = workspace

		table.insert(Hitboxes, Hitbox)
		Owners[Hitbox] = Target
	end

	local Params = RaycastParams.new()
	Params.FilterType = Enum.RaycastFilterType.Include
	Params.FilterDescendantsInstances = Hitboxes

	local Result = workspace:Raycast(Origin, Direction.Unit * Config.MaxDistance, Params)
	local Hit = Result and Owners[Result.Instance] or nil

	for _, Hitbox in Hitboxes do
		Hitbox:Destroy()
	end

	return Hit, Result
end

-- Start the module
function Chronos:Start(): ()
	if RunService:IsClient() then
		warn("Chronos can't be used on the client and is Server Only.")
		return
	end

	if self._Started then
		warn("Chronos has already started.")
		return
	end

	self._Started = true
	self._Accumulator = 0

	local Interval = 1 / Config.SampleRate

	self._Connections["Heartbeat"] = RunService.Heartbeat:Connect(function(DeltaTime: number)
		self._Accumulator += DeltaTime

		if self._Accumulator < Interval then
			return
		end

		self._Accumulator %= Interval

		self:SaveCurrentState()
		self:RemoveStatesBefore(self:GetTime() - Config.HistoryDuration)
	end)

	if Config.Debug then
		print("Chronos successfully started.")
	end
end

-- Stop the module
function Chronos:Stop(): ()
	for _, Connection in self._Connections do
		Connection:Disconnect()
	end

	table.clear(self._States)
	table.clear(self._Connections)

	self._Started = false
	self._Accumulator = 0

	if Config.Debug then
		print("Chronos has been stopped.")
	end
end

return Chronos.new()
