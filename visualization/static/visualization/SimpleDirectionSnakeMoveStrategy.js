SimpleDirectionSnakeMoveStrategy = function()
{
};

SimpleDirectionSnakeMoveStrategy.prototype.NewStyleMove = function(bot, heading, speed, length, segment_radius)
{
    bot.heading = heading;
    bot.speed = speed;
    bot.SetLength(Math.floor(length));
    bot.SetScale(segment_radius);

    for (let i=bot.GetLength()-1; i>0; i--)
    {
        bot.GetSegment(i).ClonePosition(bot.GetSegment(i-1));
    }
    bot.GetSegment(0).MoveDirection(bot.heading, bot.speed);
};

SimpleDirectionSnakeMoveStrategy.prototype.OldStyleMove = function(bot, new_segments, new_length, current_segment_radius)
{
    bot.SetLength(new_length);
    bot.SetScale(current_segment_radius);
    for (let i=0; i<new_length; i++)
    {
        bot.GetSegment(i).SetPosition(new_segments[i].pos_x, new_segments[i].pos_y);
    }
    let seg0 = bot.GetSegment(0);
    let seg1 = bot.GetSegment(1);
    let dx = seg0.x - seg1.x;
    let dy = seg0.y - seg1.y;
    bot.heading = Math.atan2(dy, dx);
    bot.UpdateHead();
};
