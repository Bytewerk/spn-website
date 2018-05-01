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
});

window.onresize = function()
{
    game.vis.Resize();
};

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
    $('#bt_run').click(ajaxRun);

    $('#bt_restart').click(function() {
        $.post('/snake/restart', '', function(data) {
            // todo show data.message
            console.log(data.message)
        });
    });
}

function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function ajaxRun()
{
    let json_req = {
        'action': 'run',
        'code': editor.getSession().getValue()
    };
    $.post('/snake/edit/save', JSON.stringify(json_req), function(data) {
        game.vis.FollowDbId(data.snake_id);
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
