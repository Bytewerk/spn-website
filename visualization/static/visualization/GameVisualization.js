"use strict";

function GameVisualization(assets, snakeMoveStrategy, container)
{
    this.container = container;
    this.snakeMoveStrategy = snakeMoveStrategy;
    this.snakes = {};
    this.ego_id = 0;
    this.follow_db_id = null;
    this.nextFoodDecayRow = 0;
    this.world_size_x = 1024;
    this.world_size_y = 1024;
    this.food_decay_rate = 0.001;
    this.foodItems = {};

    this.app = new PIXI.Application({'transparent':false});
    this.txHead = PIXI.Texture.fromImage(assets['head.png']);
    this.txBody = PIXI.Texture.fromImage(assets['body.png']);
    this.txFood = PIXI.Texture.fromImage(assets['food.png']);

    this.viewport = new PIXI.extras.Viewport({
        screenWidth: this.container.clientWidth,
        screenHeight: this.container.clientHeight,
        worldWidth: this.world_size_x,
        worldHeight: this.world_size_y
    });
    this.app.stage.addChild(this.viewport);
    this.viewport.drag().pinch().wheel();

    this.foodContainer = this.viewport.addChild(new PIXI.Container());
    this.snakesContainer = this.viewport.addChild(new PIXI.Container());
    this.UpdateMask();

    this.segmentPool = new ObjectPool(function() {
        return new SnakeSegment(this.txBody);
    }, this, 10000);

    this.foodItemPool = new ObjectPool(function() {
        return new FoodSprite(this.txFood);
    }, this, 10000);
}

GameVisualization.prototype.UpdateMask = function()
{
/*    const mask = new PIXI.Graphics();
    mask.lineStyle(0);
    mask.beginFill(0x000000, 0.5);
    mask.drawRect(0, 0, this.world_size_x, this.world_size_y);
    mask.endFill();
    this.snakesContainer.mask = mask; */
};

GameVisualization.prototype.Run = function()
{
    this.container.appendChild(this.app.view);
    this.Resize();
    this.app.ticker.add(this.GameTick, this);
};

GameVisualization.prototype.Resize = function()
{
    this.GetRenderer().resize(this.container.clientWidth, this.container.clientHeight);
};

GameVisualization.prototype.GetRenderer = function()
{
    return this.app.renderer;
};

GameVisualization.prototype.GetSnake = function(id)
{
    return this.snakes[id];
};

GameVisualization.prototype.GameTick = function(delta)
{
    this.UpdateStagePosition();
};

GameVisualization.prototype.CreateSnake = function(bot)
{
    let snake = new Snake(this.txHead, this.segmentPool, bot.name, bot.color, this.world_size_x, this.world_size_y);
    snake.snake_id = bot.id;
    snake.db_id = bot.db_id;
    this.snakes[bot.id] = snake;
    this.snakesContainer.addChild(snake.Container);

    if (snake.db_id == this.follow_db_id)
    {
        this.ego_id = snake.snake_id;
        this.viewport.follow(snake.GetHeadSprite(), { radius: 0 });
    }

    return snake;
};

GameVisualization.prototype.RemoveSnake = function(id)
{
    if (id in this.snakes)
    {
        this.snakes[id].Destroy();
        delete this.snakes[id];
    }
};

GameVisualization.prototype.HandleGameInfoMessage = function(world_size_x, world_size_y, food_decay_rate)
{
    console.log("GameInfo received");
    this.world_size_x = world_size_x;
    this.world_size_y = world_size_y;
    this.food_decay_rate = food_decay_rate;
    this.foodMap = new ParticleGeoMap(this.world_size_x, this.world_size_y, 64, 64);
    this.foodContainer.removeChildren();
    this.foodContainer.addChild(this.foodMap.Container);
    this.UpdateMask();
    this.viewport.resize(this.container.clientWidth, this.container.clientHeight, this.world_size_x, this.world_size_y);
    this.viewport.fitWidth();
};

