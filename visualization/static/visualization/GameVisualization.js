"use strict";

function GameVisualization(assets, snakeMoveStrategy)
{
    this.snakeMoveStrategy = snakeMoveStrategy;
    this.snakes = {};
    this.ego = { id: 0, interactive:false };
    this.nextFoodDecayRow = 0;
    this.world_size_x = 1024;
    this.world_size_y = 1024;
    this.food_decay_rate = 0.001;

    this.colorSchemes = [
        [ 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xA00000, 0xA00000, 0xA00000, 0xA00000 ],
        [ 0x00FF00, 0x00FF00, 0x00FF00, 0x00FF00, 0x00A000, 0x00A000, 0x00A000, 0x00A000 ],
        [ 0x0000FF, 0x0000FF, 0x0000FF, 0x0000FF, 0x0000A0, 0x0000A0, 0x0000A0, 0x0000A0 ],
        [ 0xFF0000, 0xFF0000, 0x444444 ],
        [ 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x444444, 0x00FF00 ],
        [ 0xFFBA00, 0xFFBA00, 0xFFBA00, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555, 0x555555 ],
        [ 0xAAAAAA, 0x999999, 0x888888, 0x777777, 0x666666, 0x555555, 0x444444, 0x555555, 0x666666, 0x777777, 0x888888, 0x999999 ],
        [ 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF,  ],
    ];

    this.app = new PIXI.Application();
    this.app.stage.interactiveChildren = false;

    this.txHead = PIXI.Texture.fromImage(assets['head.png']);
    this.txBody = PIXI.Texture.fromImage(assets['body.png']);
    this.txFood = PIXI.Texture.fromImage(assets['food.png']);
    let txBackground = PIXI.Texture.fromImage(assets['background.png']);

    let backgroundStage = new PIXI.Container();
    this.app.stage.addChild(backgroundStage);

    let backgroundLogo = new PIXI.Sprite(txBackground);
    backgroundLogo.anchor.set(0.5);
    backgroundStage.addChild(backgroundLogo);

    this.mainStage = new PIXI.Container();
    this.app.stage.addChild(this.mainStage);
}

GameVisualization.prototype.GetEgoSnake = function()
{
    if (this.ego.id in this.snakes)
    {
        return this.snakes[this.ego.id];
    }
};

GameVisualization.prototype.Run = function(container)
{
    container.appendChild(this.app.view);
    this.GetRenderer().resize(container.clientWidth, container.clientHeight);
    this.app.ticker.add(this.GameTick, this);
};

GameVisualization.prototype.GameTick = function(delta)
{
    this.UpdateStagePosition();
};

GameVisualization.prototype.Resize = function (width, height)
{
    this.app.renderer.resize(width, height);
};

GameVisualization.prototype.GetRenderer = function()
{
    return this.app.renderer;
}

GameVisualization.prototype.CreateSnake = function(id)
{
    let tint = this.colorSchemes[id % this.colorSchemes.length];
    let snake = new Snake(this.txHead, this.txBody, tint, this.world_size_x, this.world_size_y);
    snake.snake_id = id;
    this.snakes[id] = snake;
    this.mainStage.addChild(snake.Container);
    return snake;
};

GameVisualization.prototype.RemoveSnake = function(id)
{
    if (id in this.snakes)
    {
        this.mainStage.removeChild(this.snakes[id].Container);
        delete this.snakes[id];
    }
};

GameVisualization.prototype.HandleGameInfoMessage = function(world_size_x, world_size_y, food_decay_rate)
{
    this.world_size_x = world_size_x;
    this.world_size_y = world_size_y;
    this.food_decay_rate = food_decay_rate;
    this.foodMap = new ParticleGeoMap(this.world_size_x, this.world_size_y, 64, 64);
    this.app.stage.addChildAt(this.foodMap.Container, 1);
};

GameVisualization.prototype.HandleTickMessage = function(frame_id)
{
    for (let snake_id in this.snakes)
    {
        this.snakes[snake_id].AnimateEat();
    }

    this.foodMap.IterateRow(this.nextFoodDecayRow++, function(food) {
        food.Decay(32);
    }, this);
    this.foodMap.IterateRow(this.nextFoodDecayRow++, function(food) {
        food.Decay(32);
    }, this);
    this.nextFoodDecayRow %= 64;
};

GameVisualization.prototype.HandlePlayerInfoMessage = function(player_id)
{
    this.ego.id = player_id;
    //this.ego.interactive = true;
    console.log("EGO Id: ", this.ego.id);
};

GameVisualization.prototype.HandleWorldUpdateMessage = function(data)
{
    for (let id in data.bots)
    {
        let bot = data.bots[id];
        if (!(bot.id in this.snakes))
        {
            this.CreateSnake(bot.id);
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
        this.foodMap.AddSprite(new FoodSprite(this.txFood, this.food_decay_rate, food.id, food.pos_x, food.pos_y, food.value));
    }
};

GameVisualization.prototype.HandleBotSpawnMessage = function(bot)
{
    let snake = this.CreateSnake(bot.id);
    snake.SetData(bot);
};

GameVisualization.prototype.HandleBotKilledMessage = function(killer_id, victim_id)
{
    this.RemoveSnake(victim_id);
};

GameVisualization.prototype.HandleFoodSpawnMessage = function(food_id, pos_x, pos_y, value)
{
    this.foodMap.AddSprite(new FoodSprite(this.txFood, this.food_decay_rate, food_id, pos_x, pos_y, value));
};

GameVisualization.prototype.HandleFoodConsumedMessage = function(food_id, consumer_id)
{
    let sprite = this.foodMap.RemoveItem(food_id);
    if (sprite)
    {
        this.snakes[consumer_id].Eat(sprite);
    }
};

GameVisualization.prototype.HandleFoodDecayedMessage = function(food_id)
{
    this.foodMap.RemoveItem(food_id);
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

GameVisualization.prototype.HandleBotMovedMessagesDone = function(data)
{
    this.HandleTickMessage();
    this.UpdateStagePosition();
};

GameVisualization.prototype.UpdateStagePosition = function()
{
    if (this.ego.interactive)
    {
        let egoX = 0;
        let egoY = 0;

        if (this.ego.id in this.snakes)
        {
            let egoSnake = this.snakes[this.ego.id];
            egoX = egoSnake.GetHeadX();
            egoY = egoSnake.GetHeadY();
        }

        let transX = (this.app.renderer.width/2) - egoX;
        let transY = (this.app.renderer.height/2) - egoY;
        this.app.stage.setTransform(transX, transY);
        if (this.foodMap) {
            this.foodMap.Update(egoX, egoY, this.app.renderer.width, this.app.renderer.height);
        }
    } else {
        this.app.stage.setTransform(0,0);
        if (this.foodMap)
        {
            this.foodMap.Update(this.world_size_x/2, this.world_size_y/2, this.world_size_x, this.world_size_y);
        }
    }
};
