///api_version=2
//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
(script = registerScript({
    name: "VanillaAura",
    version: "1.0",
    authors: ["commandblock2"]
})).import("Core.lib")


Class = Java.type("java.lang.Class")
var isEnemy
var canBlock
module =
{
    name: "VanillaAura",
    description: "Aura for vanilla servers",
    author: "commandblock2",
    category: "combat",

    onUpdate: function () {
        target = Java.from(mc.theWorld.loadedEntityList)
            .filter(function (e) { return isEnemy.invoke(killAura, e) })
            .sort(function (lhs, rhs) { return mc.thePlayer.getDistanceToEntity(lhs) - mc.thePlayer.getDistanceToEntity(rhs) })[0]

        if(!target) return


        if(mc.thePlayer.getHeldItem().getItem() instanceof ItemSword) mc.getNetHandler().addToSendQueue(new C07PacketPlayerDigging(C07PacketPlayerDigging.Action.RELEASE_USE_ITEM, BlockPos.ORIGIN, EnumFacing.DOWN))
        mc.getNetHandler().addToSendQueue(new C02PacketUseEntity(target, C02PacketUseEntity.Action.ATTACK))
        if(mc.thePlayer.getHeldItem().getItem() instanceof ItemSword) mc.getNetHandler().addToSendQueue(new C08PacketPlayerBlockPlacement(mc.thePlayer.inventory.getCurrentItem()))
    },

    onEnable: function () {
        isEnemy = killAura.class.getDeclaredMethod("isEnemy", Class.forName("net.minecraft.entity.Entity"))
        isEnemy.setAccessible(true)
    }
}

killAura = LiquidBounce.moduleManager.getModule("killaura")
