//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later

command = {
    commands: ["playerlocation", "pl"],
    //subcommands: { show: "", broadcast: "" },
    //if it could be optional it would be uncommented

    onExecute: function (args) {
        if (args.length == 2) args = ["pl", "show", args[1]]

        playerName = args[2]
        location = null

        Java.from(mc.theWorld.loadedEntityList).forEach(function (e) {
            if (e.getName() == playerName)
                location = e.getPositionVector()
        })

        broadCast = args[1].toLowerCase() == "broadcast"

        locationString = "Player " + playerName +
            (location ? (" is at x = " + location.xCoord + " y = " + location.yCoord + " z = " + location.zCoord) : " not in view distance")

        if (broadCast)
            mc.thePlayer.sendChatMessage(locationString)
        else
            chat.print(locationString)
    }
}

function idk(num, bool) {
    return (bool? num : Math.floor(num))
}

script.import("Core.lib")
