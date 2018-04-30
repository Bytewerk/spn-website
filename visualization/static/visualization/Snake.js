"use strict";

function SnakeSegment(snake)
{
    this.world_size_x = snake.world_size_x;
    this.world_size_y = snake.world_size_y;
    this._sprite = new PIXI.Sprite(snake.GetBodyTexture());
    this._sprite.anchor.set(0.5);
    this._sprite.alpha = 0.8;
    this.SetScale(snake.GetCurrentSnakeScale());
}

SnakeSegment.prototype.GetSprite = function()
{
    return this._sprite;
};

SnakeSegment.prototype.SetTint = function(tint)
{
    this._sprite.tint = tint;
};

SnakeSegment.prototype.SetScale = function(scale)
{
    this._sprite.scale.set(scale, scale);
};

SnakeSegment.prototype.SetPosition = function(x, y)
{
    this.x = x;
    this.y = y;

    while (this.x<0) { this.x += this.world_size_x; }
    while (this.x>this.world_size_x) { this.x -= this.world_size_x; }
    while (this.y<0) { this.y += this.world_size_y; }
    while (this.y>this.world_size_y) { this.y -= this.world_size_y; }

    this._sprite.x = x;
    this._sprite.y = y;
};

SnakeSegment.prototype.ClonePosition = function(other)
{
    this.SetPosition(other.x, other.y);
};

SnakeSegment.prototype.MoveDirection = function(direction, length)
{
    this.SetPosition(
        this.x + length*Math.cos(direction),
        this.y + length*Math.sin(direction)
    );
};

SnakeSegment.prototype.MoveRelative = function(dx, dy)
{
    this.SetPosition(
        this.x + dx,
        this.y + dy
    );
};

function Snake(headTexture, bodyTexture, colorScheme, world_size_x, world_size_y)
{
    this._colorScheme = colorScheme;
    this._bodyTexture = bodyTexture;

    this.textureRadius = headTexture.width / 2;
    this.spriteScale = 0.1;
    this.world_size_x = world_size_x;
    this.world_size_y = world_size_y;

    this._segments = [];
    this._headSprite = new PIXI.Sprite(headTexture);
    this._headSprite.anchor.set(0.5);
    this._segmentContainer = new PIXI.Container();
    this._foodContainer = new PIXI.Container();

    this.Container = new PIXI.Container();
    this.Container.addChild(this._foodContainer);
    this.Container.addChild(this._segmentContainer);
    this.Container.addChild(this._headSprite);
}

Snake.prototype.GetBodyTexture = function()
{
    return this._bodyTexture;
};

Snake.prototype.GetCurrentSnakeScale = function()
{
    return this.spriteScale;
};

Snake.prototype.SetData = function(data)
{
    this.heading = data.heading;
    let numSegments = data.snake_segments.length;

    this.SetLength(numSegments);
    for (let i in data.snake_segments)
    {
        let seg = data.snake_segments[i];
        this._segments[i].SetPosition(seg.pos_x, seg.pos_y);
    }
    this._headSprite.x = data.snake_segments[0].pos_x;
    this._headSprite.y = data.snake_segments[0].pos_y;
    this._headSprite.rotation = data.heading;
    this._segmentRadius = data.segment_radius;
    this.SetScale(this._segmentRadius);
};

Snake.prototype.SetLength = function(newLength)
{
    while (this.GetLength() > newLength)
    {
        let seg = this._segments.pop();
        this._segmentContainer.removeChild(seg.GetSprite());
    }

    for (let i=this.GetLength(); i<newLength; i++)
    {
        let segment = new SnakeSegment(this);
        if (this._segments.length > 0)
        {
            segment.ClonePosition(this._segments[this._segments.length-1]);
        }
        segment.SetTint(this._colorScheme[i % this._colorScheme.length]);
        this._segmentContainer.addChildAt(segment.GetSprite(), 0);
        this._segments.push(segment);
    }
};

Snake.prototype.SetScale = function(segment_radius)
{
    this._segmentRadius = segment_radius;
    let newScale = segment_radius / this.textureRadius;
    if (Math.abs(this.spriteScale - newScale) < 0.01)
    {
        return;
    }

    this.spriteScale = newScale;
    for (let i=0; i<this._segments.length; i++)
    {
        this._segments[i].SetScale(this.spriteScale);
    }
    this._headSprite.scale.set(this.spriteScale, this.spriteScale);
};

Snake.prototype.GetLength = function()
{
    return this._segments.length;
};

Snake.prototype.GetSegment = function(i)
{
    return this._segments[i];
};

Snake.prototype.GetHeadX = function()
{
    return this._headSprite.x;
};

Snake.prototype.GetHeadY = function()
{
    return this._headSprite.y;
};

Snake.prototype.GetSegmentRadius = function()
{
    return this._segmentRadius;
};

Snake.prototype.UpdateHead = function()
{
    let seg0 = this.GetSegment(0);
    this._headSprite.x = seg0.x;
    this._headSprite.y = seg0.y;
    this._headSprite.rotation = this.heading;
}

Snake.prototype.CalcRealLength = function()
{
    let len = 0;
    for (let i=1; i<this.GetLength(); i++)
    {
        let pred = this.GetSegment(i-1);
        let seg = this.GetSegment(i);
        let dx = seg.x - pred.x;
        let dy = seg.y - pred.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        len += dist;
    }
    return len;
};

Snake.prototype.Eat = function(foodSprite)
{
    this._foodContainer.addChild(foodSprite);
    foodSprite.speed = 2;
};

Snake.prototype.AnimateEat = function()
{
    let x = this.GetHeadX();
    let y = this.GetHeadY();
    let radius = this.GetSegmentRadius();

    for (let i=0; i<this._foodContainer.children.length; i++)
    {
        let food = this._foodContainer.children[i];
        let dx = food.x - x;
        let dy = food.y - y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < radius)
        {
            this._foodContainer.removeChildAt(i);
            return; // FIXME this aborts eating for this animation cycle
        }

        let factor = (dist-food.speed) / dist;
        food.x = x + dx*factor;
        food.y = y + dy*factor;
        food.speed *= 1.2;
    }
};