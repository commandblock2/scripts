//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
//Part of these are skided from LB, but the license should be compatible
var on = false
var startTimeOut = null

var rotationYaw = 0
var rotationPitch = 0

module = [
    {
        name: "SelfSave",
        description: "idk",
        author: "commandblock2",
        category: "world",

        values: [
            delay = value.createInteger("Delay", 120, 0, 1000),
            sneakDelay = value.createInteger("SneakDelay", 200, 0, 2000),
            searchRange = value.createInteger("SearchRange", 5, 0, 20),
            anyCondition = value.createBoolean("AnyCondition", false),
            onHit = value.createBoolean("OnHit", true)
        ],


        onRender3D: function () {
            if (anyCondition.get() && !(mc.thePlayer.onGround || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater())) {
                selfSaveActivate()
            } else if ((mc.thePlayer.onGround || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater())) {
                selfSaveDeactivate()
            }


            if (on) {
                mc.gameSettings.keyBindUseItem.pressed = true
                mc.gameSettings.keyBindForward.pressed = true
                aim()
            }

        },

        onPacket: function (event) {
            packet = event.getPacket()
            if (onHit.get() &&
                packet instanceof S12PacketEntityVelocity &&
                mc.theWorld.getEntityByID(packet.getEntityID()) == mc.thePlayer) {
                timeout(delay.get(), selfSaveActivate)
            }
        },

        onDisable: function () {
            selfSaveDeactivate()
        }
    },
    {
        name: "Tellybridge",
        description: "telly bridging (not implemented)",
        author: "commandblock2",
        category: "world",

        values: [
            triggerMotion = value.createFloat("TriggerMotionY", 0, -0.42, 0.42)
        ],

        onRender3D: function () {
            if (mc.thePlayer.onGround) {
                if(on){
                    mc.thePlayer.rotationPitch = rotationPitch
                    mc.thePlayer.rotationYaw = rotationYaw
                }

                deactivate()

                mc.gameSettings.keyBindForward.pressed = true
                mc.gameSettings.keyBindBack.pressed = false
                mc.gameSettings.keyBindSprint.pressed = true

            } else {
                if(mc.thePlayer.motionY < triggerMotion.get()){
                    if(!on){
                        rotationPitch = mc.thePlayer.rotationPitch
                        rotationYaw = mc.thePlayer.rotationYaw
                    }
                    
                    aim()

                    activate()  
                    mc.gameSettings.keyBindUseItem.pressed = true
                }
                
                mc.gameSettings.keyBindForward.pressed = false
                mc.gameSettings.keyBindBack.pressed = true
                mc.gameSettings.keyBindSprint.pressed = false
            }
        }
    }
]



function selfSaveActivate() {
    if (!startTimeOut)
        startTimeOut = timeout(delay.get(), function () {
            activate()
            mc.gameSettings.keyBindUseItem.pressed = true
            mc.gameSettings.keyBindForward.pressed = true

            index = InventoryUtils.findAutoBlockBlock() - 36

            if (index < 0 || index > 9)
                return

            mc.thePlayer.inventory.currentItem = index //I'll deal with that later(refactor with AutoGapple)
        })
}

function activate()
{
    on = true
}

function selfSaveDeactivate() {
    on = false
    if (startTimeOut) {
        startTimeOut.cancel()
        startTimeOut = null
 
        deactivate()

        mc.gameSettings.keyBindSneak.pressed = true

        timeout(sneakDelay.get(), function () {
            mc.gameSettings.keyBindSneak.pressed = false
            mc.gameSettings.keyBindForward.pressed = false
        })
    }

    
}

function deactivate()
{
    on = false
    autoClicker.state = false
    mc.gameSettings.keyBindUseItem.pressed = false
}

function avg(a, b) { return (a + b) / 2 }

function toDgree(rad) { return rad * 180 / Math.PI }

function aim() {
    autoClicker.state = true
    block = getNearstFullBlock(mc.thePlayer.getPositionVector().add(new Vec3(0, -1, 0)), 10)

    surfaceCentrals = getCentralPosOf6Surfaces(block)

    targetPos = mc.thePlayer.getPositionVector().add(new Vec3(0, -1, 0))
    x = targetPos.xCoord; y = targetPos.yCoord; z = targetPos.zCoord;

    targetSurfaceCentral = surfaceCentrals[0]
    max = Number.MAX_VALUE

    surfaceCentrals.forEach(function (elem) {
        distsq_ = Math.pow(elem.xCoord - x, 2) +
            Math.pow(elem.yCoord - y, 2) +
            Math.pow(elem.zCoord - z, 2)

        if (distsq_ < max) {
            max = distsq_
            targetSurfaceCentral = elem
        }
    });

    faceCoord(targetSurfaceCentral).toPlayer(mc.thePlayer)
}


function getNearstFullBlock(vec3, radius) {
    x = vec3.xCoord; y = vec3.yCoord; z = vec3.zCoord;

    blocks_ = BlockUtils.searchBlocks(radius + 1)

    keys = Java.from(blocks_.keySet())
    values = Java.from(blocks_.values())

    distsq = Number.MAX_VALUE
    nearst = keys[0]

    for (i = 0; i < keys.length; i++) {
        if (values[i].isFullCube()
            && (!InventoryUtils.BLOCK_BLACKLIST.contains(values[i]))
            && values[i] != Blocks.air) {
            elem = keys[i]
            distsq_ = Math.pow(elem.getX() - vec3.xCoord, 2) +
                Math.pow(elem.getY() - vec3.yCoord, 2) +
                Math.pow(elem.getZ() - vec3.zCoord, 2)

            if (distsq_ < distsq) {
                distsq = distsq_
                nearst = keys[i]
            }

        }
    }

    return distsq == Number.MAX_VALUE ? null : nearst
}

function getCentralPosOf6Surfaces(blockPos) {
    x = blockPos.getX(); y = blockPos.getY(); z = blockPos.getZ();
    return [
        new Vec3(x + 0.5, y + 1, z + 0.5),
        new Vec3(x + 0.5, y, z + 0.5),
        new Vec3(x, y + 0.5, z + 0.5),
        new Vec3(x + 1, y + 0.5, z + 0.5),
        new Vec3(x + 0.5, y + 0.5, z + 1),
        new Vec3(x + 0.5, y + 0.5, z)
    ]
}

function faceCoord(vec3) {
    eyePos = new Vec3(
        mc.thePlayer.posX,
        mc.thePlayer.getEntityBoundingBox().minY + mc.thePlayer.getEyeHeight(),
        mc.thePlayer.posZ
    )

    diffX = vec3.xCoord - eyePos.xCoord
    diffY = vec3.yCoord - eyePos.yCoord
    diffZ = vec3.zCoord - eyePos.zCoord

    diffXZ = MathHelper.sqrt_double(diffX * diffX + diffZ * diffZ)

    return new Rotation(
        MathHelper.wrapAngleTo180_float(toDgree(Math.atan2(diffZ, diffX)) - 90.0),
        MathHelper.wrapAngleTo180_float(-toDgree(Math.atan2(diffY, diffXZ)))
    )
}

script.import("Core.lib")

autoClicker = LiquidBounce.moduleManager.getModule("autoClicker")
