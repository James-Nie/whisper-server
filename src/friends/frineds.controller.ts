import { Body, Controller, Get, Post, Query, Headers, UseInterceptors } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { AuthService } from "../auth/auth.service";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';

@Controller('friends')
@UseInterceptors(LoginInterceptor)
export class FriedsController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly authService: AuthService
    ) {}

    /**
     * 获取好友列表
     * @param accesstoken 
     * @param isShield 
     * @returns []
     */
    @Get('list')
    async getFriendsList(@Headers('accesstoken') accesstoken, @Query('isShield') isShield ) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        const is_shield = !!isShield;
        return await this.friendsService.getFriendsList(decodedToken.userId, is_shield);
    }

    /**
     * 添加好友
     * @param friendUserId 
     * @param accesstoken 
     * @returns 
     */
    @Post('add')
    async addFriend(@Body('friendUserId') friendUserId, @Headers('accesstoken') accesstoken) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this.friendsService.addFriend(decodedToken.userId, friendUserId);
    }

     /**
     * 是否好友
     * @param accesstoken 
     * @param userId 
     * @returns 
     */
     @Post('isFriend')
     async getFriendState(@Headers('accesstoken') accesstoken, @Body('userId') userId) {
         const decodedToken = this.authService.decodeToken(accesstoken);
         return await this.friendsService.getFriendState(decodedToken.userId, userId);
     }

    /**
     * 屏蔽删除
     * @param friendUserId 
     * @param accesstoken 
     * @returns 
     */
    @Post('shield')
    async shieldFriend(@Body('friendUserId') friendUserId, @Headers('accesstoken') accesstoken) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this.friendsService.updateShieldFriend(decodedToken.userId, friendUserId, 1);
    }

    /**
     * 恢复删除
     * @param friendUserId 
     * @param accesstoken 
     * @returns 
     */
    @Post('tonormal')
    async returnToNormal(@Body('friendUserId') friendUserId, @Headers('accesstoken') accesstoken) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this.friendsService.updateShieldFriend(decodedToken.userId, friendUserId, 0);
    }

    /**
     * 投诉举报
     * @param complainedUserId 被投诉用户
     * @param content 举报内容
     * @param accesstoken 
     * @returns 
     */
    @Post('complaint')
    async complaint(@Body('complainedUserId') complainedUserId, @Body('content') content, @Headers('accesstoken') accesstoken) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this.friendsService.genComplaint(decodedToken.userId, complainedUserId, content);
    }

    /**
     * 认可某人
     * @param accesstoken 
     * @param userId 
     * @returns 
     */
    // @Post('accept')
    // async accept(@Headers('accesstoken') accesstoken, @Body('userId') userId) {
    //     const decodedToken = this.authService.decodeToken(accesstoken);
    //     return await this.friendsService.accept(decodedToken.userId, userId);
    // }

    /**
     * 是否认可
     * @param accesstoken 
     * @param userId 
     * @returns 
     */
    @Post('isAccept')
    async isAcceptState(@Headers('accesstoken') accesstoken, @Body('userId') userId) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        return await this.friendsService.checkIsAcceptState(decodedToken.userId, userId);
    }
}