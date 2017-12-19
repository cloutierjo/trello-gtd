const electron = require('electron')

var authenticationSuccess = function() {
    console.log('Successful authentication');
    mainView_init();
};

var authenticationFailure = function() {
    console.log('Failed authentication');
    electron.ipcRenderer.send('login-required', '');
};

var authenticationSecondFailure = function() {
    console.log('Failed authentication');
};

electron.ipcRenderer.on('login-completed', (event, arg) => {
    Trello.authorize({
        name: 'trello-gtd',
        interactive: false,
        scope: {
            read: 'true',
            write: 'true' },
        expiration: 'never',
        success: authenticationSuccess,
        error: authenticationSecondFailure
    });
});

electron.ipcRenderer.on('focus-add', (event, arg) => {
    $('#cardTitle').focus();
})

Trello.authorize({
    name: 'trello-gtd',
    interactive: false,
    scope: {
        read: 'true',
        write: 'true' },
    expiration: 'never',
    success: authenticationSuccess,
    error: authenticationFailure
});


var listData = [];
var boardData = {};
function mainView_init(){
    $('#login').hide();
    $('#mainView').show();
    $('#newCardForm').submit(event => {
        cardTitle = $('#cardTitle').val();
        if(cardTitle && cardTitle.length > 0)
        listId = $('#new-column').val();
        Trello.post('/cards/', {
            name: cardTitle, 
            idList: listId,
            pos: 'bottom'
        });
        event.preventDefault();
        $('#cardTitle').val("");
    });

    function updateBoardsAndList(data){
        data.forEach(board => {
            $('#new-board').append($('<option>').attr("value",board.id).data("bg-color",board.prefs.backgroundColor).text(board.name));
            $('#todo-board').append($('<option>').attr("value",board.id).data("bg-color",board.prefs.backgroundColor).text(board.name));
                        
            listData=listData.concat(board.lists);
            boardData[board.id]=board;
        });
        debug(data);
        newBoardValue = localStorage.getItem('new-board');
        if(newBoardValue){
            $('#new-board').val(newBoardValue);
        }
        todoBoardValue = localStorage.getItem('todo-board');
        if(todoBoardValue){
            $('#todo-board').val(todoBoardValue);
        }
        
        updateNewList();
        updateTodoList();
    };
    Trello.get('members/me/boards', {
                filter:"open",
                fields:"id,name,starred,prefs,labelNames,dateLastActivity",
                lists:"open"
            }, updateBoardsAndList);
    
    $('#new-board').change(updateNewList);
    $('#new-column').change(updateNewColList);
    $('#todo-board').change(updateTodoList);
    $('#todo-column').change(updateListCards);
}

function debug(data){
    console.log(JSON.stringify(data, null, 2));
}

function updateNewList(){
    curBoard = $('#new-board').val();
    if(boardData[curBoard].prefs.backgroundColor){
        $("#newCardSubmit").css("background-color", boardData[curBoard].prefs.backgroundColor);
    }else{
        $("#newCardSubmit").css("background-color", "");
    }
    updateVisibleList('new');
}
function updateTodoList(){
    curBoard = $('#todo-board').val();
    if(boardData[curBoard].prefs.backgroundColor){
        $("body").css("background-color", boardData[curBoard].prefs.backgroundColor);
        $("body").css("background-image", "");
    }
    if(boardData[curBoard].prefs.backgroundImage){
        $("body").css("background-image", "url("+boardData[curBoard].prefs.backgroundImage+")");
    }
    updateVisibleList('todo');
}

function updateVisibleList(prefix){
    console.log('updateVisibleList');
    curBoard = $('#'+prefix+'-board').val();
    localStorage.setItem(prefix+'-board',curBoard);
    $('#'+prefix+'-column').empty();
    listData.forEach(list => {
        if(curBoard==list.idBoard){
            $('#'+prefix+'-column').append($('<option>').attr("value",list.id).text(list.name));
        }
    });
    
    colValue = localStorage.getItem(prefix+'-column');
    if(colValue && $("#"+prefix+"-column option[value='"+colValue+"']").length > 0){
        $('#'+prefix+'-column').val(colValue).trigger('change');
    }
    $('#'+prefix+'-column').trigger('change');
}


function updateNewColList(){
    console.log('updateNewColList');
    listId = $('#new-column').val();
    localStorage.setItem('new-column',listId);
    
}
function updateListCards(){
    console.log('updateListCards');
    listId = $('#todo-column').val();
    localStorage.setItem('todo-column',listId);
    updateTodoCards(listId);
}

function updateTodoCards(listId){
    Trello.get('lists/'+listId+'/cards',{
                fields:"id,name"
            }, datas => {
                $('#todoList').empty();
                datas.forEach(data => {
                    $('#todoList').append($('<li class="list-group-item">').data("cardId",data.id).text(data.name));
                });
            });
}
