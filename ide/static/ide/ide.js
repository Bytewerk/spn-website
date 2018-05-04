let logWindow = null;
let game = null;
let editor = null;

$(function() {
    logWindow = document.getElementById('log');
    setupEditor();
    setupPreview();
    setupToolbar();
    setupShortcuts();

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

$(window).resize(function() {
    game.vis.Resize();
});

function setupEditor()
{
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/idle_fingers");
    editor.session.setMode("ace/mode/lua");
    editor.setShowPrintMargin(false);
    let textarea = $('#code').hide();
    editor.getSession().setValue(textarea.val());
    $("#snake_edit_form").submit(function(event) {
        textarea.val(editor.getSession().getValue());
    });
}

function setupPreview()
{
    game = new Game(assets, strategy, document.getElementById('preview'));
    game.SetViewerKey(viewer_key);
    game.AddLogHandler(addLogLine);
    game.Run();
    game.vis.FollowDbId(snake_id);
}

function setupToolbar()
{
    $('#bt_run').click(function() {
        save('run', null);
    });

    $('#bt_restart').click(function() {
        $.post('/snake/restart', '', function(data) {
            // todo show data.message
            console.log(data.message)
        });
    });

    $('#bt_stop').click(function() {
        $.post('/snake/disable', '', function(data) {
            // todo show data.message
            console.log(data.message)
        });
    });

    $('#bt_save').click(function() {
       save('save', snake_title);
    });

    $('#bt_save_as').click(function() {
        showModal($('#safe_as_dialog'), function() {
            save('save', $('#save_as_title').val());
        });
        $('#save_as_title').val(snake_title).focus().select();
    });

    $('#bt_load').click(function() {
        $.get("/snake/list", function (data, status) {
            if (status!='success') {
                console.log('loading version list failed: ' + status);
                return;
            }

            if (!data.versions.length) {
                console.log('got empty version list from server');
                return;
            }

            showLoadDialog(data);
        });
    });

}

function setupShortcuts()
{
    $(window).bind('keydown', function(event) {
        if (!(event.ctrlKey || event.metaKey)) {
            return;
        }
        switch (String.fromCharCode(event.which).toLowerCase()) {
            case 's':
                if (event.shiftKey) {
                    $('#bt_save_as').click();
                } else {
                    $('#bt_save').click();
                }
                event.preventDefault();
                break;
            case 'o':
                $('#bt_load').click();
                event.preventDefault();
                break;
            case 'r':
                $('#bt_run').click();
                event.preventDefault();
                break;
        }
    });
}

function showModal(el, ok_func)
{
    let dialog = $(el);
    let blocker = dialog.parents('.modal');
    let bt_ok = dialog.find('.bt_ok');
    let bt_cancel = dialog.find('.bt_cancel');

    blocker.show();
    bt_ok.off().click(function() { ok_func(); hideModal(dialog); });
    bt_cancel.off().click(function() { hideModal(dialog); });

    $(document).off('keydown.modal').on('keydown.modal', function(event) {
        if (event.which === 13) { bt_ok.click(); }
        if (event.which === 27) { bt_cancel.click(); }
    });
}

function hideModal(el)
{
    $(document).off('keydown.modal');
    let blocker = $(el).parents('.modal');
    blocker.find('.bt_ok').off("modal.ok");
    blocker.find('.bt_cancel').off("modal.cancel");
    blocker.hide();
}

function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function save(action, title)
{
    let json_req = {
        'action': action,
        'code': editor.getSession().getValue(),
        'comment': title,
        'parent': snake_id
    };
    $.post('/snake/edit/save', JSON.stringify(json_req), function(data) {
        snake_id = data.snake_id;
        snake_title = data.comment;
        game.vis.FollowDbId(snake_id);
        let logline = 'saved code as version #' + data.version;
        if (data.comment) { logline += "(\"" + data.comment + "\")"; }
        addLogLine(null, logline);
    });
}

function showLoadDialog(data)
{
    let list = $('#load_dialog .list');
    let selected_version = 'latest';

    let bt_ok = $('#load_dialog .bt_ok');
    bt_ok.prop("disabled", true);
    list.empty();

    $.each(data.versions, function(i, version) {
        let item = $('<div><div>'+version.version+'</div><div>'+version.date+'</div><div>'+version.title+'</div></div>');
        item.click(function() {
            list.children('div').removeClass('selected');
            item.addClass('selected');
            selected_version = version.id;
            $('#load_dialog .bt_ok').prop("disabled", false);
        });
        item.dblclick(function() {
            selected_version = version.id;
            bt_ok.click();
        });
        list.append(item);
    });

    showModal($('#load_dialog'), function() {
        window.location.href = '/snake/edit/' + selected_version;
    });
}

function addLogLine(frame, msg)
{
    if (logWindow==null) { return; }

    let auto_scroll = (logWindow.scrollTop > (logWindow.scrollHeight - logWindow.clientHeight - 10));
    while (logWindow.childNodes.length > 100)
    {
        logWindow.removeChild(logWindow.childNodes[0]);
    }

    let div = document.createElement('div');
    let frameDiv = document.createElement('div');
    if (frame) {
        frameDiv.appendChild(document.createTextNode("Frame " + frame + ":"));
    }
    div.appendChild(frameDiv);
    let msgDiv = document.createElement('pre');
    msgDiv.appendChild(document.createTextNode(msg));
    div.appendChild(msgDiv);
    logWindow.appendChild(div);

    if (auto_scroll)
    {
        logWindow.scrollTop = logWindow.scrollHeight - logWindow.clientHeight;
    }
}
