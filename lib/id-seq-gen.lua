local lock_key = tostring(KEYS[1])
local sequence_key = tostring(KEYS[2])
local start_sequence = tonumber(KEYS[3])
local max_sequence = tonumber(KEYS[4])

--[[
if there is a lock in sequence then return by throwing error
]]
if redis.call('EXISTS', lock_key) == 1 then
  redis.log(redis.LOG_NOTICE, 'sequence generate: Cannot generate ID, waiting for lock to expire.')
  return {
  	-1,
  	'locked'
  }
end

--[[
if sequence key doesnt exists then create one with default start sequence,
  by the time redis creates a sequence lock the sequence
--]]
if redis.call('EXISTS', sequence_key) == 0 then
  redis.log(redis.LOG_NOTICE, 'sequence generate: Creating a sequence and with default sequence')
  redis.call('PSETEX', lock_key, 1, 'lock')
  redis.call('SET', sequence_key, start_sequence)
end

--[[
Lock the key for 1ms
--]]
redis.call('PSETEX', lock_key, 1, 'lock')

--[[
Increment sequence key,
--]]
local end_sequence = redis.call('INCRBY', sequence_key, 1)

if end_sequence >= max_sequence then
  redis.log(redis.LOG_NOTICE, 'sequence generate: Cannot generate ID, reached max sequence limit.')
  return redis.error_reply('sequence generate:  Cannot generate ID, reached max sequence limit.')
end

return {
 end_sequence,
 nil
}