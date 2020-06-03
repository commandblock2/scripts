//Copyright 2020 commandblock2 distributed under AGPL-3.0-or-later
Method = Java.type("java.lang.reflect.Method")
Field = Java.type("java.lang.reflect.Field")
Class = Java.type("java.lang.Class")
ClassLoader = Java.type("java.lang.ClassLoader")
Thread = Java.type("java.lang.Thread")
Package = Java.type("java.lang.Package")
ClassPath = Java.type("com.google.common.reflect.ClassPath")
File = Java.type("java.io.File")
Script = Java.type("net.ccbluex.liquidbounce.script.Script")
Remapper = Java.type("net.ccbluex.liquidbounce.script.remapper.Remapper")
GuiChat = Java.type("net.minecraft.client.gui.GuiChat")

var multilineMsg = ""
var history = []
var identifiers = []
var fields_obf = []
var fields_deob = []
var methods_obf = []
var methods_deob = []


onEnables = []
onDisables = []
onUpdates = []
onMotions = []
onRender2Ds = []
onRender3Ds = []
onAttacks = []
onJumps = []
onPackets = []
onKeys = []
onMoves = []
onSteps = []
onStepConfirms = []
onWorlds = []
onSessions = []

module =
{
    name: "REPL",
    description: "in game REPL which allows you to execute js code in chat",
    author: "commandblock2",
    category: "Misc",
    values:
        [
            usePrefix = value.createBoolean("UsePrefix", true),
            prefix = value.createText("Prefix", ">"),

            recordHistory = value.createBoolean("History", true),
            keywordsInCompletion = value.createBoolean("keywordsInCompletion", true)
        ],


    onEnable: function () {
        chat.print("§6[nashorn REPL]: Welcom to in-game js REPL")

        fieldsField = Remapper.INSTANCE.class.getDeclaredField("fields")
        fieldsField.setAccessible(true)
        fields_ = fieldsField.get(Remapper.INSTANCE)

        Java.from(fields_.values()).forEach(function (elem) {

            size = elem.keySet().size()

            keySet = Java.from(elem.keySet())
            values = Java.from(elem.values())

            for (index = 0; index < size; index++) {
                fields_obf.push(keySet[index])
                fields_deob.push(values[index])
            }
        })

        methodsField = Remapper.INSTANCE.class.getDeclaredField("methods")
        methodsField.setAccessible(true)
        methods_ = methodsField.get(Remapper.INSTANCE)


        Java.from(methods_.values()).forEach(function (elem) {

            size = elem.keySet().size()

            keySet = Java.from(elem.keySet())
            values = Java.from(elem.values())

            for (index = 0; index < size; index++) {
                methods_obf.push(keySet[index].match(/(.*?)(?:[\b\()])/)[1])
                methods_deob.push(values[index])
            }

        })

        onEnables.forEach(function (e) { e() })
    },


    onDisable: function () {
        chat.print("§6[nashorn REPL]: Quiting REPL")
        onDisables.forEach(function (e) { e() })
    },

    onPacket: function (event) {
        var packet = event.getPacket()
        if (packet instanceof C01PacketChatMessage)
            repl(event, packet)
        else if (packet instanceof C14PacketTabComplete)
            makeCompletion(event, packet)

        onPackets.forEach(function (e) { e(event) })
    },

    onUpdate: function () { onUpdates.forEach(function (e) { e() }) },
    onMotion: function (a) { onMotions.forEach(function (e) { e(a) }) },
    onRender2D: function (a) {
        onRender2Ds.forEach(function (e) { e(a) })

        guiChat = mc.currentScreen
        if (guiChat instanceof GuiChat) {

            fieldInputField = guiChat.class.getDeclaredField("field_146415_a") // Hack Hack Hack
            fieldInputField.setAccessible(true)
            inputField = fieldInputField.get(guiChat)

            inputField.setMaxStringLength(200)
        }
    },
    onRender3D: function (a) { onRender3Ds.forEach(function (e) { e(a) }) },
    onAttack: function (a) { onAttacks.forEach(function (e) { e(a) }) },
    onJump: function (a) { onJumps.forEach(function (e) { e(a) }) },
    onKey: function (a) { onKeys.forEach(function (e) { e(a) }) },
    onStep: function (a) { onSteps.forEach(function (e) { e(a) }) },
    onStepConfirm: function (a) { onStepConfirms.forEach(function (e) { e(a) }) },
    onWorld: function (a) { onWorlds.forEach(function (e) { e(a) }) },
    onSession: function () { onSessions.forEach(function (e) { e() }) }
}

var semanticSegment = /(\b(\w*?\.)*)(\w*)(?!.+(?:\w*?\.))/

