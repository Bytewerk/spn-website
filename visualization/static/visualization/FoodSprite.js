function FoodSprite(texture)
{
    PIXI.Sprite.call(this, texture);
    this.food_value = 0;
    this.decay_rate = 0;
    this.item_id = 0;
    this.tint = this.GetRandomTint();
}

FoodSprite.prototype = Object.create(PIXI.Sprite.prototype);

FoodSprite.prototype.SetData = function(decay_rate, food_id, pos_x, pos_y, value)
{
    this.decay_rate = decay_rate;
    this.food_value = value;
    this.item_id = food_id;
    this.textureRadius = this.texture.width / 2;
    this.anchor.set(0.5);
    this.x = pos_x;
    this.y = pos_y;
    this.tint = this.GetRandomTint();
    this.visible = true;
    this.request_garbage_collect = false;
    this.UpdateScale();
};

FoodSprite.prototype.UpdateScale = function()
{
    let size = Math.sqrt(this.food_value) / this.textureRadius;
    this.scale.x = size;
    this.scale.y = size;
};

FoodSprite.prototype.Decay = function(cycles)
{
    if (this.food_value > 0)
    {
        if (!cycles) { cycles = 1; }
        this.food_value -= cycles*this.decay_rate;
        this.UpdateScale();
    }
    if (this.food_value < 0)
    {
        this.visible = false;
        this.request_garbage_collect = true;
    }
};

FoodSprite.prototype.GetRandomTint = function()
{
    let h = Math.random();
    let s = Math.random();
    let v = 1;

    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return ((r<<16) | (g<<8) | b);
};
