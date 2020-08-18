///api_version=2
//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
//Part of these are skided from LB, but the license should be compatible
(script = registerScript({
    name: "TickPerSecond",
    version: "1.0",
    authors: ["commandblock2"]
})).import("Core.lib")

System = Java.type("java.lang.System")

Tps = 0.0

packetHistory = []

module = {
    name: "TickPerSecond",
    description: "Server TPS",
    author: "commandblock2",
    category: "misc",
    values: [
        duration = value.createFloat("Duration", 50.1, 1, 100),
        notifyIfAbnormal = value.createBoolean("NotifyIfAbnormal", true)
    ],

    onUpdate: function () {
        if (notifyIfAbnormal.get()) {
            count = 0.0
            packetHistory.forEach(function (e) {
                if (System.currentTimeMillis() < duration.get() * 1000 + e)
                    count++
            })

            if (count == packetHistory.length)
                return
            else if (count + 10 < packetHistory.length) {
                packetHistory.shift()
            }

            if (!mc.getCurrentServerData())
                count /= 2.0

            Tps = count * 20.0 / duration.get()

            if (Tps < 18)
                chat.print("Tps abnormal: " + Tps)
        }

    },

    onPacket: function (packetEvent) {
        p = packetEvent.getPacket();
        if (p instanceof S03PacketTimeUpdate)
            packetHistory.push(System.currentTimeMillis())
    },

    onDisable: function () { Tps = 0.0; packetHistory = [] }
}

command = {
    commands: ["tps"],

    onExecute: function () {
        if (Tps == 0.0)
            chat.print("Plz enable TickPerSecond module and wait a while")
        else
            chat.print("TPS = " + Tps)
    }
}
