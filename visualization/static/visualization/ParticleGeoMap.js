"use strict";

function ParticleGeoMap(worldSizeX, worldSizeY, numTilesX, numTilesY)
{
    this.Container = new PIXI.Container();
    this._numTilesX = numTilesX;
    this._xTileSize = worldSizeX / numTilesX;
    this._yTileSize = worldSizeY / numTilesY;
    this._last = { x:0, y:0, width:0, height:0 };
    this._itemIdKeyMap = {};

    this._geoMap = [];
    for (let i=0; i<numTilesX*numTilesY; i++)
    {
        this._geoMap.push(new PIXI.Container());
    }
}

ParticleGeoMap.prototype.AddSprite = function(sprite)
{
    let key = this.GetMapKey(sprite.x, sprite.y);
    if (sprite.item_id)
    {
        this._itemIdKeyMap[sprite.item_id] = key;
    }
    this._geoMap[key].addChild(sprite);
};

ParticleGeoMap.prototype.GarbageCollect = function()
{
    for (let container of this._geoMap)
    {
        this.GarbageCollectContainer(container);
    }
};

ParticleGeoMap.prototype.GarbageCollectContainer = function(container)
{
    for (let child of container.children)
    {
        if (child.request_garbage_collect)
        {
            let key = this._itemIdKeyMap[child.item_id];
            delete this._itemIdKeyMap[key];
            container.removeChild(child);
        }
    }
};

ParticleGeoMap.prototype.Iterate = function(callback)
{
    for (let key in this._geoMap)
    {
        let container = this._geoMap[key];
        for (let i in container.children)
        {
            callback(container.children[i]);
        }
    }
};

ParticleGeoMap.prototype.Update = function(x, y, width, height)
{
    if ( (this._last.x==x) && (this._last.y==y) && (this._last.width==width) && (this._last.height==height) )
    {
        return;
    }
    this._last.x = x;
    this._last.y = y;
    this._last.width = width;
    this._last.height = height;

    this.Container.removeChildren();
    this.FindContainersInRadius(x, y, width/2, height/2, function (item) { this.Container.addChild(item); }, this);
};

ParticleGeoMap.prototype.GetMapKey = function(xPos, yPos)
{
    return this.MakeMapKey(this.GetXTile(xPos), this.GetYTile(yPos));
};

ParticleGeoMap.prototype.MakeMapKey = function(xTileNum, yTileNum)
{
    return (yTileNum*this._numTilesX + xTileNum);
};

ParticleGeoMap.prototype.GetXTile = function(xPos)
{
    return Math.floor(xPos / this._xTileSize);
};

ParticleGeoMap.prototype.GetYTile = function(yPos)
{
    return Math.floor(yPos / this._yTileSize);
};

ParticleGeoMap.prototype.FindContainersInRadius = function(x, y, radiusX, radiusY, callback, context)
{
    let xFrom = this.GetXTile(x - radiusX) ;
    let xTo = this.GetXTile(x + radiusX);
    let yFrom = this.GetYTile(y - radiusY);
    let yTo = this.GetYTile(y + radiusY);

    for (let iy=yFrom; iy < yTo; iy++)
    {
        for (let ix=xFrom; ix < xTo; ix++)
        {
            let key = this.MakeMapKey(ix, iy);
            if (key in this._geoMap)
            {
                callback.call(context, this._geoMap[key]);
            }
        }
    }
};

ParticleGeoMap.prototype.FindItemsInRadius = function(x, y, radius, callback, context)
{
    let radiusPow2 = radius*radius;

    this.FindContainersInRadius(x, y, radius, radius, function(container)
    {
        for (let i=0; i<container.children.length; i++)
        {
            let item = container.children[i];
            let dx = Math.abs(x - item.x);
            let dy = Math.abs(y - item.y);
            if ((dx*dx + dy*dy) < radiusPow2)
            {
                callback.call(context, item);
            }
        }
    }, this);
};
