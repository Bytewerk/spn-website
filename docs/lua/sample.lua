--- This is a brief overview for all usable functions within the Bot logic.

x = 1

--- Main cycle
-- Run is executed each frame.
-- @param current_heading first parameter
function run(current_heading)
    x = 2 * x
    for n=1,x do
        current_heading = current_heading + api:get_rotation_speed()
    end
    return current_heading
end
