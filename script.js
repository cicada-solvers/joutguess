var joutguess = {
    ready_for_input: false,
    ready: false,
    ready_check: null,
    jslinux: {cin: null, cout: null},
    ob: {buffer: "", buffering: false},
    prompt_callbacks: [],
    console_active: false,
    switch_overlay: function (type) {
        $("#console-button").prop("disabled", (type==="loading" || type==="processing"));//disable button while loading
        $('#upload-overlay').removeClass('overlay-drag');
        $(".overlay").hide();
        $("#" + type + "-overlay").show();
    },
    toggle_console(){
        this.console_active = !this.console_active;
        window.jslinuxskiphandlers = !this.console_active;
        if(this.console_active){
            $(".overlay").hide();
            $('#console-button').blur();
            $(".term").focus();//release focus on the button
        }else{
            this.switch_overlay('upload');
        }
    },
    run_command: function (cmd, getoutput) {
        var callback = this.wait_for_prompt();
        for (var i = 0; i < cmd.length; i++) {
            this.jslinux.cin(cmd.charCodeAt(i));
        }
        this.jslinux.cin(10);
        if (typeof getoutput !== "undefined")
            this.ob_start();
        return callback;
    },
    wait_for_prompt: function (callback) {
        return new Promise(function (r, f) {
            joutguess.prompt_callbacks.push({resolve: r, reject: f});
        });
    },
    get_outguess_output: function () {
        joutguess.run_command("export_file outguess_output.data");
    },
    drag_event: function (ev) {
        console.log('File(s) in drop zone');

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
    },
    drop_event: function (ev) {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    var file = ev.dataTransfer.items[i].getAsFile();
                    return joutguess.file_event([file]);
                    console.log('... file[' + i + '].name = ' + file.name);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                return joutguess.file_event(ev.dataTransfer.files[i]);
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
            }
        }
    },
    file_event: function (files) {
        joutguess.switch_overlay("processing");
        console.log(files);
        joutguess.run_command("rm user_input.jpg").then(function () {
            on_update_files(files, "user_input.jpg");//jslinux method
            joutguess.run_command("rm outguess_output.data").then(function () {

                setTimeout(function () {
                    joutguess.run_command("/outguess -r user_input.jpg outguess_output.data", true).then(function (output) {
                        console.log("outguess output: " + output);
                        output = output.substring(output.indexOf("....") + 5);
                        $("#result-text").text(output);
                        joutguess.switch_overlay("result");
                    });
                }, 1000);

            });
        });
    },
    prompt_hook: function () {
        if (!joutguess.ready_for_input)
            joutguess.ready_for_input_hook();
        if (this.prompt_callbacks.length < 1)
            return;
        var output = this.ob_end();
        for (var i = 0; i < this.prompt_callbacks.length; i++) {
            this.prompt_callbacks[i].resolve(output);
        }
        this.prompt_callbacks = [];
    },
    ready_for_input_hook: function () {
        console.log("joutguess ready for input!");
        this.ready_for_input = true;
        joutguess.switch_overlay("upload");
    },
    cout_hook: function (out) {
        //console.log(out);
        if (out.indexOf("[root@localhost") !== -1 && out.indexOf("]#") !== -1) {
            joutguess.prompt_hook();
        }
        if (joutguess.ob.buffering) {
            joutguess.ob.buffer += out;
        }
        return joutguess.ready_for_input;
    },
    ob_start: function () {
        this.ob.buffer = "";
        this.ob.buffering = true;
    },
    ob_clean: function () {
        this.ob.buffer = "";
    },
    ob_end: function () {
        this.ob.buffering = false;
        return this.ob.buffer;
    },
    ob_get: function () {
        return this.ob.buffer;
    },
    startup: function () {
        this.jslinux.cin = Module.cwrap('console_queue_char', null, ['number']);
        this.jslinux.cout = Term.prototype.write;
        Term.prototype.write = function (arg) {
            if (joutguess.cout_hook(arg) !== false)
                joutguess.jslinux.cout.call(this, arg);
        }
        console.log("joutguess internals ready!");
        this.ready = true;
        $('#upload-overlay').bind('dragenter', function (e) {
            $(this).addClass('overlay-drag');
        });

        $('#upload-overlay').bind('dragleave', function (e) {
            $(this).removeClass('overlay-drag');
        });
    },
    init: function () {
        this.switch_overlay('loading');
        this.ready_check = setInterval(function () {
            if (typeof Module.cwrap !== "undefined") {
                clearInterval(joutguess.ready_check);
                joutguess.startup();
            }
        }, 250);
    }
};

joutguess.init();
