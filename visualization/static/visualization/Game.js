"use strict";

function Game(assets, snakeMoveStrategy, container)
{
    this.ws = null;
    this.heading = 0;
    this.speed = 2;
    this.last_heading = null;
    this.mouse_x = null;
    this.mouse_y = null;
    this.vis = new GameVisualization(assets, snakeMoveStrategy, container);

    this.keys = {
        cursorLeft: keyboard(37),
        cursorRight: keyboard(39)
    };

    //this.protocol = new MsgpackProtocol();
    this.protocol = new JsonProtocol();
    this.protocol.AddEventHandler('GameInfo', this.vis.HandleGameInfoMessage, this.vis);
    this.protocol.AddEventHandler('PlayerInfo', this.vis.HandlePlayerInfoMessage, this.vis);
    this.protocol.AddEventHandler('Tick', this.vis.HandleTickMessage, this.vis);
    this.protocol.AddEventHandler('WorldUpdate', this.vis.HandleWorldUpdateMessage, this.vis);
    this.protocol.AddEventHandler('BotSpawn', this.vis.HandleBotSpawnMessage, this.vis);
    this.protocol.AddEventHandler('BotKilled', this.vis.HandleBotKilledMessage, this.vis);
    this.protocol.AddEventHandler('FoodSpawn', this.vis.HandleFoodSpawnMessage, this.vis);
    this.protocol.AddEventHandler('FoodConsumed', this.vis.HandleFoodConsumedMessage, this.vis);
    this.protocol.AddEventHandler('FoodDecayed', this.vis.HandleFoodDecayedMessage, this.vis);
    this.protocol.AddEventHandler('BotMoved', this.vis.HandleBotMovedMessage, this.vis);
    this.protocol.AddEventHandler('BotsMovedDone', this.vis.HandleBotMovedMessagesDone, this.vis);
}

Game.prototype.Run = function()
{
    let self = this;
    this.ConnectWebsocket();
    window.setInterval(function() { self.OnInterval(); }, 10);
    this.vis.Run();
};

Game.prototype.ConnectWebsocket = function()
{
    this.ws = new WebSocket(this.GetWebsocketURL());
    this.ws.binaryType = 'arraybuffer';
    let self = this;
    this.ws.addEventListener('open', function(event) {
       console.log("websocket connected");
    });
    this.ws.addEventListener('message', function(event) {
        self.protocol.HandleMessage(event);
    });
};

Game.prototype.GetWebsocketURL = function()
{
    let port = location.port;
    if (port > 60000) // pycharm debugging
    {
        port = 8000;
    }
    port = 80; 
    return (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname + ":" + port + "/websocket";
};

Game.prototype.OnInterval = function ()
{
    let ego = this.vis.GetEgoSnake();
    if (ego) {
        if (this.mouse_x)
        {
            let dx = this.mouse_x - ego.GetHeadX();
            let dy = this.mouse_y - ego.GetHeadY();
            this.heading = Math.atan2(dy, dx);
        }

    }

    if (this.keys.cursorLeft.isDown)
    {
        this.heading -= delta*Math.PI/50;
    }
    else if (this.keys.cursorRight.isDown)
    {
        this.heading += delta*Math.PI/50;
    }
    if (this.heading != this.last_heading)
    {
        this.SendHeading();
        this.last_heading = this.heading;
    }
};

Game.prototype.SendHeading = function()
{
    if (this.ws && (this.ws.readyState == 1))
    {
        this.ws.send(notepack.encode(this.heading));
    }
};

Game.prototype.wrap = function(v, w)
{
    while (v<0) { v += w; }
    while (v>w) { v -= w; }
    return v;
};

Game.prototype.MockupInit = function()
{
    this.vis.HandleGameInfoMessage(1024, 1024, 0.001);

    let food = {};
    for (let id=0; id<1000; id++)
    {
        food[id] = { id: id, pos_x:Math.random()*1024, pos_y:Math.random()*1024, value:Math.random()*5};
    }

    let bots = {};
    let num_bots = 10;
    for (let id=10000; id<10000+num_bots; id++)
    {
        let heading = 2*Math.PI*Math.random();
        let bot = { id: id, name:"test", radius:1, heading:heading, speed:2, snake_segments:[] };
        let pos_x = 1024 * Math.random();
        let pos_y= 1024 * Math.random();
        for (let i=0; i< ( 20 + Math.floor(1000*Math.random())); i++)
        {
            bot.snake_segments.push({ pos_x: pos_x, pos_y: pos_y });
            pos_x = this.wrap(pos_x - bot.speed*Math.cos(heading), 1024);
            pos_y = this.wrap(pos_y - bot.speed*Math.sin(heading), 1024);
        }
        bots[bot.id] = bot;
    }

    this.state = { bots: bots, food: food };
    this.vis.HandleWorldUpdateMessage(this.state);
    this.vis.HandlePlayerInfoMessage(10000);

    let self = this;
    window.setInterval(function()
    {
        self.MockupStep();
    }, 1000/20);
};

Game.prototype.MockupStep = function ()
{
    let ego = this.vis.GetEgoSnake();
    for (let i in this.state.bots)
    {
        let bot = this.state.bots[i];
        if (ego && (i == ego.snake_id))
        {
            bot.heading = this.heading;
            bot.speed = this.speed;
        }

        let length = bot.snake_segments.length;
        bot.segment_radius = 0.8*Math.sqrt(length);
        let s0 = bot.snake_segments[0];
        let segments = [
            [
                this.wrap(s0.pos_x + bot.speed*Math.cos(bot.heading), 1024),
                this.wrap(s0.pos_y + bot.speed*Math.sin(bot.heading), 1024)
            ]
        ];
        bot.snake_segments.unshift({ pos_x: segments[0][0], pos_y: segments[0][1] });
        if (Math.random() < 0.95)
        {
            bot.snake_segments.pop();
        }
        this.vis.HandleBotMovedMessage(i, segments, length, bot.segment_radius);
        this.vis.HandleBotMoved2Message(i, bot.heading, bot.speed, length, bot.segment_radius);

        let snake = this.vis.snakes[i];
        this.vis.foodMap.FindItemsInRadius(snake.GetHeadX(), snake.GetHeadY(), 2.5 * snake.GetSegmentRadius(), function(item) {
            this.vis.foodMap.RemoveItem(item.item_id);
            snake.Eat(item);
        }, this);

        snake.AnimateEat();
    }

    this.vis.HandleBotMovedMessagesDone();
};
