"use strict";

function ObjectPool(allocFunc, allocThis, initialSize)
{
    this.allocFunc = allocFunc;
    this.allocThis = allocThis;
    this.pool = [];
    this.usedCount = 0;
    for (let i=0; i<initialSize; i++)
    {
        this.pool.push(allocFunc.call(this.allocThis));
    }
}

ObjectPool.prototype.get = function()
{
    this.usedCount++;
    if (this.pool.length>0)
    {
        return this.pool.pop();
    }
    return this.allocFunc.call(this.allocThis);
};

ObjectPool.prototype.free = function(element)
{
    this.usedCount--;
    this.pool.push(element);
};
