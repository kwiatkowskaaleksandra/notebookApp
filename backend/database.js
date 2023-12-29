const mysql = require('mysql');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'notebook'
  });
  connection.connect(err => {
    if (err) {
      console.error('Błąd połączenia z bazą danych: ' + err.stack);
      return;
    }
    console.log('Połączono z bazą danych');
  });

  module.exports = connection;
