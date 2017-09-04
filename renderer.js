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

    function updateBoardsNList(data){
        data.forEach(board => {
            $('#new-board').append($('<option>').attr("value",board.id).text(board.name));
            
            listData=listData.concat(board.lists);
        });
        
        updateVisibleList()
    };
    Trello.get('members/me/boards',{filter:"open",fields:"id,name,starred,prefs,labelNames,dateLastActivity",lists:"open"},updateBoardsNList);
}

function updateVisibleList(){
    curBoard = $('#new-board').val();
        console.log(curBoard);
    listData.forEach(list => {
        console.log(JSON.stringify(list));
        if(curBoard==list.idBoard){
            $('#new-column').append($('<option>').attr("value",list.id).text(list.name));
        }
    });
    
}
