import { Controller, Get, Post, Query, Headers, Body, UseInterceptors } from "@nestjs/common";
import { TopicService } from "./topic.service";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';
import { AuthService } from "../auth/auth.service";

@Controller('topic')
@UseInterceptors(LoginInterceptor)
export class TopicController {
    constructor(
        private readonly topicService: TopicService,
        private readonly authService: AuthService
    ) {}

    /**
     * 发送一条topic
     */
    @Post('create')
    async createTopic(
        @Headers('accesstoken') accessToken: string,
        @Body('message') message: string
    ) {
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this.topicService.createTopic(decodedToken.userId, message)
    }

    /**
     * 搜索一条topic
     */
    @Get('search')
    async searchNewTopic(@Headers('accesstoken') accessToken: string) {
        const decodedToken = this.authService.decodeToken(accessToken);
        return await this.topicService.searchNewTopic(decodedToken.userId)
    }
}