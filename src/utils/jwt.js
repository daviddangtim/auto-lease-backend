import jwt from "jsonwebtoken";

export const sign = (id) =>
  new Promise((resolve, reject) => {
    const { JWT_SECRET, JWT_EXPIRES } = process.env;
    jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES }, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });

export const verify = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    });
  });
