"use strict";

function JsonProtocol()
{
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

    this.HandleMessage = function(event)
    {
        let data = JSON.parse(event.data);
        //console.log(data);
        switch (data.t)
        {
            case "GameInfo":
            {
                this.CallHandlers(this.GameInfoMessageHandlers, data.world_size_x, data.world_size_y, data.food_decay_per_frame);
                return;
            }

            case "WorldUpdate":
            {
                this.CallHandlers(this.WorldUpdateMessageHandlers, data);
                return;
            }

            case "Tick":
            {
                this.CallHandlers(this.TickMessageHandlers, data.frame_id);
                return;
            }

            case "BotSpawn":
            {
                this.CallHandlers(this.BotSpawnMessageHandlers, data.bot);
                return;
            }

            case "BotKill":
            {
                this.CallHandlers(this.BotKilledMessageHandlers, data.killer_id, data.victim_id);
                return;
            }

            case "BotMove":
            {
                for (let i=0; i<data.items.length; i++)
                {
                    let b = data.items[i];
                    this.CallHandlers(this.BotMovedMessageHandlers, b.bot_id, b.segment_data, b.length, b.segment_radius);
                }
                this.CallHandlers(this.BotsMovedDoneMessageHandlers);
                return;
            }

            case "FoodSpawn":
            {
                for (let i=0; i<data.items.length; i++)
                {
                    let f = data.items[i];
                    this.CallHandlers(this.FoodSpawnMessageHandlers, f.id, f.pos_x, f.pos_y, f.value);
                }
                return;
            }

            case "FoodConsume":
            {
                for (let i in data.items)
                {
                    let item = data.items[i];
                    this.CallHandlers(this.FoodConsumedMessageHandlers, item.food_id, item.bot_id);
                }
                return;
            }

            case "FoodDecay":
            {
                for (let i in data.items)
                {
                    this.CallHandlers(this.FoodDecayedMessageHandlers, data.items[i]);
                }
                return;
            }

            /*case 0xF0:
            {
                let player_id = data[2];
                this.CallHandlers(this.PlayerInfoMessageHandlers, player_id);
                return;
            }*/

            default:
                return;
        }
    };
}
