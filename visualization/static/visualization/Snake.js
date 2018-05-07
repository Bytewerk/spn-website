"use strict";

function Snake(headTexture, segmentPool, name, colorScheme, world_size_x, world_size_y)
{
    this._name = name;
    this._colorScheme = colorScheme;
    this._segmentPool = segmentPool;

    this.textureRadius = headTexture.width / 2;
    this.spriteScale = 0.1;
    this.world_size_x = world_size_x;
    this.world_size_y = world_size_y;

    this._segments = [];

    this._segmentContainer = new PIXI.Container();
    this._foodContainer = new PIXI.Container();

    this.Container = new PIXI.Container();
    this.Container.addChild(this._foodContainer);
    this.Container.addChild(this._segmentContainer);

    this._headSegment = new SnakeSegment(headTexture);
    this._headSegment.SetPosition(-100000, -100000);
    this._headSegment.AddSprites(this.Container);
    this.GetHeadSprite().interactive = true;

    this._nameText = new PIXI.Text(name, {fill:'white', fontSize:64, fontWeight:"bold", dropShadow:true, dropShadowBlur:3, dropShadowDistance:6});
    this._nameText.updateText();
    this._nameSprite = new PIXI.Sprite(this._nameText.texture);
    this._nameSprite.scale.set(0.3, 0.3);
    this._nameSprite.anchor.set(1.2, 0.5);
    this._nameSprite.interactive = true;
    this.Container.addChild(this._nameSprite);

    this.SetWorldSize(world_size_x, world_size_y);
}

Snake.prototype.SetWorldSize = function(world_size_x, world_size_y)
{
    this.world_size_x = world_size_x;
    this.world_size_y = world_size_y;
    this._headSegment.SetWorldSize(this.world_size_x, this.world_size_y);

};

Snake.prototype.Destroy = function()
{
    this.Container.parent.removeChild(this.Container);

    while (this._segments.length>0)
    {
        let segment = this._segments.pop();
        segment.RemoveSprites();
        this._segmentPool.free(segment);
    }

    while (this._foodContainer.children.length>0)
    {
        let foodItem = this._foodContainer.children[0];
        foodItem.visible = false; // will be removed with decayed food
        this._foodContainer.removeChild(foodItem);
    }

    this._foodContainer.destroy();
    this._segmentContainer.destroy();
    this.Container.destroy();
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

    this._headSegment.SetPosition(data.snake_segments[0].pos_x, data.snake_segments[0].pos_y);
    this._headSegment.SetRotation(data.heading);
    this._nameSprite.x = data.snake_segments[0].pos_x;
    this._nameSprite.y = data.snake_segments[0].pos_y;

    this._segmentRadius = data.segment_radius;
    this.SetScale(this._segmentRadius);
};

Snake.prototype.SetLength = function(newLength)
{
    while (this.GetLength() > newLength)
    {
        let seg = this._segments.pop();
        seg.RemoveSprites();
        this._segmentPool.free(seg);
    }

    for (let i=this.GetLength(); i<newLength; i++)
    {
        let segment = this._segmentPool.get();
        if (this._segments.length > 0)
        {
            segment.ClonePosition(this._segments[this._segments.length-1]);
        }
        segment.SetWorldSize(this.world_size_x, this.world_size_y);
        segment.SetTint(this._colorScheme[i % this._colorScheme.length]);
        segment.SetScale(this.spriteScale);
        segment.AddSpritesFront(this._segmentContainer);
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
    this._headSegment.SetScale(this.spriteScale);
};

Snake.prototype.GetLength = function()
{
    return this._segments.length;
};

Snake.prototype.GetSegment = function(i)
{
    return this._segments[i];
};

Snake.prototype.GetHeadSprite = function()
{
    return this._headSegment.GetMainSprite();
};

Snake.prototype.GetNameSprite = function()
{
    return this._nameSprite;
};

Snake.prototype.GetHeadX = function()
{
    return this._headSegment.x;
};

Snake.prototype.GetHeadY = function()
{
    return this._headSegment.y;
};

Snake.prototype.GetSegmentRadius = function()
{
    return this._segmentRadius;
};

Snake.prototype.GetName = function()
{
    return this._name;
};

Snake.prototype.UpdateHead = function()
{
    let seg0 = this.GetSegment(0);
    let seg1 = this.GetSegment(1);
    this.heading = Math.atan2(seg0.y - seg1.y, seg0.x - seg1.x);

    this._headSegment.ClonePosition(seg0);
    this._headSegment.SetRotation(this.heading);
    this._nameSprite.x = seg0.x;
    this._nameSprite.y = seg0.y;
    for (let i=0; i<this.GetLength(); i++)
    {
        this.GetSegment(i).SetTint(this._colorScheme[i % this._colorScheme.length]);
    }
};

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
            food.visible = false;
            food.parent.removeChild(food);
        }

        let factor = (dist-food.speed) / dist;
        food.x = x + dx*factor;
        food.y = y + dy*factor;
        food.speed *= 1.3;
    }
};

Snake.prototype.InsertSegmentAfterHead = function(x, y)
{
    let segment = this._segmentPool.get();
    segment.SetPosition(x, y);
    segment.SetWorldSize(this.world_size_x, this.world_size_y);
    segment.SetScale(this.spriteScale);
    segment.AddSpritesSecond(this._segmentContainer);
    this._segments.splice(1, 0, segment);
}