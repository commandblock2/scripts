//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
Color = Java.type("java.awt.Color")
GL11 = Java.type("org.lwjgl.opengl.GL11")

firstPoses = []
secondPoses = []
first = true
detected = null

lastLocation = null

module = {
    name: "EndPortalLocate",
    description: "Locate end portal with 2 eyes (not that accurate but within the xray distance)",
    author: "commandblock2",
    category: "misc",
    values: [
    ],

    onUpdate: function () {
        pearl = Java.from(mc.theWorld.loadedEntityList).filter(function (elem) {
            return elem instanceof EntityEnderEye
        })

        if (!pearl.length && first && firstPoses.length)
            first = false

        if (pearl.length == 1) {

            if (first)
                firstPoses.push(pearl[0].getPositionVector())
            else
                secondPoses.push(pearl[0].getPositionVector())
        }

        if (!pearl.length && firstPoses.length && secondPoses.length) {

            firstBeginXZ = { x: firstPoses[0].xCoord, z: firstPoses[0].zCoord }
            firstEndXZ = { x: firstPoses[firstPoses.length - 1].xCoord, z: firstPoses[firstPoses.length - 1].zCoord }

            secondBeginXZ = { x: secondPoses[0].xCoord, z: secondPoses[0].zCoord }
            secondEndXZ = { x: secondPoses[secondPoses.length - 1].xCoord, z: secondPoses[secondPoses.length - 1].zCoord }

            //I hate this
            //line is represented as a * x + b * z = c
            firstAB = { a: firstEndXZ.z - firstBeginXZ.z, b: firstBeginXZ.x - firstEndXZ.x }
            firstC = firstAB.a * firstBeginXZ.x + firstAB.b * firstBeginXZ.z

            secondAB = { a: secondEndXZ.z - secondBeginXZ.z, b: secondBeginXZ.x - secondEndXZ.x }
            secondC = secondAB.a * secondBeginXZ.x + secondAB.b * secondBeginXZ.z

            det = firstAB.a * secondAB.b - firstAB.b * secondAB.a

            intersectX = (secondAB.b * firstC - firstAB.b * secondC) / det
            intersectZ = (firstAB.a * secondC - secondAB.a * firstC) / det

            if (!detected)
                detected = timeout(0, function () {
                    chat.print("The portal is around X = " + intersectX + " Z = " + intersectZ)
                    lastLocation = [intersectX, intersectZ]
                    timeout(1000 * 5, function () {
                        resetState()
                        chat.print("State reset")
                        detected = null
                    })
                })
        }
    },

    onRender3D: function (event) {
        drawLine(firstPoses, new Color(86, 156, 214))
        drawLine(secondPoses, new Color(255, 255, 0))

        if (lastLocation)
            drawLine([new Vec3(lastLocation[0], 0, lastLocation[1]), new Vec3(lastLocation[0], 255, lastLocation[1])], new Color(53, 1 , 134))
    },

    onDisable: function () {
        resetState()
        lastLocation = null
    }

}

function resetState() {
    first = true
    firstPoses = []
    secondPoses = []
}

function drawLine(poses, color) {
    GL11.glPushMatrix();

    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA);
    GL11.glLineWidth(4)
    GL11.glEnable(GL11.GL_LINE_SMOOTH);
    GL11.glEnable(GL11.GL_BLEND);
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    mc.entityRenderer.disableLightmap();
    GL11.glBegin(GL11.GL_LINE_STRIP);
    RenderUtils.glColor(color);
    renderPosX = mc.getRenderManager().viewerPosX;
    renderPosY = mc.getRenderManager().viewerPosY;
    renderPosZ = mc.getRenderManager().viewerPosZ;

    poses.forEach(function (pos) {
        GL11.glVertex3d(pos.xCoord - renderPosX, pos.yCoord - renderPosY, pos.zCoord - renderPosZ);
    })


    GL11.glColor4d(1, 1, 1, 1);
    GL11.glEnd();
    GL11.glEnable(GL11.GL_DEPTH_TEST);
    GL11.glDisable(GL11.GL_LINE_SMOOTH);
    GL11.glDisable(GL11.GL_BLEND);
    GL11.glEnable(GL11.GL_TEXTURE_2D);
    GL11.glPopMatrix();
}

script.import("Core.lib")
