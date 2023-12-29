const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const connection = require('./database');
const jwt = require('jsonwebtoken');

const app = express();

app.listen(3000, () => {
  console.log('Serwer HTTPS działa na porcie 3000');
})

app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).send("Token jest wymagany do autentykacji.");
  }

  try {
    const decoded = jwt.verify(token, 'userToken');
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Nieprawidłowy Token.");
  }

  return next();
};

async function checkIfUsernameExists(username) {
  const query = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
  return new Promise((resolve, reject) => {
    connection.query(query, [username], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const count = results[0].count;
        resolve(count > 0);
      }
    }
    );
  });
}

async function checkIfEmailExists(email) {
  const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
  return new Promise((resolve, reject) => {
    connection.query(query, [email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const count = results[0].count;
        resolve(count > 0);
      }
    }
    );
  });
}

app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      return res.status(400).send('Nazwa użytkownika jest już w użyciu.');
    }
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      return res.status(400).send('Email jest już w użyciu.');
    }

    connection.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, password],
      (error) => {
        if (error) {
          console.error('Błąd podczas dodawania użytkownika:', error);
          return res.status(500).send('Błąd serwera');
        }
        res.status(200).send('Rejestracja pomyślna');
      }
    );
  } catch (err) {
    console.error('Błąd rejestracji:', err);
    res.status(500).send('Błąd serwera');
  }
});

app.post('/getUserByUsername', async (req, res) => {
  const { username } = req.body;

  if (username === '') {
    return res.status(400).json({ message: "Wymagane są nazwa użytkownika i hasło" });
  }
  connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Błąd serwera" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Nieprawidłowa nazwa użytkownika lub hasło." });
    }
    const user = results[0];

    if (user.loginAttempts >= 3 && moment().diff(user.lastAttemptTime, 'minutes') < 60) {
      return res.status(403).json({ message: "Konto zablokowane. Spróbuj ponownie za godzinę." });
    }

    res.send({user})
  });
});

app.put('/login', async (req, res) => {
 const username = req.body.user.username;
 const userId = req.body.user.id;
 
  const query = 'UPDATE users SET loginAttempts = ?, lastAttemptTime = NOW() WHERE username = ?';
  connection.query(query, [0, username], (error, results) => {
    if (error) {
      return res.status(500).send('Błąd serwera');
    } else {
      const token = jwt.sign({ userId: userId }, 'userToken', { expiresIn: '1h' });
      res.send({ token });
    }
  });
});

app.put('/updateUserLoginAttempts', async (req, res) => {
  const username = req.body.user.username;
  const loginAttempts = req.body.user.loginAttempts;
  const query = 'UPDATE users SET loginAttempts = ?, lastAttemptTime = NOW() WHERE username = ?';
  connection.query(query, [loginAttempts + 1, username], (error, results) => {
    if (error) {
      return res.status(500).send('Błąd serwera');
    } else {
      return res.status(200).json(results);
    }
  });
});

app.get('/getAllNotes', verifyToken, (req, res) => {
  const idUser = req.user.userId;

  const query = 'SELECT * FROM notes WHERE idUser = ?';
  connection.query(query, [idUser], (error, results) => {
    if (error) {
      return res.status(500).send('Błąd serwera');
    } else {
      return res.status(200).json(results);
    }
  });
})

app.post('/addNote', verifyToken, async (req, res) => {
  const idUser = req.user.userId;
  const { title, content, isEncrypted, password } = req.body;
  const creationDate = moment().format('YYYY-MM-DD');

  connection.query('INSERT INTO notes (title, content, creationDate, isEncrypted, password, idUser ) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, creationDate, isEncrypted, password, idUser],
    (error) => {
      if (error) return res.status(500).send(error);
      return res.status(200).send("Notatka została dodana prawidłowo.");
    }
  )
})

app.get('/getNoteById', verifyToken, (req, res) => {
  const idUser = req.user.userId;
  const idNote = req.query.id;
  const query = 'SELECT * FROM notes WHERE id = ? AND idUser = ?';
  connection.query(query, [idNote, idUser], (error, results) => {
    if (error) {
      return res.status(500).send('Błąd serwera');
    } else {
      return res.status(200).json(results[0]);
    }
  });
})

app.put('/editNoteById', verifyToken, async (req, res) => {
  const idUser = req.user.userId;
  const idNote = req.query.id;
  const { title, content, isEncrypted, password } = req.body;
  const creationDate = moment().format('YYYY-MM-DD');

  connection.query('UPDATE notes SET title = ?, content = ?, creationDate = ?, isEncrypted = ?, password = ? WHERE idUser = ? AND id = ?',
    [title, content, creationDate, isEncrypted, password, idUser, idNote],
    (error) => {
      if (error) return res.status(500).send(error);
      return res.status(200).send("Edycja zakończyła się powodzeniem.");
    }
  )
})

app.delete('/deleteNote', verifyToken, (req, res) => {
  const idUser = req.user.userId;
  const idNote = req.query.id;

  const query = 'DELETE FROM notes WHERE id = ? AND idUser = ?';
  connection.query(query, [idNote, idUser], (error, results) => {
    if (error) {
      res.status(500).send('Błąd serwera');
    } else {
      res.status(200).send('Notatka usunięta prawidłowo.');
    }
  })
});

app.get('/getUser', verifyToken, (req, res) => {
  const idUser = req.user.userId;

  const query = 'SELECT email, username, password FROM users WHERE id = ?';
  connection.query(query, [idUser], (error, results) => {
    if (error) {
      res.status(500).send('Błąd serwera');
    } else {
      res.status(200).send(results[0]);
    }
  })
})

app.put('/changePassword', verifyToken, (req, res) => {
  const idUser = req.user.userId;
  const { newPassword } = req.body;

  const query = 'SELECT password FROM users WHERE id = ?';
  connection.query(query, [idUser], (error, results) => {
    if (error) {
      res.status(500).send('Błąd serwera');
    } else {
      connection.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, idUser], (error) => {
        if (error) return res.status(500).send(error);
        return res.status(200).send("Hasło zostało zmienione.");
      })
    }
  })
})