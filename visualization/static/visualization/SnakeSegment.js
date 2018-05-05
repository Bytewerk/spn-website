"use strict";

function SnakeSegment(texture)
{
    this.x = 0;
    this.y = 0;
    this._sprite = new PIXI.Sprite(texture);
    this._sprite.anchor.set(0.5);
    this._sprite.alpha = 0.8;
}

SnakeSegment.prototype.AddSpritesFront = function(container)
{
    container.addChildAt(this._sprite, 0);
};

SnakeSegment.prototype.RemoveSprites = function()
{
    this._sprite.parent.removeChild(this._sprite);
};

SnakeSegment.prototype.UpdateSprites = function()
{
    this._sprite.x = this.x;
    this._sprite.y = this.y;
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
