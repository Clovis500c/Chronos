--[[
	CHRONOS by clovis500c
	Type definitions.
]]--

--|| Types ||--
-- A snapshot of every tracked player at a given time
export type State = {
	Time: number,
	Positions: { [number]: CFrame } -- keyed by UserId
}

return {}
