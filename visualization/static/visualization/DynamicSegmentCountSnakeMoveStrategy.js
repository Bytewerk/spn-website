DynamicSegmentCountSnakeMoveStrategy = function()
{
};

DynamicSegmentCountSnakeMoveStrategy.prototype.NewStyleMove = function(bot, heading, speed, length, segment_radius)
{
    bot.heading = heading;
    bot.speed = speed;
    bot.SetScale(segment_radius);

    let num_segments = Math.floor(20 + length * 0.1);
    let target_distance = (length / (num_segments - 1));
    bot.SetLength(num_segments);

    bot.GetSegment(0).MoveDirection(bot.heading, bot.speed);
    for (let i=1; i<bot.GetLength(); i++)
    {
        let pred = bot.GetSegment(i-1);
        let seg = bot.GetSegment(i);
        let dx = seg.x - pred.x;
        let dy = seg.y - pred.y;
        let scale = target_distance / Math.sqrt(dx*dx + dy*dy);
        seg.SetPosition(pred.x + dx*scale, pred.y + dy*scale);
    }
};

DynamicSegmentCountSnakeMoveStrategy.prototype.OldStyleMove = function(bot, new_segments, new_length, current_segment_radius)
{
};

DynamicSegmentCountSnakeMoveStrategy.prototype.Wrap = function(value)
{
    if (value < -512)
    {
        return value + 1024;
    }
    else if (value > 512)
    {
        return value - 1024;
    }
    else
    {
        return value;
    }
};