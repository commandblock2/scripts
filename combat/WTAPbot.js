//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
RotationUtils = Java.type("net.ccbluex.liquidbounce.utils.RotationUtils")
PlayerExtension = Java.type("net.ccbluex.liquidbounce.utils.extensions.PlayerExtensionKt");


var countDownClicks = 5

var target = null
var lasttarget = null
var countDown = countDownClicks

var lastFrameLeftDown = false

var forEach = Array.prototype.forEach;

module =
{
    name: "WTAPbot",
    description: "Bot that uses WTAP(mostly legit), left click 5 times to start(facing the same target), right click to stop",
    author: "commandblock2",
    category: "combat",
    values:
        [

        ],

    onRender3D: function () {
        thisFrameLeftDown = mc.gameSettings.keyBindAttack.isKeyDown()

        if (!lastFrameLeftDown && thisFrameLeftDown)
            onLeftClick()

        if (countDown == 0) {

            if (target == null || PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) > maxDistance + 10 || mc.gameSettings.keyBindUseItem.isKeyDown()) {
                countDown = countDownClicks
                chat.print("§c[WTAP]§7Lock release")
                mc.gameSettings.keyBindForward.pressed = false
                mc.gameSettings.keyBindBack.pressed = false
                mc.gameSettings.keyBindSprint = false
                return
            }

            aim()
            distance = PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target)

            reach = moduleManager.getModule("Reach");
            var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0

            if (distance < maxDistance - 0.5) {
                mc.gameSettings.keyBindBack.pressed = true
                mc.gameSettings.keyBindForward.pressed = false
                mc.thePlayer.keyBindSprint = false
            }
            else if (distance > maxDistance - 0.2 && distance < maxDistance - 0.1) {
                mc.gameSettings.keyBindForward.pressed = true
                mc.gameSettings.keyBindBack.pressed = false
                mc.thePlayer.keyBindSprint = false
            }
            else if (distance > maxDistance - 0.1) {
                mc.gameSettings.keyBindForward.pressed = true
                mc.gameSettings.keyBindBack.pressed = false
                mc.thePlayer.keyBindSprint = true
            }
            else {
                mc.gameSettings.keyBindForward.pressed = false
                mc.gameSettings.keyBindBack.pressed = false
                mc.thePlayer.keyBindSprint = false
            }
        }
        else {
            trigger.state = false
        }

        lastFrameLeftDown = thisFrameLeftDown
    },

    onEnable: function () { },


    onDisable: function () { },
}

function aim() {
    trigger.state = true
    RotationUtils.searchCenter(target.getEntityBoundingBox(), false, false, false, true).rotation.toPlayer(mc.thePlayer)
}

function onLeftClick() {
    entities = mc.theWorld.loadedEntityList

    mindiff = Number.MAX_VALUE
    target = null
    forEach.call(entities, function (elem) {
        diff = RotationUtils.getRotationDifference(elem)

        reach = moduleManager.getModule("Reach");
        var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0
        if (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, elem) > maxDistance + 10)
            return

        if (elem == mc.thePlayer)
            return

        if (diff < mindiff) {
            mindiff = diff
            target = elem
        }
    })

    if (lasttarget == target && target) {
        if (countDown > 0)
            countDown--
        else
            return
    }
    else {
        countDown = countDownClicks
        lasttarget = target
    }

    switch (countDown) {
        case 2:
            chat.print("§c[WTAP]§7Click 2 more time to lock target " + target.getName())
            break;

        case 0:
            chat.print("§c[WTAP]§7Target §d" + target.getName() + " §7acquiring lock")
        default:
            break;
    }
}

script.import("Core.lib")

trigger = LiquidBounce.moduleManager.getModule("trigger")
