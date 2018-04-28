"use strict";

function MsgpackProtocol()
{
    this._nextMessageSize = 0;
    this._receiveBuffer = null;

    this.GameInfoMessageHandlers = [];
    this.TickMessageHandlers = [];
    this.PlayerInfoMessageHandlers = [];
    this.WorldUpdateMessageHandlers = [];
    this.BotSpawnMessageHandlers = [];
    this.BotMovedMessageHandlers = [];
    this.BotsMovedDoneMessageHandlers = [];
    this.BotKilledMessageHandlers = [];
    this.FoodSpawnMessageHandlers = [];
    this.FoodConsumedMessageHandlers = [];
    this.FoodDecayedMessageHandlers = [];

    this.AddEventHandler = function(messageName, func, thisArg)
    {
        let varName = messageName + 'MessageHandlers'
        let arr = this[varName];
        if (!arr)
        {
            console.error("cannot register handler for event '"+messageName+"': property '" + varName + "' does not exist.")
            return;
        }

        arr.push([func, thisArg]);
    };

    this.CallHandlers = function(handlers, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
    {
        for (let i in handlers)
        {
            let func = handlers[i][0];
            let thisArg = handlers[i][1];
            func.call(thisArg, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        }
        return true;
    };

    this.AppendBuffer = function(data)
    {
        if (!this._receiveBuffer || (this._receiveBuffer.length==0))
        {
            this._receiveBuffer = new Uint8Array(data);
        }
        else
        {
            let newBuffer = new Uint8Array(this._receiveBuffer.length + data.length);
            newBuffer.set(this._receiveBuffer);
            newBuffer.set(data, this._receiveBuffer.length);
            this._receiveBuffer = newBuffer;
        }

        while (this.ParseBuffer()) {}
    };

    this.ParseBuffer = function()
    {
        if (this._nextMessageSize==0)
        {
            let len = this._receiveBuffer.length;

            if (len<4)
            {
                return false;
            }
            else if (len == 4)
            {
                this._nextMessageSize = this.htonl(this._receiveBuffer);
                this._receiveBuffer = null;
                return false;
            }
            else
            {
                this._nextMessageSize = this.htonl(this._receiveBuffer);
                this._receiveBuffer = this._receiveBuffer.slice(4);
                return (this._receiveBuffer.length >= this._nextMessageSize);
            }
        }
        else if (this._receiveBuffer.length < this._nextMessageSize)
        {
            return false;
        }
        else if (this._receiveBuffer.length == this._nextMessageSize)
        {
            this.HandleMsgPackMessage(notepack.decode(this._receiveBuffer));
            this._receiveBuffer = null;
            this._nextMessageSize = 0;
            return false;
        }
        else
        {
            this.HandleMsgPackMessage(notepack.decode(this._receiveBuffer.slice(0, this._nextMessageSize)));
            this._receiveBuffer = this._receiveBuffer.slice(this._nextMessageSize);
            this._nextMessageSize = 0;
            return (this._receiveBuffer.length >= 4);
        }
    };

    this.htonl = function(buf)
    {
        return (buf[0]<<24) | (buf[1]<<16) | (buf[2]<<8) | buf[3];
    };

    this.HandleMessage = function(event)
    {
        let data = notepack.decode(event.data);
        let protocol_version = data[0];
        let message_type = data[1];

        if (protocol_version!=1)
        {
            return;
        }

        switch (message_type)
        {
            case 0x00:
            {
                let world_size_x = data[2];
                let world_size_y = data[3];
                let decay_rate   = data[4];
                this.CallHandlers(this.GameInfoMessageHandlers, world_size_x, world_size_y, decay_rate);
                return;
            }

            case 0x01:
            {
                this.CallHandlers(this.WorldUpdateMessageHandlers, new WorldUpdateMessage(data.slice(2)));
                return;
            }

            case 0x10:
            {
                let frame_id = data[2];
                this.CallHandlers(this.TickMessageHandlers, frame_id);
                return;
            }

            case 0x20:
            {
                this.CallHandlers(this.BotSpawnMessageHandlers, new Bot(data[2]));
                return;
            }

            case 0x21:
            {
                let killer_id = data[2];
                let victim_id = data[3];
                this.CallHandlers(this.BotKilledMessageHandlers, killer_id, victim_id);
                return;
            }

            case 0x22:
            {
                let bot_moved_items = data[2];
                for (let i=0; i<bot_moved_items.length; i++)
                {
                    let bot_data = bot_moved_items[i];
                    let bot_id = bot_data[0];
                    let segment_data = bot_data[1];
                    let length = bot_data[2];
                    let segment_radius = bot_data[3];

                    this.CallHandlers(this.BotMovedMessageHandlers, bot_id, segment_data, length, segment_radius);
                }
                this.CallHandlers(this.BotsMovedDoneMessageHandlers);
                return;
            }

            case 0x30:
            {
                let items = data[2];
                for (let i=0; i<items.length; i++)
                {
                    let item = items[i];
                    let id = item[0];
                    let pos_x = item[1];
                    let pos_y = item[2];
                    let value = item[3];
                    this.CallHandlers(this.FoodSpawnMessageHandlers, id, pos_x, pos_y, value);
                }
                return;
            }

            case 0x31:
            {
                let food_consumed_items = data[2];
                for (let i in food_consumed_items)
                {
                    let item = food_consumed_items[i];
                    let food_id = item[0];
                    let consumer_id = item[1];
                    this.CallHandlers(this.FoodConsumedMessageHandlers, food_id, consumer_id)
                }
                return;
            }

            case 0x32:
            {
                let food_ids = data[2];
                for (let i in food_ids)
                {
                    this.CallHandlers(this.FoodDecayedMessageHandlers, food_ids[i]);
                }
                return;
            }

            case 0xF0:
            {
                let player_id = data[2];
                this.CallHandlers(this.PlayerInfoMessageHandlers, player_id);
                return;
            }

            default:
                return;
        }
    };
}

function WorldUpdateMessage(data)
{
    let bot_data = data.shift();
    let food_data = data.shift();

    this.bots = {};
    this.food = {};

    for (let i in bot_data)
    {
        let bot = new Bot(bot_data[i]);
        this.bots[bot.id] = bot;
    }

    for (let i in food_data)
    {
        let food = new Food(food_data[i]);
        this.food[food.id] = food;
    }
}

function Bot(data)
{
    this.id = data.shift();
    this.name = data.shift();
    this.segment_radius = data.shift();
    let segment_data = data.shift();
    this.color = data.shift();

    this.snake_segments = [];
    for (let i in segment_data)
    {
        this.snake_segments.push({"pos_x": segment_data[i][0], "pos_y": segment_data[i][1]});
    }
}

function Food(data)
{
    this.id = data.shift();
    this.pos_x = data.shift();
    this.pos_y = data.shift();
    this.value = data.shift();
}
