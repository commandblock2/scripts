//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
Method = Java.type("java.lang.reflect.Method")
Field = Java.type("java.lang.reflect.Field")
Class = Java.type("java.lang.Class")
ClassLoader = Java.type("java.lang.ClassLoader")
ClassPath = Java.type("com.google.common.reflect.ClassPath")
File = Java.type("java.io.File")
Script = Java.type("net.ccbluex.liquidbounce.script.Script")

var multilineMsg = ""
var history=[]

module =
{
    name: "REPL",
    description: "in game REPL which allows you to execute js code in chat",
    author: "commandblock2",
    category: "Misc",
    values:
        [
            usePrefix = value.createBoolean("UsePrefix", false),
            prefix = value.createText("Prefix", ">"),

            recordHistory = value.createBoolean("History", true)
        ],


    onEnable: function () { chat.print("§6[nashorn REPL]: Welcom to in Game js REPL") },


    onDisable: function () { chat.print("§6[nashorn REPL]: Quiting REPL") },

    onPacket: function (event)
    {
        var packet = event.getPacket()
        if (packet instanceof C01PacketChatMessage)
            repl(event, packet)
        else if (packet instanceof C14PacketTabComplete)
            makeCompletion(event, packet)
    }
}

var semanticSegment = /[^\w\.]{0,1}((\w*?\.)*)(\w*)/

function makeCompletion(event, packet) {

    fieldMessage = packet.class.getDeclaredField("field_149420_a") // Hack Hack Hack
    fieldMessage.setAccessible(true)
    messagestr = fieldMessage.get(packet)

    if (!usePrefix.get() || messagestr.message.startsWith(prefix.get())){
        event.cancelEvent()
        
        guiChat = mc.currentScreen

        fieldWaitOnAutoCompletion = guiChat.class.getDeclaredField("field_146414_r") // Hack Hack Hack
        fieldWaitOnAutoCompletion.setAccessible(true)
        fieldWaitOnAutoCompletion.set(guiChat, true)

        if (messagestr.match(semanticSegment))
        {
            var pre = messagestr.match(semanticSegment)[1]
            var post = messagestr.match(semanticSegment)[3]

            if (pre == "")
            try {
                pre = eval(post).toString().match(semanticSegment)[1]
            } catch (error) {}
                
        }

        evaled_pre = pre.substring(0, pre.length - 1)
        completion = []

        //if evaled_pre is package
        
        //if evaled_pre is Class

        //if evaled_pre is instance

        chat.print(pre + " " + post)

        guiChat.onAutocompleteResponse(["fuck","fucka","fucku"])
    }
}

function repl(event, packet) {

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
                
                if (recordHistory.get())
                    history.push(statement)

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

function inspect(identifiierName){
    
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

script.import("Core.lib");
