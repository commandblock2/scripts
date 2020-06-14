//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
RotationUtils = Java.type("net.ccbluex.liquidbounce.utils.RotationUtils")
PlayerExtension = Java.type("net.ccbluex.liquidbounce.utils.extensions.PlayerExtensionKt")
Class = Java.type("java.lang.Class")
Keyboard = Java.type("org.lwjgl.input.Keyboard")

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
            stopKey = value.createText("StopKey","P"),
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
            mc.gameSettings.keyBindSprint.pressed = true
            if (mc.theWorld.loadedEntityList.indexOf(target) != -1 && (PlayerExtension.getDistanceToEntityBox(mc.thePlayer, target) < maxDistance + captureRange.get()) && continue_) {

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

    },

    onAttack: function (e) {
        stage = 0
    },

    onKey: function(e){
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
