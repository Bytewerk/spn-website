"use strict";

function Game(assets, snakeMoveStrategy, container)
{
    this.ws = null;
    this.heading = 0;
    this.speed = 2;
    this.viewer_key = 0;
    this.vis = new GameVisualization(assets, snakeMoveStrategy, container);

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
    this.ConnectWebsocket();
    this.vis.Run();
};

Game.prototype.ConnectWebsocket = function()
{
    this.ws = new WebSocket(this.GetWebsocketURL());
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
        self.protocol.HandleMessage(event);
    });
};

Game.prototype.GetWebsocketURL = function()
{
    return (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname + "/websocket";
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