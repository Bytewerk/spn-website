--- This is a brief overview of all usable functions within the bot logic.

--- Main cycle
-- Run is executed each frame.
-- @param current_heading first parameter
-- @usage function run(current_heading)
--   return (current_heading + 45) % 360 
-- end
function run(current_heading)
    x = 2
    for n=1,x do
        current_heading = current_heading + api:get_rotation_speed()
    end
    return current_heading
end

--- API #1
-- @return allowed rotation speed by the game engine
-- @usage local x = current_heading + api:get_rotation_speed()
function api:get_rotation_speed()
end