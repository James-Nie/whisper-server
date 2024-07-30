import { Controller, Post, Get, Query, Headers, HttpException,HttpStatus, Body, UseInterceptors } from "@nestjs/common";
import { _UserService } from "./user.service";
import { AuthService } from '../auth/auth.service';
import {genSaltPassword} from '../common/util/util';
import { LoginInterceptor } from '../common/interceptor/login.interceptor';


@Controller('user')
@UseInterceptors(LoginInterceptor)
export class UserController {
    constructor(
        private readonly _userService: _UserService,
        private readonly authService: AuthService
    ) {}

    @Get('getInfo')
    async getUserInfo(@Query() query, @Headers() headers) {
        const { accesstoken } = headers;
        
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this._userService.getUserMes({user_id: decodedToken.userId});

    }

    // 修改用户信息
    @Post('updateInfo')
    async updateUserInfo(@Headers() headers, @Body() body) {
        const { accesstoken } = headers;
        const { nick_name, password, user_avatar } = body;
  
        const decodedToken = this.authService.decodeToken(accesstoken);
        const userId = decodedToken.userId
        
        let user_saltPassword;
        if(password) {
            user_saltPassword = await genSaltPassword(password);
        }

        if(nick_name || password || user_avatar) {
            return this._userService.updateUserInfo({user_id: userId, nick_name, user_avatar, user_saltPassword })
        }
        
    }

    // 获取所有的用户
    @Get('all')
    async getUsers(@Query('length') length, @Headers() headers) {
        return await this._userService.getAllUsers();
    }

    /**
     * 是否vip
     * @param accessToken 
     * @returns 
     */
    @Get('isvip')
    async isVip(@Headers('accesstoken') accessToken: string) {
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this._userService.isVip(decodedToken.userId);
    }
}