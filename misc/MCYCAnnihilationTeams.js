//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
NetworkPlayerInfo = Java.type("net.minecraft.client.network.NetworkPlayerInfo")
MSTimer = Java.type("net.ccbluex.liquidbounce.utils.timer.MSTimer")

translation = [["蓝", "Blue", "§1"], ["黄", "Yellow", "§e"], ["红", "Red", "§4"], ["绿", "Green", "§2"]]
team = []

msTimer = new MSTimer()
scoreBoard = null
function getColor(string) {
    ret = "TEAM NOT FOUND"

    translation.forEach(function (e) {
        if (string.indexOf(e[0]) != -1)
            ret = e[1]
    })

    return ret
}

module = {
    name: "MCYCAnnihilationTeams",
    description: "MCYCAnnihilationTeams",
    author: "commandblock2",
    category: "misc",

    onEnable: function () {
        if (mc.theWorld) {
            scoreBoard = mc.theWorld.getScoreboard()
            try {
                translation.forEach(function (e) {
                    scoreBoard.createTeam(e[1]).setNameSuffix(e[2])
                })
            }
            catch (e) { }
        }
    },

    onWorld: function (event) {
        scoreBoard = mc.theWorld.getScoreboard()
        try {
            translation.forEach(function (e) {
                scoreBoard.createTeam(e[1]).setNameSuffix(e[2])
            })
        }
        catch (e) { }
    },

    onUpdate: function () {

        if (scoreBoard && msTimer.hasTimePassed(5000))
            Java.from(mc.thePlayer.sendQueue.getPlayerInfoMap()).forEach(function (e) {
                try {
                    displayName = EntityUtils.getName(e)
                    scoreBoard.addPlayerToTeam(e.getGameProfile().getName(), getColor(displayName))


                    teams = LiquidBounce.moduleManager.getModule("Teams")
                    teams.state = true
                    teams.getValue("color").set(false)
                }
                catch (e) { }
            })
    },

    onPacket: function(e) {
        if(e.getPacket() instanceof S3EPacketTeams)
            e.cancelEvent()
        //fuck u for spammer that
    }
}

script.import("Core.lib")
