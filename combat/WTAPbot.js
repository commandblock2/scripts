//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
RotationUtils = Java.type("net.ccbluex.liquidbounce.utils.RotationUtils")
PlayerExtension = Java.type("net.ccbluex.liquidbounce.utils.extensions.PlayerExtensionKt")
Class = Java.type("java.lang.Class")


var countDownClicks = 5

var target = null
var lasttarget = null
var isEnemy
var countDown = countDownClicks
var stage = 0

var lastFrameLeftDown = false
var continue_ = true

var forEach = Array.prototype.forEach;

module =
{
    name: "WTAPbot",
    description: "Bot that uses WTAP(mostly legit), left click 5 times to start(facing the same target), right click to stop",
    author: "commandblock2",
    category: "combat",
    values:
        [
            captureRange = value.createFloat("CaptureRange", 10, 0, 30),
            //hurtTime = value.createInteger("Hurttime", 10, 0, 10),
            //distanceMinus = value.createFloat("DistanceMinus", 0.2, 0, 1),
            slowDownFrames = value.createInteger("SlowDownFrames",10,0,60),
            block = value.createBoolean("Block", true),
            sneak = value.createBoolean("Sneak", false),
            noBack = value.createBoolean("No S-Tap", false)
        ],

    onRender3D: function () {
        var thisFrameLeftDown = mc.gameSettings.keyBindAttack.isKeyDown()

        if (!lastFrameLeftDown && thisFrameLeftDown)
            onLeftClick()
        lastFrameLeftDown = thisFrameLeftDown

        var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0

        if (countDown == 0) {
            //main loop
            if (target && (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) < maxDistance + captureRange.get()) && continue_) {

                aim()

                sprint = stage == slowDownFrames.get() ? /*PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) > maxDistance - distanceMinus.get()*/true : false

                mc.gameSettings.keyBindForward.pressed = sprint
                if(sprint && mc.thePlayer.movementInput.moveForward >= 0.8)
                    mc.thePlayer.setSprinting(true)
                else
                    mc.thePlayer.setSprinting(false)

                resetSprintState()

                if (stage < slowDownFrames.get())
                    stage++
            }
            else {
                //release
                mc.gameSettings.keyBindAttack.pressed = false
                mc.gameSettings.keyBindBack.pressed = false
                autoClicker.state = false
                target = null
                block.get() && (mc.gameSettings.keyBindUseItem.pressed = false);
                sneak.get() && (mc.gameSettings.keyBindSneak.pressed = false);
                noBack.get() || (mc.gameSettings.keyBindBack.pressed = false);
            }
        }
    },

    onEnable: function () {
        isEnemy = killAura.class.getDeclaredMethod("isEnemy", Class.forName("net.minecraft.entity.Entity"))
        isEnemy.setAccessible(true)
    },

    onUpdate: function () {

    },

    onAttack: function (e) {
        stage = 0
    },


    onDisable: function () { }
}

function resetSprintState() {
    if (stage == slowDownFrames.get()) {
        block.get() && (mc.gameSettings.keyBindUseItem.pressed = false);
        sneak.get() && (mc.gameSettings.keyBindSneak.pressed = false);
        noBack.get() || (mc.gameSettings.keyBindBack.pressed = false);
    }
    else {
        block.get() && (mc.gameSettings.keyBindUseItem.pressed = true);
        sneak.get() && (mc.gameSettings.keyBindSneak.pressed = true);
        noBack.get() || (mc.gameSettings.keyBindBack.pressed = true);
    }

    prevSprintState = comboSprint
}

function aim() {
    autoClicker.state = true
    mc.gameSettings.keyBindAttack.pressed = true
    RotationUtils.searchCenter(target.getEntityBoundingBox(), false, false, false, true).rotation.toPlayer(mc.thePlayer)
}

function onLeftClick() {
    entities = mc.theWorld.loadedEntityList

    mindiff = Number.MAX_VALUE
    target = null
    forEach.call(entities, function (elem) {
        diff = RotationUtils.getRotationDifference(elem)

        var maxDistance = reach.state ? reach.getValue("CombatReach").get() : 3.0
        if (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, elem) > maxDistance + captureRange.get())
            return

        if (elem == mc.thePlayer || !isEnemy.invoke(killAura, elem))
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
            comboSprint = true
        default:
            break;
    }
}

script.import("Core.lib")

autoClicker = LiquidBounce.moduleManager.getModule("autoClicker")
killAura = LiquidBounce.moduleManager.getModule("killaura")
reach = moduleManager.getModule("Reach");
