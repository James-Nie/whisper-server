import { Controller, Get, Query, Headers, UseInterceptors, Post, Body } from "@nestjs/common";
import { _DialogService } from "./dialog.service";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';
import { AuthService } from "../auth/auth.service";

@Controller('dialog')
@UseInterceptors(LoginInterceptor)
export class DialogController {
    constructor(
        private readonly _dialogService: _DialogService,
        private readonly authService: AuthService
    ) {}

    /**
     * 分页获取dialog列表
     * @param userId 
     * @param page 
     * @param limit 
     */
    @Get('list')
    async getDialogList(
        @Headers('accesstoken') accesstoken,
        @Query('page') page: string,
        @Query('limit') limit: string 
    ) {
        const decodedToken = this.authService.decodeToken(accesstoken);
        
        return await this._dialogService.getDialogListByUserId(decodedToken.userId, Number(page) || 1, Number(limit) || 1000)
    }


    /**
     * 获取dialog信息
     * @param dialogFromId 
     * @param dialogTargetId 
     */
    @Get('info')
    async getDialogMes(
        @Query('dialogFromId') dialogFromId: string,
        @Query('dialogTargetId') dialogTargetId: string
    ) {
        const dialogMes = await this._dialogService.checkAndGetDialogMes({
            dialog_from_id: dialogFromId,
            dialog_target_id: dialogTargetId
        })
        if(dialogMes) {
            return {
                dialogId: dialogMes.dialog_id,
                dialogFromId: dialogMes.dialog_from_id,
                dialogTargetId: dialogMes.dialog_target_id,
                unreadNum: dialogMes.unread_num,
                lastMessageId: dialogMes.last_message_id
            }
        } 
        return {}
    }

    @Post('update')
    async updateDialog(@Headers('accesstoken') accesstoken, @Body() body ) {
        const { dialogId, unreadNum } = body;
        console.log('body===', body)
        if(unreadNum !== undefined) {
            return await this._dialogService.updateDialogMes({dialog_id: dialogId}, {}, {unread_num: unreadNum})
        }
        
    }

}