import { Controller, Headers, Get, Body, Query, Post, UseInterceptors } from "@nestjs/common";
import { ChatingMessageService } from "./chating_message.service";
import { QueryExpressionMap } from "typeorm/query-builder/QueryExpressionMap";
import { AuthService } from '../auth/auth.service';
import { LoginInterceptor } from '../common/interceptor/login.interceptor';

@Controller('message')
@UseInterceptors(LoginInterceptor)
export class ChatingMessageController {
    constructor(
        private readonly chatingMessageService: ChatingMessageService,
        private readonly authService: AuthService
    ) {}
    
    /**
     * 已登录用户获取指定dialog的历史消息
     * @param dialogId 
     * @param pageNo 
     * @param pageSize 
     */
    @Get('history')
    async getHistoryMessages(
        @Query('dialogId') dialogId: string,
        @Query('pageNo') pageNo: string,
        @Query('pageSize') pageSize: string,
        @Query('latestMessageId') latestMessageId: string
    ) {
        if(latestMessageId) {
            return await this.chatingMessageService.getHistoryMessages(
                Number(dialogId),
                Number(pageNo),
                Number(pageSize),
                Number(latestMessageId)
            )
        } else {
            return await this.chatingMessageService.getHistoryMessages(
                Number(dialogId),
                Number(pageNo),
                Number(pageSize)
            )
        }
        
    }

    
}