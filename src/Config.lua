return {
	HistoryDuration = 1, -- History of player positions kept in seconds
	SampleRate = 30, -- Number of states recorded per second
	MaxChronos = 0.3, -- Maximum time (in seconds) players can Chronos
	HitboxSize = Vector3.new(4, 5, 1), -- Size of the reconstructed hitbox
	MaxDistance = 500, -- Maximum ray length in studs
	Debug = false -- Enable debug prints
}
