//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
module =
{
    name: "YetAnotherAutoLeave",
    description: "AutoLeave",
    author: "commandblock2",
    category: "misc",
    values: [
        health = value.createFloat("Health", 8, 1, 20),
        y = value.createFloat("minY", 0, -20, 100),
        message = value.createText("Message", "/leave")
    ],

    onUpdate: function () {
        if (mc.thePlayer.getHealth() < health.get()) {
            leave()
        }

        if (mc.thePlayer.posY < y.get()) {
            leave()
        }
    }
}

function leave() {
    mc.thePlayer.sendChatMessage(message.get())
    moduleManager.getModule("YetAnotherAutoLeave").setState(false)
}

script.import("Core.lib")
