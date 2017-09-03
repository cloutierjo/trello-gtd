const electron = require('electron')

var authenticationSuccess = function() {
    console.log('Successful authentication');
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



