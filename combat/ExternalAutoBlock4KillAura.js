///api_version=2
//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
(script = registerScript({
    name: "ExternalAutoBlock4KillAura",
    version: "1.0",
    authors: ["commandblock2"]
})).import("Core.lib")

blockingTimeOut = null


module =
{
    name: "ExternalAutoBlock4KillAura",
    description: "ExternalAutoBlock4KillAura",
    author: "commandblock2",
    category: "combat",
    values: [
        hurtTime = value.createInteger("HurtTime", 2, 1, 10),
        extraDelay4Blocking = value.createInteger("ExtraDelay", 1, 0, 10),
        extraDelay = value.createInteger("ExtraIdleDelay", 0, 0, 10)
    ],

    onAttack: function () {
        if (mc.thePlayer.hurtTime && mc.thePlayer.hurtTime <= hurtTime.get() && KillAuraModule.state) {
            if (blockingTimeOut) return

            disableKillAura()
            doBlock()

            blockingTimeOut = timeout((mc.thePlayer.hurtTime + extraDelay4Blocking.get()) * 50, function () {
                doUnblock()
                timeout(extraDelay.get() * 50, function () {
                    reReableKillAura()
                    blockingTimeOut = null
                })
            })
        }
    },

    onUpdate: function () {
        if (blockingTimeOut && KillAuraModule.state) {
            //manually toggoled
            blockingTimeOut.cancel()
            blockingTimeOut = null

            KillAuraModule.state = false

            doUnblock()
        }
    }
}

function doUnblock() {
    mc.gameSettings.keyBindUseItem.pressed = false
}

function reReableKillAura() {
    KillAuraModule.state = true
}

function doBlock() {
    mc.gameSettings.keyBindUseItem.pressed = true
}

function disableKillAura() {
    KillAuraModule.state = false
}
