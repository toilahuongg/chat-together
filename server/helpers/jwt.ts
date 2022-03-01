import jwt from 'jsonwebtoken';
export const signToken = (payload: any, secret: string, exp: string) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: exp
    })
    return token;
}

export const verifyToken = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) reject(err);
            resolve(decoded);
        })
    })
}