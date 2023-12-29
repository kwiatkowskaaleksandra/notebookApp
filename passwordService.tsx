import BcryptReactNative from 'react-native-bcrypt';

const checkPassword = async (password: string) => {
    const specialCharacters = /[!@#$%^&*()_+{}[\]:;<>,.?~\\]/;
    if (password.length < 10) {
      return 'Podane hasło jest za krótkie. Powinno zawierać co najmniej 10 znaków.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Hasło powinno zawierać co najmniej jedną małą literę.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Hasło powinno zawierać co najmniej jedną dużą literę.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Hasło powinno zawierać co najmniej jedną cyfrę.';
    }
    if (!specialCharacters.test(password)) {
      return 'Hasło powinno zawierać co najmniej jeden znak specjalny.';
    }
  
    return null;
  }

const encryptPassword = (password: string) => {
  return new Promise((resolve, reject) => {
    BcryptReactNative.setRandomFallback((len) => {
      const buf = new Uint8Array(len);
      return Array.from(buf).map(() => Math.floor(Math.random() * 256));
    });

    BcryptReactNative.genSalt(10, function (err, salt) {
      if (err) {
        return reject(err);
      }

      BcryptReactNative.hash(password, salt as string, function (err, hash) {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });
  });
}

const checkPasswordToEdit = async (newPassword: string, repeatedNewPassword: string) => {
 
    if (newPassword !== repeatedNewPassword) {
      return ("Podane nowe hasła różnią się.");
    } else if (newPassword === '' || repeatedNewPassword === '') {
      return ("Hasło nie może być puste.");
    }  
    return null
}

const verifyPassword = (password: string, passwordDB: string) => {
  return new Promise((resolve, reject) => {
    BcryptReactNative.compare(password, passwordDB, function(err, res){
      if (err) {
        return reject(err);
      }
      resolve(res)
    }) 
  })
}

  export {checkPassword, encryptPassword, verifyPassword, checkPasswordToEdit}
