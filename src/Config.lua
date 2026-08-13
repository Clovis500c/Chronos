--[[
	CHRONOS by clovis500c
	Tunable settings.
]]--

--|| Config ||--
local Config = {
	-- Seconds of position history kept
	HistoryDuration = 1,

	-- Snapshots recorded per second
	SampleRate = 30,

	-- Maximum rewind allowed in seconds, also the anti-cheat clamp
	MaxRewind = 0.3,

	-- Size of the reconstructed hitbox
	HitboxSize = Vector3.new(4, 5, 1),

	-- Maximum ray length in studs
	MaxDistance = 500,

	-- Print lifecycle messages
	Debug = false
}

return table.freeze(Config)
