let logWindow = null;
let game = null;
let editor = null;

$(function() {
    logWindow = document.getElementById('log');
    setupEditor();
    setupPreview();
    setupToolbar();

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    $('div.modal .bt_cancel').click(hideModal);
    $('div.modal .bt_ok').click(hideModal);
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
    game.protocol.AddEventHandler('Log', addLogLine);
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

    $('#bt_save_as').click(function() {
        showModal($('#safe_as_dialog'), function() {
            save('save', $('#save_as_title').val());
        });
        $('#save_as_title').val(snake_title).focus().select();
    });
}

function showModal(el, ok_func)
{
    let dialog = $(el);
    let blocker = dialog.parents('.modal');
    blocker.show();

    function close_ok()
    {
        ok_func();
        hideModal(dialog);
    }

    dialog.find('.bt_ok').off("modal.ok").on("click", "modal.ok", close_ok);
    $(document).off('keydown.modal').on('keydown.modal', function(event) {
        if (event.which === 27) { hideModal(el); }
        if (event.which === 13) { close_ok(); }
    });
}

function hideModal(el)
{
    $(document).off('keydown.modal');
    let blocker = $(el).parents('.modal');
    blocker.find('.bt_ok').off("modal.ok");
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
    frameDiv.appendChild(document.createTextNode("Frame " + frame + ":"));
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
