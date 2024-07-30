/**
 * jwt的配置
 */
export const jwtConfig = {
    tokenExpiresTime: 1000 * 60 * 60 * 24 * 7,
    jwtSecret: 'AngelChatinSecret'
}

/**
 * 默认群组的配置
 */
export const defaultGroup = {
    groupName: 'Angel'
}

const CONFIG = {
    dev: {
        mysql: {
            host: 'localhost',
            port: '3306',
            username: 'root',
            password: 'qazxsw!@#$%',
            database: 'chating'
        },
        oss: {
            endpoint: 'xxx',
            accessKeyId: 'xxx',
            accessKeySecret: 'xxx',
            bucketName: 'xxx'
        },
        redis: {
            host: 'localhost',
            port: 6379
        },
        verifyReceiptUrl: 'https://sandbox.itunes.apple.com/verifyReceipt',
        sandbox: true
    },
    pre: {
        verifyReceiptUrl: 'https://sandbox.itunes.apple.com/verifyReceipt',
        sandbox: true
    },
    prod: {
        verifyReceiptUrl: 'https://buy.itunes.apple.com/verifyReceipt',
        sandbox: false
    }
}

/**
 * 当前环境的host,静态文件目录
 */
const baseUrl: string = "http://localhost:3000";
export const staticDirname = '/static/';
export const staticDirPath = baseUrl + staticDirname;

export default {
    ...CONFIG[process.env.NODE_ENV]
};
