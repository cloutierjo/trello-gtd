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
function mainView_init(){
    $('#login').hide();
    $('#mainView').show();
    $('#newCardForm').submit(event => {
        cardTitle = $('#cardTitle').val();
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
            $('#new-board').append($('<option>').attr("value",board.id).text(board.name));
            $('#todo-board').append($('<option>').attr("value",board.id).text(board.name));
            
            listData=listData.concat(board.lists);
        });
        
        updateNewList();
        updateTodoList();
    };
    Trello.get('members/me/boards', {
                filter:"open",
                fields:"id,name,starred,prefs,labelNames,dateLastActivity",
                lists:"open"
            }, updateBoardsAndList);
    
    $('#new-board').change(updateNewList);
    $('#todo-board').change(updateTodoList);
    $('#todo-column').change(updateListCards);
}

function debug(data){
    console.log(JSON.stringify(data, null, 2));
}

function updateNewList(){
    updateVisibleList('new');
}
function updateTodoList(){
    updateVisibleList('todo');
}

function updateVisibleList(prefix){
    curBoard = $('#'+prefix+'-board').val();
    $('#'+prefix+'-column').empty();
    listData.forEach(list => {
        if(curBoard==list.idBoard){
            $('#'+prefix+'-column').append($('<option>').attr("value",list.id).text(list.name));
        }
    });
}


function updateListCards(){
    listId = $('#todo-column').val();
    updateTodoCards(listId);
}

function updateTodoCards(listId){
    Trello.get('lists/'+listId+'/cards',{
                fields:"id,name"
            }, datas => {
                $('#todoList').empty();
                datas.forEach(data => {
                    $('#todoList').append($('<li>').data("cardId",data.id).text(data.name));
                });
            });
}
