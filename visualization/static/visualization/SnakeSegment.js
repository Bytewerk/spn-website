"use strict";

function SnakeSegment(texture)
{
    this.x = 0;
    this.y = 0;
    this._texture = texture;
    this._radius = 1.0;
    this._world_size_x = 0;
    this._world_size_y = 0;

    this._sprites = [];
    for (let i=0; i<3; i++)
    {
        let sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.alpha = 0.8;
        this._sprites.push(sprite);
    }
}

SnakeSegment.prototype.GetMainSprite = function()
{
    return this._sprites[0];
};

SnakeSegment.prototype.SetWorldSize = function(world_size_x, world_size_y)
{
    this._world_size_x = world_size_x;
    this._world_size_y = world_size_y;
};

SnakeSegment.prototype.AddSprites = function(container)
{
    for (let sprite of this._sprites)
    {
        container.addChild(sprite);
    }
};

SnakeSegment.prototype.AddSpritesFront = function(container)
{
    for (let sprite of this._sprites)
    {
        container.addChildAt(sprite, 0);
    }
};

SnakeSegment.prototype.AddSpritesSecond = function(container)
{
    for (let sprite of this._sprites)
    {
        container.addChildAt(sprite, container.children.length-2);
    }
};

SnakeSegment.prototype.RemoveSprites = function()
{
    for (let sprite of this._sprites)
    {
        sprite.parent.removeChild(sprite);
    }
};

SnakeSegment.prototype.UpdateSprites = function()
{
    this._sprites[0].x = this.x;
    this._sprites[0].y = this.y;
    this._sprites[1].x = this.x;
    this._sprites[2].y = this.y;

    if (this.x < this._radius)
    {
        this._sprites[2].x = this.x + this._world_size_x;
        this._sprites[2].visible = true;
    }
    else if (this.x > this._world_size_x-this._radius)
    {
        this._sprites[2].x = this.x - this._world_size_x;
        this._sprites[2].visible = true;
    }
    else
    {
        this._sprites[2].visible = false;
    }

    if (this.y < this._radius)
    {
        this._sprites[1].y = this.y + this._world_size_y;
        this._sprites[1].visible = true;
    }
    else if (this.y > this._world_size_y-this._radius)
    {
        this._sprites[1].y = this.y - this._world_size_y;
        this._sprites[1].visible = true;
    }
    else
    {
        this._sprites[1].visible = false;
    }
};

SnakeSegment.prototype.SetTint = function(tint)
{
    for (let sprite of this._sprites)
    {
        sprite.tint = tint;
    }
};

SnakeSegment.prototype.SetScale = function(scale)
{
    this._radius = scale * (this._texture.width / 2);
    for (let sprite of this._sprites)
    {
        sprite.scale.set(scale, scale);
    }
};

SnakeSegment.prototype.SetRotation = function(rotation)
{
    for (let sprite of this._sprites)
    {
        sprite.rotation = rotation;
    }
};

SnakeSegment.prototype.SetPosition = function(x, y)
{
    this.x = x;
    this.y = y;
    this.UpdateSprites();
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
