BotMoveHeadMoveStrategy = function()
{
    this.WORLD_SIZE_X = 0;
    this.WORLD_SIZE_Y = 0;
    this.WORLD_RADIUS_X = 0;
    this.WORLD_RADIUS_Y = 0;
    this.DISTANCE_PER_STEP = 1.0;
    this.SEGMENT_DISTANCE_FACTOR = 0.2;
    this.SEGMENT_DISTANCE_EXPONENT = 0.3;
    this.PULL_FACTOR = 0.1;
};

BotMoveHeadMoveStrategy.prototype.SetGameInfo = function(gameinfo)
{
    this.WORLD_SIZE_X = gameinfo.world_size_x;
    this.WORLD_SIZE_Y = gameinfo.world_size_y;
    this.WORLD_RADIUS_X = gameinfo.world_size_x/2;
    this.WORLD_RADIUS_Y = gameinfo.world_size_y/2;
    this.DISTANCE_PER_STEP = gameinfo.snake_distance_per_step;
    this.SEGMENT_DISTANCE_FACTOR = gameinfo.snake_segment_distance_factor;
    this.SEGMENT_DISTANCE_EXPONENT = gameinfo.snake_segment_distance_exponent;
    this.PULL_FACTOR = gameinfo.snake_pull_factor;
};

BotMoveHeadMoveStrategy.prototype.WrapCoords = function(v)
{
    let x = v.x;
    let y = v.y;
	while (x < 0) { x += this.WORLD_SIZE_X; }
	while (x > this.WORLD_SIZE_X) { x -= this.WORLD_SIZE_X; }
	while (y < 0) { y += this.WORLD_SIZE_Y; }
	while (y > this.WORLD_SIZE_Y) { y -= this.WORLD_SIZE_Y; }
    return [x, y];
}

BotMoveHeadMoveStrategy.prototype.UnwrapCoords = function(v, ref)
{
    let x = v.x;
    let y = v.y;
    while ((x - ref.x) < -this.WORLD_RADIUS_X) { x += this.WORLD_SIZE_X; }
    while ((x - ref.x) > this.WORLD_RADIUS_X)  { x -= this.WORLD_SIZE_X; }
    while ((y - ref.y) < -this.WORLD_RADIUS_Y) { y += this.WORLD_SIZE_Y; }
    while ((y - ref.y) > this.WORLD_RADIUS_Y)  { y -= this.WORLD_SIZE_Y; }
    return [x, y];
};

BotMoveHeadMoveStrategy.prototype.GetTargetSegmentDistance = function(mass)
{
	return Math.pow(mass * this.SEGMENT_DISTANCE_FACTOR, this.SEGMENT_DISTANCE_EXPONENT);
};

BotMoveHeadMoveStrategy.prototype.NewStyleMove = function(bot, mass, positions)
{
	if (!bot._movedSinceLastSpawn) { bot._movedSinceLastSpawn = 0; }
	if (bot.GetLength() < 2) { bot.SetLength(2); }

	const targetSegmentDistance = this.GetTargetSegmentDistance(mass);
	const targetLength = Math.max(mass / targetSegmentDistance / 5, 2);

	/* unwrap coordinates */
	for (let i=0; i<bot.GetLength(); i++)
    {
        let seg = bot.GetSegment(i);
        let coords = this.UnwrapCoords(seg, bot.GetSegment((i==0) ? 0 : i-1));
        seg.SetPosition(coords[0], coords[1]);
    }

    for (let pos of positions)
    {
        let head = bot.GetSegment(0);
        head.x = pos[0];
        head.y = pos[1];
        bot._movedSinceLastSpawn += this.DISTANCE_PER_STEP;

		while (bot._movedSinceLastSpawn > targetSegmentDistance)
        {
            let head = bot.GetSegment(0);
            let second = bot.GetSegment(1);
            let offset_x = head.x - second.x;
            let offset_y = head.y - second.y;
            const offset_dist = Math.sqrt(offset_x*offset_x + offset_y*offset_y);
            const offset_factor = targetSegmentDistance / offset_dist;
            offset_x *= offset_factor;
            offset_y *= offset_factor;
            bot._movedSinceLastSpawn -= targetSegmentDistance;
            bot.InsertSegmentAfterHead(second.x+offset_x, second.y+offset_y);
		}
    }

    /* pull together */
	for (let i=1; i<bot.GetLength()-1; i++)
	{
	    let prevSegment = bot.GetSegment(i-1);
	    let segment = bot.GetSegment(i);
	    let nextSegment = bot.GetSegment(i+1);
	    const new_x = segment.x * (1 - this.PULL_FACTOR) + (0.5*nextSegment.x + 0.5*prevSegment.x) * this.PULL_FACTOR;
	    const new_y = segment.y * (1 - this.PULL_FACTOR) + (0.5*nextSegment.y + 0.5*prevSegment.y) * this.PULL_FACTOR;
	    segment.SetPosition(new_x, new_y);
    }

    /* wrap coordinates */
	for (let i=0; i<bot.GetLength(); i++)
    {
        let seg = bot.GetSegment(i);
        let coords = this.WrapCoords(seg);
        seg.SetPosition(coords[0], coords[1]);
    }

	bot.SetLength(targetLength);
	const new_radius = Math.pow((20*mass+100), 0.3) - 3.9810717055349722;
	//                                    100**0.3 --------^

    bot.SetScale(new_radius);
    bot.UpdateHead();
};

BotMoveHeadMoveStrategy.prototype.OldStyleMove = function(bot, new_segments, new_length, current_segment_radius)
{
};
