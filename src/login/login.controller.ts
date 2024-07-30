import { Controller, Post, Get, Body, Headers } from "@nestjs/common";

import { LoginService } from "./login.service";
import { AuthService } from '../auth/auth.service';

@Controller()
export class LoginController {
    constructor(
        private readonly loginService: LoginService,
        private readonly authService: AuthService
    ) {}

    /**
     * 登录
     * @param userName 账号
     * @param password 密码
     * @param accessToken token
     * @returns 
     */
    @Post('login')
    async login(
        @Body('userName') userName: string,
        @Body('password') password: string,
        @Body('accessToken') accessToken: string
    ) {
        console.log('userName==', userName, password)
        return await this.loginService.login(userName,password,accessToken);
    }

    /**
     * 登出
     * @param headers 
     * @returns 
     */
    @Get('logout')
    async loginOut(@Headers('accesstoken') accesstoken) {
        if(accesstoken) {
            const decodedToken = this.authService.decodeToken(accesstoken);
            this.authService.validateToken
            return await this.loginService.logout(decodedToken.userId); 
        }
        return true;
    }


    // 心跳检测接口（放在这里不合适，但是目前没有单独的controller）
    @Get('heartbeat')
    async heartbeat() {
        return true;
    }
}