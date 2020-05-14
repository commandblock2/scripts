//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
Method = Java.type("java.lang.reflect.Method")
Field = Java.type("java.lang.reflect.Field")
Class = Java.type("java.lang.Class")
File = Java.type("java.io.File")
Script = Java.type("net.ccbluex.liquidbounce.script.Script")

var multilineMsg = ""

module =
{
    name: "REPL",
    description: "in game REPL which allows you to execute js code in chat",
    author: "commandblock2",
    category: "Misc",
    values:
        [
            usePrefix = value.createBoolean("UsePrefix", false),
            prefix = value.createText("Prefix", ">")
        ],


    onEnable: function () { chat.print("§6[nashorn REPL]: Welcom to in Game js REPL") },


    onDisable: function () { chat.print("§6[nashorn REPL]: Quiting REPL") },

    onPacket: repl
}

function repl(event) {
    var packet = event.getPacket()

    if (packet instanceof C01PacketChatMessage) {
        var statement = packet.getMessage()

        if (usePrefix.get() && !statement.startsWith(prefix.get()))
            return
        else if (usePrefix.get())
            statement = statement.replace(prefix.get(), "")

        chat.print("§6>§7" + statement)

        if (statement.endsWith("\\")) {
            multilineMsg += (statement.substring(0, statement.length - 1).replace("\r", "").replace("\n", "") + " ")
            event.cancelEvent()
            return
        }
        else
            try {
                if (multilineMsg.length == 0)
                    multilineMsg = statement
                else
                    multilineMsg += statement

                evaluated = eval(multilineMsg)
                chat.print("§6[nashorn REPL]: §7" + evaluated)
            } catch (error) {
                chat.print("§6[nashorn REPL]: §c" + error)
            } finally {
                multilineMsg = ""
            }

        event.cancelEvent()
    }
}

var forEach = Array.prototype.forEach;

function memFn(className) {
    targetClass = Class.forName(className)
    functionList = targetClass.getDeclaredMethods()

    forEach.call(functionList, function (element) {
        chat.print("§6[nashorn REPL]: §7" + element)
    });
}

function memFnI(instanceName) {
    targetClass = eval(instanceName).getClass()
    functionList = targetClass.getDeclaredMethods()

    forEach.call(functionList, function (element) {
        chat.print("§6[nashorn REPL]: §7" + element)
    });
}

function memFld(className) {
    targetClass = Class.forName(className)
    fieldList = targetClass.getDeclaredFields()

    forEach.call(fieldList, function (element) {
        chat.print("§6[nashorn REPL]: §7" + element)
    });
}

function memFldI(instanceName) {
    targetClass = eval(instanceName).getClass()
    fieldList = targetClass.getDeclaredFields()

    forEach.call(fieldList, function (element) {
        chat.print("§6[nashorn REPL]: §7" + element)
    });
}

function crashClientIfScriptIsAbleToLoadOtherwiseReportError(scriptName) {
    try {
        LiquidBounce.scriptManager.scripts.add(
            new Script(
                new File(
                    new File(LiquidBounce.fileManager.dir, "scripts"), scriptName)))
    }
    catch (error) {
        chat.print("§cError in " + scriptName + ": " + error)
    }
}

var semanticSegment = /[^\w\.]{0,1}(\w*?\.)((\w*?\.)*)(\w*)$/

script.import("Core.lib");
