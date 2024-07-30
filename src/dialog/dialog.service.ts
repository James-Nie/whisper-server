import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { MoreThan } from 'typeorm';
import { DialogService } from "../typeorm/models/services/dialog.service";
import { Dialog } from "../typeorm/models/entities/dialog.entity";
import { UserService, UserBasicMes } from "../typeorm/models/services/user.service";
import { _GroupService } from "../typeorm/models/services/_group.service";
import { Group } from "../typeorm/models/entities/_group.entity";
import { MessageService } from "../typeorm/models/services/message.service";
import { Message } from "../typeorm/models/entities/message.entity";

@Injectable()
export class _DialogService {
    constructor(
        private readonly dialogService: DialogService,
        private readonly userService: UserService,
        private readonly _groupService: _GroupService,
        private readonly messageService: MessageService
    ) {}
    
    /**
     * 获取用户的所有dialog列表
     * @param userId 
     * @param page 
     * @param limit 
     */
    async getDialogListByUserId(userId: string, page: number, limit: number) {
        const dialogs: Array<Dialog> = await this.dialogService.getDialogs({
            where: {
                dialog_target_id: userId,
                unread_num: MoreThan(0)
            },
            order: {
                dialog_last_time: "DESC"
            },
            skip: (page-1) * limit,
            take: limit
        });
        const dialogList = await this.resolveDialogList(dialogs);
        const pageSum = await this.getPageSumByLimit(userId,limit);
        return {
            curPage: page,
            length: dialogList.length,
            pageSum,
            list: dialogList
        }
    }


    /**
     * 更新dialog信息
     * @param option 
     * @param createDialogMes 
     * @param updateContent 
     */
    async updateDialogMes(
        option,
        createDialogMes,
        updateContent
    ) {
        const exitDialog: boolean = await this.dialogService.checkDialog(option);
        if(!exitDialog) {
            await this.dialogService.createDialog(createDialogMes);
        }
        else {
            await this.dialogService.updateDialog(option,updateContent);
        }
        
        const dialog = await this.dialogService.getDialog({
            where: option
        });
        
        return dialog;
    }



    /**
     * 处理dialogList
     * @param dialogs 
     */
    async resolveDialogList(dialogs: Array<Dialog>) {
        const dialogPromiseList: Array<Promise<any>> = dialogs.map(async (dialog: Dialog) => {
            const {
                dialog_id: dialogId,
                dialog_target_id: dialogTargetId,
                dialog_from_id: dialogFromId,
                last_message_id: lastMessageId,
                dialog_last_time: dialogLastTime,
                unread_num: unreadNum
            } = dialog;
            const targetType = await this.getDialogTargetType(dialog);
            const targetMes = await this.getTargetMes(targetType, dialogFromId);
            // 如果好友双方没有任何历史聊天记录，则返回以下形式
            if(!lastMessageId) {
                return {
                    dialogId,
                    dialogTargetId: dialogFromId,
                    dialogFromId: dialogTargetId,
                    dialogTarget: targetMes,
                    dialogLastTime,
                    lastMessage: {
                        messageContent: '暂无消息',
                        messageContentType: 'text',
                        messageCreatedTime: dialogLastTime
                    }
                };
            }
            const lastMessageMes: Message = (await this.messageService.findMessageByOption({
                message_id: lastMessageId
            }))[0];

            const {
                message_id: messageId,
                message_from_id: messageFromId,
                message_type: messageType,
                message_content: messageContent,
                message_content_type: messageContentType,
                message_created_time: messageCreatedTime
            } = lastMessageMes;
            
            return {
                dialogId,
                dialogTargetId: dialogFromId,
                dialogFromId: dialogTargetId,
                dialogTarget: targetMes,
                dialogLastTime,
                unreadNum: unreadNum,
                lastMessage: {
                    messageId,
                    messageType,
                    messageContent,
                    messageContentType,
                    messageCreatedTime
                }
            }
        })

        return Promise.all(dialogPromiseList);
    }
    /**
     * 获取总页数
     * @param userId 
     * @param limit 
     */
    async getPageSumByLimit(userId: string,limit: number): Promise<number> {
        const counts: number = (await this.dialogService.getDialogs({
            where: {
                dialog_from_id: userId
            }          
        })).length;
        const pageSum = Math.floor(counts/limit) + 1;
        return pageSum;
    }
    /**
     * 获取对话目标的信息
     * @param targetType 
     * @param dialogTargetId 
     */
    async getTargetMes(targetType: string,dialogTargetId: string): Promise<any> {
        let targetMes: UserBasicMes | Group;
        if(targetType === 'user') {
            targetMes = await this.userService.getUserBasicMes({
                user_id: dialogTargetId
            })
            return {
                targetType,
                userId: targetMes.user_id,
                userName: targetMes.user_name,
                nickName: targetMes.nick_name,
                avatar: targetMes.user_avatar,
                userState: targetMes.user_state
            }
        }
        // 暂时用不到
        else {
            targetMes = await this._groupService.getGroupMes({
                group_id: dialogTargetId
            })
            return {
                targetType,
                targetId: targetMes.group_id,
                targetName:  targetMes.group_name,
                targetAvatar: targetMes.group_avatar,
                targetState: 1
            }
        }
    }
    /**
     * 获取对话目标类型（私聊还是群聊）
     * @param dialog 
     */
    async getDialogTargetType(dialog: Dialog): Promise<string> {
        const {dialog_target_id: dialogTargetId} = dialog;
        let targetType: string;
        if(await this.userService.checkUserExistence({
            user_id: dialogTargetId
        })) {
            targetType = 'user'
        }
        else if(await this._groupService.checkGroupExistence({
            group_id: dialogTargetId
        })) {
            targetType = 'group'
        }
        else {
            throw new HttpException('目标用户不存在',HttpStatus.FORBIDDEN);
        }
        return targetType;
    }
    
    /**
     * 检查dialog是否存在，并返回该dialog信息
     * @param option 
     */
    async checkAndGetDialogMes<T>(option: T): Promise<Dialog> {
        if(!await this.dialogService.checkDialog(option)) {
            throw new HttpException('该对话不存在',HttpStatus.FORBIDDEN);
        }
        else {
            return await this.dialogService.getDialog({
                where: option
            });
        }
    }
}