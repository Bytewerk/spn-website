--- This is a brief overview of all usable functions within the bot logic.
--- 
--- Every player can start with a simple demo bot. You get the code in the 
--- <a href="/snake/edit/latest">editor</a>. A snake hungers, so it constantly 
--- loses size. Feed it and it will stay alive and grows. Your snake will die, 
--- when it touches another snake with its head.
---
--- <h2>Lua global namespace</h2>
--- <p>Every snake is allowed to store 10 MB within the global namespace and the 
--- data persists until the bot dies. So the bot can save data from frame 
--- to frame.</p>
--- <p>The following Lua standard functions are allowed:</p>
--- <table>
--- <tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-assert">assert</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-print">print</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-ipairs">ipairs</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-error">error</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-next">next</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-pairs">pairs</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-pcall">pcall</a></td></tr>
--- <tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-select">select</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-tonumber">tonumber</a>,
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-tostring">tostring</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-type">type</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-unpack">unpack</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-_VERSION">_VERSION</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-xpcall">xpcall</a></td></tr></table>
--- <p>From the module <code>math</code> you can use:</p>
--- <table><tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.abs">abs</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.acos">acos</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.asin">asin</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.atan">atan</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.ceil">ceil</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.cos">cos</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.deg">deg</a></td></tr>
--- <tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.exp">exp</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.floor">floor</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.fmod">fmod</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.frexp">frexp</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.huge">huge</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.log">log</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.max">max</a></td></tr>
--- <tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.min">min</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.modf">modf</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.pi">pi</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.pow">pow</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.rad">rad</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.random">random</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.randomseed">randomseed</a></td></tr>
--- <tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.sin">sin</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.sqrt">sqrt</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-math.tan">tan</a></td></tr></table>
--- <p>From the module <code>os</code> you can use:</p>
--- <table><tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-os.clock">clock</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-os.difftime">difftime</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-os.time">time</a></td></tr></table>
--- <p>From the module <code>table</code> you can use:</p>
--- <table><tr><td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-table.insert">insert</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-table.remove">remove</a></td>
--- <td><a href="https://www.lua.org/manual/5.3/manual.html#pdf-table.sort">sort</a></td></tr></table>
--- <p>Every snake can describe itself with the following attributes of the global variable <code>self</code>:</p>
--- <table>
--- <thead>
--- <tr><td>Variable within self</td><td>Type</td><td>Description</td></tr>
--- </thead>
--- <tbody>
--- <tr><td>id</td><td>number</td><td>internal identifier</td></tr>
--- <tr><td>segment_radius</td><td>number</td><td>the size of the snake</td></tr>
--- <tr><td>mass</td><td>number</td><td>the weight of the snake</td></tr>
--- <tr><td>sight_radius</td><td>number</td><td>the field of view of the snake, which increases with the size of the snake</td></tr>
--- <tr><td>consume_radius</td><td>number</td><td>the field of feed of the snake, which increases with the size of the snake</td></tr>
--- <tr><td>max_step_angle</td><td>number</td><td>limits the return value of the step function (-max_step_angle to +max_step_angle)</td></tr>
--- <tr><td>start_frame</td><td>number</td><td>the game frame, when the snake was born</td></tr>
--- <tr><td>current_frame</td><td>number</td><td>the current game frame</td></tr>
--- <tr><td>speed</td><td>number</td><td>default speed is 1, but it can change if a snake is using boost</td></tr>
--- <tr><td>food_consumed_natural</td><td>number</td><td>consumed food which appeared naturally in the world</td></tr>
--- <tr><td>food_consumed_hunted_self</td><td>number</td><td>consumed food from snakes that you killed</td></tr>
--- <tr><td>food_consumed_hunted_by_others</td><td>number</td><td>consumed food from snakes that were killed by others</td></tr>
--- <tr><td>colors</td><td>{number,..}</td><td>table of colors (default color is 0x0000FF00, maximum count is 100, set is available in <a href="#init">init</a>)</td></tr>
--- <tr><td>face</td><td>number</td><td>not implemented yet (returns 0, set is available in <a href="#init">init</a>)</td></tr>
--- <tr><td>logo</td><td>number</td><td>not implemented yet (returns 0, set is available in <a href="#init">init</a>)</td></tr></tr>
--- </tbody></table>

--- This function is called upon creation of a bot
-- Initialialize your environment here.
-- You can also modify the "self" variables here and, e.g. set your snake's colors.
-- @usage function init()
--     self.colors = { 0xFF0000, 0xFFBF00, 0x80FF00, 0x00FF40, 0x00FFFF, 0x0015FF, 0x8000FF }
-- end
function init()
end

--- That function returns all food as list.
-- The list is ordered by food value, from largest to lowest. The values of new spawning 
-- food are calculated based on a mean value of 3.5 and a standard deviation of 2.
-- A killed snake drops a part of the consumed food, that is distributed by the same rule.
-- @param max_distance all food within the distance is included
-- @param minimum_food_value all lower food values are filtered (min: 0, max: unknown)
-- @usage local food = findFood(max_distance, 0.8)
-- for i, item in pairs(food) do
--   item.d    -- angle in radian (-π to +π)
--   item.dist -- distance
--   item.v    -- food value
-- end
function findFood(max_distance, minimum_food_value)
end

--- That function returns all segments of all snakes within a certain radius as list. 
-- The list is ordered by distance, from smallest to largest. All attributes of each 
-- item in the segments list are measured between the center of your head the the center 
-- of the item center.
-- @param max_distance all segements within that distance are included
-- @param include_own If true, your snake segments are included. Otherwise you get only enemy segments
-- @usage local segments = findSegments(50.0, false)
-- for i, item in pairs(segments) do
--   item.d        -- angle in radian (-π to +π)
--   item.r        -- radius of the item
--   item.dist     -- distance
--   item.bot      -- id of the other snake (new one after death)
--   item.bot_id   -- id of the other snake (new one after death)
--   item.bot_name -- name of the other snake (will never change)
-- end
function findSegments(max_distance, include_own)
end

--- That function sends messages to the development console.
-- @param message this string will be transfered to the console
function log(message)
end

--- That function (defined by you) is called each frame.
-- Here you can implement you bot logic. The return value must be an radiant angle.
-- A negative angle means turn left and a positive angle 
-- means turn right. With 0, the snake keeps its direction.
-- @return new angle relative to the head direction
-- @return if true the snake will use boost, otherwise false or empty (optional)
-- @usage function step()
--   return 0.005
-- end
-- @usage function step()
--   return 0.005, true
-- end
function step()
    return 0.005
end
