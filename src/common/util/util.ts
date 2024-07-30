const thuntify = require('thunkify');
const crypto = require('crypto');
import * as jwt from "jwt-simple";
// 引入bcrypt对密码进行加密
import * as bcrypt from "bcryptjs";

export const bePromise = (fn,...args) => {
    const thunkFn = thuntify(fn);
    return new Promise((resolve,reject) => {
        thunkFn(...args)((data,err) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(data);
        })
    }); 
}


// 加密轮数
const saltRounds = 10;

// 生成加盐后的密码
export async function genSaltPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(pass, salt);
    return hash;
}

/**
 * 解码Token
 * @param token 
 * @param secret 
 * @returns 
 */
export function decodeToken(token: string, secret: string) {
    try {
        return jwt.decode(token, secret);
    } catch (e) {
        console.log('decodeToken error ===', e)
    }
}

/**
 * 根据user-agent返回
 * @param userAgent 
 * @returns 
 */

export function getPlatform(userAgent: string) {
    const useragent = userAgent.toLowerCase();
    if(useragent.includes('iphone')) {
        return 'iPhone'
    } else if(useragent.includes('android')) {
        return 'Android'
    }
    return ''
}