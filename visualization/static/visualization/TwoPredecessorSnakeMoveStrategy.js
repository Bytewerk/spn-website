TwoPredecessorSnakeMoveStrategy = function()
{
};

TwoPredecessorSnakeMoveStrategy.prototype.NewStyleMove = function(bot, heading, speed, length, segment_radius)
{
    bot.heading = heading;
    bot.speed = speed;
    bot.SetLength(Math.floor(length));
    bot.SetScale(segment_radius);

    let factor_pred1 = 0;
    let factor_pred2 = (1 - factor_pred1) / 2;

    for (let i=bot.GetLength()-1; i>0; i--)
    {
        let me = bot.GetSegment(i);
        let pred1 = bot.GetSegment(i-1);
        let dx1 = pred1.x - me.x;
        let dy1 = pred1.y - me.y;

        let dx2 = dx1;
        let dy2 = dy1;
        if (i>1)
        {
            let pred2 = bot.GetSegment(i-2);
            dx2 = pred2.x - me.x;
            dy2 = pred2.y - me.y;
        }

        if (dx1 < -512) { dx1 += 1024; }
        if (dx2 < -512) { dx2 += 1024; }
        if (dy1 < -512) { dy1 += 1024; }
        if (dy2 < -512) { dy2 += 1024; }
        if (dx1 > +512) { dx1 -= 1024; }
        if (dx2 > +512) { dx2 -= 1024; }
        if (dy1 > +512) { dy1 -= 1024; }
        if (dy2 > +512) { dy2 -= 1024; }

        let dx = factor_pred1*dx1 + factor_pred2 * dx2;
        let dy = factor_pred1*dy1 + factor_pred2 * dy2;

        me.SetPosition(me.x+dx, me.y+dy);
    }
    bot.GetSegment(0).MoveDirection(bot.heading, bot.speed);
};

TwoPredecessorSnakeMoveStrategy.prototype.OldStyleMove = function(bot, new_segments, new_length, current_segment_radius)
{
};
