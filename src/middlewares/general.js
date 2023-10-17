import bcrypt from 'bcrypt';

export const hashPassword = (req, res, next) => {
  const { password } = req.body;
  bcrypt.hash(password, 10, (err, hashPass) => {
    if (err) throw errorObject('==> Password Hashing Failed!');
    req.body.password = hashPass;
    next();
  });
};
