"use strict";

function Game(assets, snakeMoveStrategy, container)
{
    this.ws = null;
    this.heading = 0;
    this.speed = 2;
    this.viewer_key = 0;
    this.snakeMoveStrategy = snakeMoveStrategy;
    this.vis = new GameVisualization(assets, snakeMoveStrategy, container);
    this.logHandlers = [];
    this.gameEventHandlers = [];
    this.gameInfoReceived = false;
    this.preGameInfoMessages = [];

    let vis=this.vis;
    $("#followmsg").click(function(event) {
        vis.Unfollow();
        $("#followmsg").hide();
        event.preventDefault();
    });

}

Game.prototype.AddLogHandler = function(callback, thisArg)
{
    this.logHandlers.push([callback, thisArg]);
};

Game.prototype.AddGameEventHandler = function(callback, thisArg)
{
    this.gameEventHandlers.push([callback, thisArg]);
};

Game.prototype.SendGameEvent = function(className, message)
{
    for (let i of this.gameEventHandlers)
    {
        i[0].call(i[1], className, message);
    }
};

Game.prototype.Run = function()
{
    this.ConnectWebsocket();
    this.vis.Run();
};

Game.prototype.ConnectWebsocket = function()
{
    this.ws = new ReconnectingWebSocket(this.GetWebsocketURL());
    this.ws.binaryType = 'arraybuffer';
    let self = this;
    this.ws.addEventListener('open', function(event) {
       console.log("websocket connected");
       if (self.viewer_key != 0)
       {
           self.SetViewerKey(self.viewer_key);
       }
    });
    this.ws.addEventListener('message', function(event) {
        self.HandleMessage(event);
    });
};

Game.prototype.GetWebsocketURL = function()
{
    return (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + "/websocket";
};

Game.prototype.SetViewerKey = function(key)
{
    this.viewer_key = key;
    if (this.ws)
    {
        let msg = {viewer_key: this.viewer_key };
        let s = JSON.stringify(msg);
        this.ws.send(s);
    }
};

Game.prototype.HandleMessage = function(event)
{
    let data = JSON.parse(event.data);

    if (data.t == "GameInfo")
    {
        this.gameInfoReceived = true;
        if (this.snakeMoveStrategy.SetGameInfo)
        {
            this.snakeMoveStrategy.SetGameInfo(data);
        }
        this.vis.HandleGameInfoMessage(data.world_size_x, data.world_size_y, data.food_decay_per_frame);
        while (this.preGameInfoMessages.length > 0)
        {
            this.HandleMessage(this.preGameInfoMessages.pop());
        }
        return;
    } else if (!this.gameInfoReceived)
    {
        this.preGameInfoMessages.push(event);
        return;
    }

    switch (data.t)
    {
        case "WorldUpdate":
            return this.vis.HandleWorldUpdateMessage(data);

        case "Tick":
            return this.vis.HandleTickMessage(data.frame_id);

        case "BotSpawn":
            return this.vis.HandleBotSpawnMessage(data.bot);

        case "BotKill":
            let killer = this.vis.snakes[data.killer_id];
            let victim = this.vis.snakes[data.victim_id];
            if (killer && victim)
            {
                if (data.killer_id != data.victim_id)
                {
                    let msg = killer.GetName() + " 🐍 " + victim.GetName();
                    this.SendGameEvent("kill", msg);
                }
            }
            return this.vis.HandleBotKilledMessage(data.killer_id, data.victim_id);

        case "BotMove":
            for (let i=0; i<data.items.length; i++)
            {
                let b = data.items[i];
                this.vis.HandleBotMovedMessage(b.bot_id, b.segment_data, b.length, b.segment_radius);
            }
            return;

        case "BotStats":
            this.HandleBotStatsMessage(data.data);
            return;

        case "BotMoveHead":
            for (let bot of data.items)
            {
                this.vis.HandleBotMoveHeadMessage(bot.bot_id, bot.m, bot.p);
            }
            return;

        case "FoodSpawn":
            for (let item of data.items)
            {
                this.vis.HandleFoodSpawnMessage(item.id, item.pos_x, item.pos_y, item.value);
            }
            return;

        case "FoodConsume":
            for (let item of data.items)
            {
                this.vis.HandleFoodConsumedMessage(item.food_id, item.bot_id);
            }
            return;

        case "FoodDecay":
            for (let item of data.items)
            {
                this.vis.HandleFoodDecayedMessage(item);
            }
            return;

        case "Log":
            for (let item of this.logHandlers)
            {
                item[0].call(item[1], data.frame, data.msg);
            }
            return;

        default:
            return;
    }

};

Game.prototype.HandleBotStatsMessage = function(data)
{
    let el = $('#bot_stats tbody');
    let vis = this.vis;
    el.empty();

    let arr=[];
    for (let id in data)
    {
        data[id].id = id;
        arr.push(data[id]);
    }
    arr.sort(function(a,b) { return b.m-a.m; });
    this.stats = arr;
    for (let d of arr.slice(0, 20))
    {
        let snake = this.vis.GetSnake(d.id);
        if (!snake) { continue; }
        let row = $("<tr><td>"+snake.GetName()+"</td><td>"+d.m.toFixed(1)+"</td><td>"+d.n.toFixed(1)+"</td><td>"+d.c.toFixed(1)+"</td><td>"+d.h.toFixed(1)+"</td></tr>");
        row.click(function() { vis.FollowName(snake.GetName(), true)});
        el.append(row);
    }
};
