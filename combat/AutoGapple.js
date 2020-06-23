
//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
Potion = Java.type('net.minecraft.potion.Potion')

var originalIndex = null
var inventoryIndex = null
module =
{
    name: "AutoGapple",
    description: "Eat gapple when your health is low",
    author: "LolMC, commandblock2",
    category: "combat",
    values:
        [
            health = value.createFloat("Health", 10, 1, 20),
            itemSwitchDelay = value.createInteger("SwitchDelayms", 100, 0, 1000)
        ],

    onUpdate: function () {
        if (mc.thePlayer.getHealth() <= health.get() && !mc.thePlayer.isPotionActive(Potion.regeneration)) {
            gAppleIndex = InventoryUtils.findItem(36, 45, Items.golden_apple)
            gAppleIndex = gAppleIndex == -1 ? InventoryUtils.findItem(9, 36, Items.golden_apple) : gAppleIndex

            if (originalIndex == null) { // wtffffff have to check null because if (originalIndex) doesn't work when it equas to 0
                originalIndex = mc.thePlayer.inventory.currentItem
            }


            if (gAppleIndex >= 36 && gAppleIndex < 45) {
                //switch to gapple
                mc.thePlayer.inventory.currentItem = gAppleIndex - 36

            } else if (gAppleIndex >= 9 && gAppleIndex < 36 && !(mc.currentScreen instanceof GuiInventory)) {
                //switch gapple and 36 (first slot)
                inventoryIndex = gAppleIndex
                switchGapple(inventoryIndex)
            }

            mc.gameSettings.keyBindUseItem.pressed = true
            
        }
        else {
            reset()
        }
    }
}
function reset() {
    mc.gameSettings.keyBindUseItem.pressed = false
    if (originalIndex != null) {
        mc.thePlayer.inventory.currentItem = originalIndex;
        originalIndex = null
    }

    if (inventoryIndex != null) {
        switchGapple(inventoryIndex)
        inventoryIndex = null
    }
}

function switchGapple(index) {
    //open inventory (I don't care about when you are on horse, implement it yourself)
    mc.getNetHandler().addToSendQueue(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
    mc.displayGuiScreen(new GuiInventory(mc.thePlayer));

    timeout(itemSwitchDelay.get(), function () {
        slot = mc.thePlayer.inventoryContainer.getSlot(index)

        mc.playerController.windowClick(mc.currentScreen.inventorySlots.windowId, slot.slotNumber, 0, 2, mc.thePlayer)
        mc.thePlayer.closeScreen()
    })
}

script.import("Core.lib")