function makeCompletion(event, packet) {

    fieldMessage = packet.class.getDeclaredField("field_149420_a") // Hack Hack Hack
    fieldMessage.setAccessible(true)
    messagestr = fieldMessage.get(packet)

    if (!usePrefix.get() || messagestr.startsWith(prefix.get())) {
        event.cancelEvent()

        guiChat = mc.currentScreen

        fieldWaitOnAutoCompletion = guiChat.class.getDeclaredField("field_146414_r") // Hack Hack Hack
        fieldWaitOnAutoCompletion.setAccessible(true)
        fieldWaitOnAutoCompletion.set(guiChat, true)

        fieldInputField = guiChat.class.getDeclaredField("field_146415_a") // Hack Hack Hack
        fieldInputField.setAccessible(true)
        inputField = fieldInputField.get(guiChat)


        match_ = messagestr.match(semanticSegment)

        if (match_) {
            var pre = match_[1]
            var post = match_[3]

            startIndex = messagestr.lastIndexOf(match_[0])
            var none_eval_pre = messagestr.substring(0, startIndex)

            endIndex = startIndex + match_[0].length
            var none_eval_post = messagestr.substring(endIndex, messagestr.length)

        }

        evaled_pre = pre.substring(0, pre.length - 1)
        completion = []
        prefixMatchedOnlyCompletion = []

        //if evaled_pre is package

        try {
            //add sub class
            if (evaled_pre != "") {

                classpath = ClassPath.from(Thread.currentThread().getContextClassLoader())
                Java.from(classpath.getTopLevelClasses(evaled_pre)).forEach(
                    function (elem) {
                        completion.push(elem)
                    }
                )

                //add sub packages
                Java.from(Package.getPackages()).forEach(
                    function (elem) {
                        try {
                            package_ = elem.toString().match(/package (.*),{0,1}/)[1]
                            if (package_.startsWith(evaled_pre)) {
                                partial = package_.match(new RegExp(evaled_pre + "\\.(.*?)\\."))[1]

                                partial = evaled_pre + "." + partial

                                if (completion.indexOf(partial) == -1)
                                    completion.push(partial)
                            }
                        }
                        catch (err) { }
                    }
                )
            }
        }
        catch (e) { }

        //if evaled_pre is Class or instance
        //if is Class with path
        try {
            if (Class.forName(evaled_pre).getCanonicalName() == evaled_pre) {
                //auto import that package
                imported = evaled_pre.match(semanticSegment)[3].toString()
                statement = imported + " = Java.type(\"" + evaled_pre + "\")"
                chat.print("§6[nashorn REPL]: automatically imported: §7" + statement)
                history.push(statement)
                eval(statement)

                textField = inputField.class.getDeclaredField("field_146216_j")
                textField.setAccessible(true)
                textField.set(inputField, imported)

                evaled_pre = imported
            }
        } catch (e) { }

        inspect(evaled_pre).forEach(function (elem) { completion.push(elem) })

        //add js keywords
        !keywordsInCompletion.get() || ["abstract", "arguments", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"].forEach(
            function (e) { prefixMatchedOnlyCompletion.push(e) }
        )

        //add all identifiers
        identifiers.forEach(function (e) { prefixMatchedOnlyCompletion.push(e) })

        prefixMatchedOnlyCompletion = prefixMatchedOnlyCompletion.filter(function (elem) { return elem.startsWith(messagestr) })
        completion = prefixMatchedOnlyCompletion.concat(completion)
        completion.sort(function (lhs,rhs) 
        {
            lIndex = lhs.lastIndexOf(post)
            rIndex = rhs.lastIndexOf(post) 

            lIndex = (lIndex == -1 ? 80 : lIndex)
            rIndex = (rIndex == -1 ? 80 : rIndex)

            return lIndex - rIndex
        })

        final = []
        completion.forEach(function (elem) { final.push(none_eval_pre + elem + none_eval_post) })
        guiChat.onAutocompleteResponse(final)
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


function inspect(identifierName) {
    members = []

    var class_ = null

    try {
        class_ = Class.forName(identifierName) // if it is just a full path class(wont' work) like net.ccbluex.liquidbounce.LiquidBounce
    } catch (e) { }

    try {
        if (!class_) {
            class_ = eval(identifierName).getClass()
        }
    } catch (e) { }

    try {
        if (!class_) {
            class_ = eval(identifierName).class
        }
    }
    catch (e) { }

    classes = []

    do {
        classes.push(class_)
        class_ = class_.getSuperclass()
    }
    while (class_.getName() != "java.lang.Object")

    classes.forEach(function (e) {
        try {
            Java.from(e.getDeclaredFields()).forEach(function (elem) {
                if (elem.toString().indexOf("field_") == -1)
                    members.push(identifierName + "." + elem.getName())
                else
                    members.push(identifierName + "." + fields_deob[fields_obf.indexOf(elem.getName())])

            })
        } catch (e) { }

        try {
            Java.from(e.getDeclaredMethods()).forEach(function (elem) {
                if (elem.toString().indexOf("func_") == -1)
                    members.push(identifierName + "." + elem.getName() + "()")
                else {
                    members.push(identifierName + "." + methods_deob[methods_obf.indexOf(elem.getName())] + "()")
                }
            })
        } catch (e) { }
    })
    return members
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