GameVisualization.prototype.HandleTickMessage = function(frame_id)
{
    for (let snake_id in this.snakes)
    {
        this.snakes[snake_id].AnimateEat();
    }

    let nth = 16;
    this.nextFoodDecayRow = (this.nextFoodDecayRow + 1) % nth;

    if (this.nextFoodDecayRow == 0)
    {
        for (let food_id in this.foodItems)
        {
            let item = this.foodItems[food_id];
            item.Decay(nth);
            if (!item.visible)
            {
                delete this.foodItems[food_id];
                this.foodItemPool.free(item);
            }
        }
        this.foodMap.CleanUp();
    }

    this.UpdateStagePosition();
};

GameVisualization.prototype.HandleWorldUpdateMessage = function(data)
{
    console.log("WorldUpdate received");
    for (let id in data.bots)
    {
        let bot = data.bots[id];
        if (!(bot.id in this.snakes))
        {
            this.CreateSnake(bot);
        }
        this.snakes[bot.id].SetData(bot);
    }

    for (let id in this.snakes)
    {
        if (!(id in data.bots))
        {
            this.RemoveSnake(id);
        }
    }

    for (let id in data.food)
    {
        let food = data.food[id];
        this.AddFood(food.id, food.pos_x, food.pos_y, food.value);
    }
};

GameVisualization.prototype.AddFood = function(food_id, pos_x, pos_y, value)
{
    let sprite = this.foodItemPool.get();
    sprite.SetData(this.food_decay_rate, food_id, pos_x, pos_y, value);
    this.foodItems[food_id] = sprite;
    this.foodMap.AddSprite(sprite);
};

GameVisualization.prototype.HandleBotSpawnMessage = function(bot)
{
    this.CreateSnake(bot);
};

GameVisualization.prototype.HandleBotKilledMessage = function(killer_id, victim_id)
{
    this.RemoveSnake(victim_id);
};

GameVisualization.prototype.HandleFoodSpawnMessage = function(food_id, pos_x, pos_y, value)
{
    this.AddFood(food_id, pos_x, pos_y, value);
};

GameVisualization.prototype.HandleFoodConsumedMessage = function(food_id, consumer_id)
{
    if (food_id in this.foodItems)
    {
        let sprite = this.foodItems[food_id];
        if (consumer_id in this.snakes)
        {
            this.snakes[consumer_id].Eat(sprite);
        }
        else
        {
            this.foodItems[food_id].visible = false;
            delete this.foodItems[food_id];
            this.foodItemPool.free(sprite);
        }
    }
};

GameVisualization.prototype.HandleFoodDecayedMessage = function(food_id)
{
    if (food_id in this.foodItems)
    {
        let sprite = this.foodItems[food_id];
        sprite.visible = false;
    }
};

GameVisualization.prototype.HandleBotMovedMessage = function(bot_id, segment_data, length, segment_radius)
{
    if (bot_id in this.snakes)
    {
        this.snakeMoveStrategy.OldStyleMove(this.snakes[bot_id], segment_data, length, segment_radius);
        this.snakes[bot_id].UpdateHead();
    }
};

GameVisualization.prototype.HandleBotMoved2Message = function(bot_id, heading, speed, length, segment_radius)
{
    if (bot_id in this.snakes)
    {
        this.snakeMoveStrategy.NewStyleMove(this.snakes[bot_id], heading, speed, length, segment_radius);
        this.snakes[bot_id].UpdateHead();
    }
};

GameVisualization.prototype.FollowDbId = function(db_id)
{
    this.follow_db_id = db_id;
    for (let id in this.snakes)
    {
        let snake = this.snakes[id];
        if (snake.db_id == db_id)
        {
            this.viewport.follow(snake.GetHeadSprite(), { radius: 200 });
        }
    }
}

GameVisualization.prototype.UpdateStagePosition = function()
{
    if (this.ego_id in this.snakes)
    {
        /*let egoSnake = this.snakes[this.ego_id];
        let egoX = egoSnake.GetHeadX();
        let egoY = egoSnake.GetHeadY();

        let transX = (this.app.renderer.width/2) - egoX;
        let transY = (this.app.renderer.height/2) - egoY;
        this.app.stage.setTransform(transX, transY);
        if (this.foodMap)
        {
            this.foodMap.Update(egoX, egoY, this.app.renderer.width, this.app.renderer.height);
        } */
    } else {
        this.app.stage.setTransform(0,0);
        if (this.foodMap)
        {
            this.foodMap.Update(this.world_size_x/2, this.world_size_y/2, this.world_size_x, this.world_size_y);
        }
    }
};
