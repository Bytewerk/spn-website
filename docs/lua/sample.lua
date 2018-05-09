--- This is a brief overview of all usable functions within the bot logic.
--- Every bot is allowed to store 100MB within the global namespace and the 
--- data persists until the bot dies. So the bot can save data from frame 
--- to frame.
--- <h2>Lua global namespace</h2>
--- <p>The following Lua standard functions are allowed:</p>
--- <p><a href="http://pgl.yoyo.org/luai/i/assert">assert</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/print">print</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/ipairs">ipairs</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/error">error</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/next">next</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/pairs">pairs</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/pcall">pcall</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/select">select</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/tonumber">tonumber</a>,
--- <a href="http://pgl.yoyo.org/luai/i/tostring">tostring</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/type">type</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/unpack">unpack</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/_VERSION">_VERSION</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/xpcall">xpcall</a></p>
--- <p>From the module <code>math</code> you can use:</p>
--- <p><a href="http://pgl.yoyo.org/luai/i/math.abs">abs</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.acos">acos</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.asin">asin</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.atan">atan</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.atan2">atan2</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.ceil">ceil</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.cos">cos</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.cosh">cosh</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.deg">deg</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.exp">exp</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.floor">floor</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.fmod">fmod</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.frexp">frexp</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.huge">huge</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.ldexp">ldexp</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.log">log</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.log10">log10</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.max">max</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.min">min</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.modf">modf</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.pi">pi</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.pow">pow</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.rad">rad</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.random">random</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.randomseed">randomseed</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.sin">sin</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.sinh">sinh</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.sqrt">sqrt</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.tan">tan</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/math.tanh">tanh</a></p>
--- <p>From the module <code>os</code> you can use:</p>
--- <p><a href="http://pgl.yoyo.org/luai/i/os.clock">clock</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/os.difftime">difftime</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/os.time">time</a></p>
--- <p>From the module <code>table</code> you can use:</p>
--- <a href="http://pgl.yoyo.org/luai/i/table.maxn">maxn</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/table.insert">insert</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/table.remove">remove</a>, 
--- <a href="http://pgl.yoyo.org/luai/i/table.sort">sort</a></p>
--- <h2>Globals</h2>
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
--- <tr><td>max_step_angle</td><td>number</td><td>unknown definition</td></tr>
--- <tr><td>start_frame</td><td>number</td><td>the game frame, when the snake was born</td></tr>
--- <tr><td>current_frame</td><td>number</td><td>the current game frame</td></tr>
--- <tr><td>speed</td><td>number</td><td>default speed is 1, but it can change if a snake is using boost</td></tr>
--- <tr><td>food_consumed_natural</td><td>number</td><td>unknown definition</td></tr>
--- <tr><td>food_consumed_hunted_self</td><td>number</td><td>unknown definition</td></tr>
--- <tr><td>food_consumed_hunted_by_others</td><td>number</td><td>unknown definition</td></tr>
--- <tr><td>colors</td><td>{number}</td><td>table of colors (default color is 0x0000FF00, maximum count is 100, set is available in <a href="#init">init</a>)</td></tr>
--- <tr><td>face</td><td>number</td><td>not implemented yet (returns 0, set is available in <a href="#init">init</a>)</td></tr>
--- <tr><td>logo</td><td>number</td><td>not implemented yet (returns 0, set is available in <a href="#init">init</a>)</td></tr></tr>
--- </tbody></table>

--- This function is called upon creation of a bot
-- Initialialize your environment here.
-- You can also access the "self" module here and, e.g. set your snake's colors.
-- @usage function init()
--     self.colors = { 0xFF0000, 0xFFBF00, 0x80FF00, 0x00FF40, 0x00FFFF, 0x0015FF, 0x8000FF }
-- end
function init()
end

--- That function returns all food as list.
-- @param max_distance all food within the distance is included
-- @param minimum_food_value all lower food values are filtered (min: 0, max: unknown)
-- @usage local food = findFood(max_distance, 0.8)
-- for i, item in food:pairs() do
--   item.d -- angle in radian
--   item.dist -- distance
-- end
function findFood(max_distance, minimum_food_value)
end

--- That function returns all segments of all snakes within a certain radius as list. 
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

--- That function sends messages to the development console.
-- @param message this string will be transfered to the console
function log(message)
end

--- That function is called each frame.
-- Here you can implement you bot logic. The return value must be an radiant angle.
-- A negative angle means turn left and a positive angle 
-- means turn right. With 0, the snake keeps its direction.
-- @return new angle relative to the head direction
--@return if true the snake will use boost, otherwise false or empty (optional)
-- @usage function step()
--   return 0.005
-- end
-- @usage function step()
--   return 0.005, true
-- end
function step()
    return 0.005
end
