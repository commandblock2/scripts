GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
Potion = Java.type('net.minecraft.potion.Potion')


var appleCount = null
var originalIndex = null
var inventoryIndex = null
module =
{
    name: "AutoGapple",
    description: "Eat gapple when your health is low",
    author: "commandblock2",
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

            if (originalIndex == null) { // wtffffff
                originalIndex = mc.thePlayer.inventory.currentItem
            }


            if (gAppleIndex >= 36 && gAppleIndex < 45) {
                //switch to gapple
                mc.thePlayer.inventory.currentItem = gAppleIndex - 36

            } else if (gAppleIndex >= 9 && gAppleIndex < 36 && !(mc.currentScreen instanceof GuiInventory)) {
                //switch gapple and 36 (first slot)
                inventoryIndex = gAppleIndex
                switchGapple(inventoryIndex)
            } else

                try {
                    currentApples = mc.thePlayer.inventoryContainer
                        .getSlot(gAppleIndex).getStack().stackSize

                    if (appleCount == 0) {
                        appleCount = currentApples
                    } else {
                        if (appleCount == currentApples)
                            mc.gameSettings.keyBindUseItem.pressed = true
                        else {
                            reset()
                        }
                    }
                } catch (e) { chat.print(e) }
        }
        else {
            reset()
        }
    }
}
function reset() {
    appleCount = 0
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
