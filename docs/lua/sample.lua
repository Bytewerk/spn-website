--- This is a brief overview of all usable functions within the bot logic.
--- Every bot is allowed to store 100MB within the global namespace and the 
--- data persists until the bot dies. So the bot can save data from frame 
--- to frame.
--- The following Lua standard methods are allowed: assert, print, ipairs, 
--- error, next, pairs, pcall, select,tonumber, tostring, type, unpack, 
--- _VERSION, xpcall


--- That method is called each frame.
-- Here you can implement you bot logic. The return value must be an radiant angle.
-- A negative angle means turn left and a positive angle 
-- means turn right. With 0, the snake keeps its direction.
-- @return new angle relative to the head direction
-- @usage function step()
--   return 0.005
-- end
function step()
    return 0.005
end

--- This method is called upon creation of a bot
-- Initialialize your environment here.
-- you can also access the "self" object here and, e.g. set your snake's colors
function init()
    self.colors = { 0xFF0000, 0xFFBF00, 0x80FF00, 0x00FF40, 0x00FFFF, 0x0015FF, 0x8000FF }
end

--- That method returns all food as list.
-- @param max_distance all food within the distance is included
-- @param minimum_food_value all lower food values are filtered (min: 0, max: unknown)
-- @usage local food = findFood(max_distance, 0.8)
-- for i, item in food:pairs() do
--   item.d -- angle in radian
--   item.dist -- distance
-- end
function findFood(max_distance, minimum_food_value)
end

--- That method returns all segments of all snakes within a certain radius as list. 
-- All attributes of each item in the segments list are measured between the center of your head the the center of the item center.
-- @param max_distance all segements within that distance are included
-- @param include_own If true, your snake segments are included. Otherwise you get only enemy segments
-- @usage local segments = findSegments(50.0, false)
-- for i, item in segments:pairs() do
--   item.d -- angle in radian
--   item.r -- radius of the item
--   item.dist -- distance
--   item.bot -- id of the other snake
-- end
function findSegments(max_distance, include_own)
end

--- That method sends messages to the development console.
-- @param message this string will be transfered to the console
function log(message)
end