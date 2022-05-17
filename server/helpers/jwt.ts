import jwt from 'jsonwebtoken';
import { IUserData } from 'server/types/user.type';


/**
 * 
 * Mã hóa object dựa trên private key được cài đặt trong environment
 * @param payload 
 * @param secret 
 * @param exp 
 * @returns 
 */
export const signToken = (payload: any, secret: string, exp: string) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: exp
    })
    return token;
}

/**
 * giải mã đoạn key
 * @param token 
 * @param secret 
 * @returns 
 */
export const verifyToken = (token: string, secret: string): Promise<IUserData> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) reject(err);
            resolve(decoded as IUserData);
        })
    })
}
