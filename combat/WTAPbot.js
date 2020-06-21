//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
RotationUtils = Java.type("net.ccbluex.liquidbounce.utils.RotationUtils")
PlayerExtension = Java.type("net.ccbluex.liquidbounce.utils.extensions.PlayerExtensionKt")
Class = Java.type("java.lang.Class")
Keyboard = Java.type("org.lwjgl.input.Keyboard")

var countDownClicks = 5

var target = null
var targetPrevPoss = []
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
    description: "Bot that uses WTAP(mostly legit), left click 5 times to start",
    author: "commandblock2",
    category: "combat",
    values:
        [
            captureRange = value.createFloat("CaptureRange", 10, 0, 30),
            //hurtTime = value.createInteger("Hurttime", 10, 0, 10),
            //distanceMinus = value.createFloat("DistanceMinus", 0.2, 0, 1),
            slowDownFrames = value.createInteger("SlowDownFrames", 6, 5, 60),
            block = value.createBoolean("Block", true),
            sneak = value.createBoolean("Sneak", false),
            stopKey = value.createText("StopKey", "Z"),
            noBack = value.createBoolean("No S-Tap", true),
            aimMode = value.createList("AimMode", ["Predictive", "Face", "LegitLike"], "Predictive")
        ],

    onRender3D: function () {
        var thisFrameLeftDown = mc.gameSettings.keyBindAttack.isKeyDown()

        if (!lastFrameLeftDown && thisFrameLeftDown)
            onLeftClick()
        lastFrameLeftDown = thisFrameLeftDown

        if (countDown == 0) {
            //main loop
            mc.gameSettings.keyBindSprint.pressed = true
            if (mc.theWorld.loadedEntityList.indexOf(target) != -1 && (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) < getMaxDistance() + captureRange.get()) && continue_) {

                aim()

                foward = stage == slowDownFrames.get() ? true : false

                mc.gameSettings.keyBindForward.pressed = foward

                resetSprintState()

                if (stage < slowDownFrames.get())
                    stage++
            }
            else {
                //release
                mc.gameSettings.keyBindSprint.pressed = false
                stage = slowDownFrames.get()
                countDown = 5
                mc.gameSettings.keyBindAttack.pressed = false
                mc.gameSettings.keyBindBack.pressed = false
                autoClicker.state = false
                target = null
                block.get() && (mc.gameSettings.keyBindUseItem.pressed = false);
                sneak.get() && (mc.gameSettings.keyBindSneak.pressed = false);
                noBack.get() || (mc.gameSettings.keyBindBack.pressed = false);
                mc.gameSettings.keyBindForward.pressed = false;
                continue_ = true
            }
        }
    },

    onEnable: function () {
        isEnemy = killAura.class.getDeclaredMethod("isEnemy", Class.forName("net.minecraft.entity.Entity"))
        isEnemy.setAccessible(true)
    },

    onUpdate: function () {
        if (target)
            targetPrevPoss.push(target.getPositionVector())
        else
            targetPrevPoss = []

        if (targetPrevPoss.length > 10)
            targetPrevPoss.shift()
    },

    onAttack: function (e) {
        stage = 0
    },

    onKey: function (e) {
        if (e.getKey() == eval("Keyboard.KEY_" + stopKey.get().toUpperCase()))
            continue_ = false
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

    targetPrevPoss[targetPrevPoss.length - 1] = target.getPositionVector()

    index = Math.floor(targetPrevPoss.length * (1 - Math.max(Math.min(PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) / getMaxDistance() - 1, 1), 0.01)))
    vecTarget = targetPrevPoss[index]

    x_offset = vecTarget.xCoord - target.posX; y_offset = vecTarget.yCoord - target.posY; z_offset = vecTarget.zCoord - target.posZ;

    if(aimMode.get() == "Face"){
        x_offset = y_offset = z_offset = 0;
    }
    else if(aimMode.get() == "Predictive"){
        x_offset = -x_offset; y_offset = -y_offset; z_offset = -z_offset
    }


    RotationUtils.searchCenter(target.getEntityBoundingBox().offset(x_offset, y_offset, z_offset), false, false, false, true).rotation.toPlayer(mc.thePlayer)
}

function getMaxDistance() {
    return reach.state ? reach.getValue("CombatReach").get() : 3.0
}

function onLeftClick() {
    entities = mc.theWorld.loadedEntityList

    mindiff = Number.MAX_VALUE
    target = null
    forEach.call(entities, function (elem) {
        diff = RotationUtils.getRotationDifference(elem)

        if (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, elem) > getMaxDistance() + captureRange.get())
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
