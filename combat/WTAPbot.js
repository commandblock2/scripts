//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
RotationUtils = Java.type("net.ccbluex.liquidbounce.utils.RotationUtils")
PlayerExtension = Java.type("net.ccbluex.liquidbounce.utils.extensions.PlayerExtensionKt");


var countDownClicks = 5

var lasttarget = null
var countDown = countDownClicks

var lastFrameLeftDown = false

var forEach = Array.prototype.forEach;

module =
{
    name: "WTAPbot",
    description: "Bot that uses WTAP to ",
    author: "commandblock2",
    category: "combat",
    values:
        [
            
        ],
    
    onRender3D: function() 
    {
        thisFrameLeftDown = mc.gameSettings.keyBindAttack.isKeyDown()

        if(!lastFrameLeftDown && thisFrameLeftDown)
            onLeftClick()

        if (countDown == 0)
        {
            distance = PlayerExtension.getDistanceToEntityBox(mc.thePlayer,target)

            var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0

            if (distance < maxDistance - 0.1)
            {
                mc.gameSettings.keyBindBack.pressed = true
                mc.gameSettings.keyBindForward.pressed = false
            }
            else if (distance > maxDistance + 0.1)
            {
                mc.gameSettings.keyBindForward.pressed = true
                mc.gameSettings.keyBindBack.pressed = false
            }
            else if (distance > maxDistance + 0.3)
            {
                mc.gameSettings.keyBindForward.pressed = true
                mc.gameSettings.keyBindBack.pressed = false

                mc.thePlayer.setSprinting(true)
            }
            else
            {
                mc.gameSettings.keyBindBack.pressed = false
                mc.gameSettings.keyBindBack.pressed = false
            }
        }

        lastFrameLeftDown = thisFrameLeftDown
    },

    onEnable: function () { },


    onDisable: function () { },
}

function onLeftClick()
{
    entities = mc.theWorld.loadedEntityList

    mindiff = Number.MAX_VALUE
    target = null
    forEach.call(entities,function (elem)
    {
        diff = RotationUtils.getRotationDifference(elem)

        reach = moduleManager.getModule("Reach");
        var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0
        if (PlayerExtension.getDistanceToEntityBox(mc.thePlayer,elem) > maxDistance + 5)
            return

        if (elem == mc.thePlayer)
            return

        if (diff < mindiff)
        {
            mindiff = diff
            target = elem
        }
    })

    if(lasttarget == target)
        if(countDown > 0)
            countDown--
    else
    {
        countDown = countDownClicks
        lasttarget = target
    }

    switch (countDown) 
    {
        case 2:
            chat.print("Click 2 more time to lock target " + target.getName())
            break;

        case 0:
            chat.print("Target " + target.getName() +" acquiring lock")
        default:
            break;
    }
}

script.import("Core.lib")
