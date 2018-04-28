ImpulseSnakeMoveStrategy = function()
{
};

ImpulseSnakeMoveStrategy.prototype.NewStyleMove = function(bot, heading, speed, length, segment_radius)
{
    bot.heading = heading;
    bot.speed = speed;
    bot.SetLength(Math.floor(length));
    bot.SetScale(segment_radius);

    let factor_pred = 0.9;
    let factor_impulse = 1 - factor_pred;

    for (let i=bot.GetLength()-1; i>0; i--)
    {
        let succ = bot.GetSegment(i);
        let pred = bot.GetSegment(i-1);

        let dx = pred.x - succ.x;
        let dy = pred.y - succ.y;
        if (!succ.last_dx) { succ.last_dx = dx; }
        if (!succ.last_dy) { succ.last_dy = dy; }

        dx = factor_pred*dx + factor_impulse * succ.last_dx;
        dy = factor_pred*dy + factor_impulse * succ.last_dy;

        succ.last_dx = dx;
        succ.last_dy = dy;

        succ.SetPosition(succ.x+dx, succ.y+dy);
    }
    bot.GetSegment(0).MoveDirection(bot.heading, bot.speed);
};

ImpulseSnakeMoveStrategy.prototype.OldStyleMove = function(bot, new_segments, new_length, current_segment_radius)
{
};
