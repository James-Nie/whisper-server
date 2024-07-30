import { Injectable, HttpStatus } from "@nestjs/common";
import { Socket } from "socket.io";
import { In, MoreThan, Not } from "typeorm";

import {MessageService} from "../typeorm/models/services/message.service";
import {UserService} from "../typeorm/models/services/user.service";
import {SocketService} from "../typeorm/models/services/socket.service";
import {CustomWsException} from "../common/excption/customException";
import { _GroupService } from "../typeorm/models/services/_group.service";

import { Group } from "../typeorm//models/entities/_group.entity";
import { Message } from "../typeorm/models/entities/message.entity";
import { DialogService } from "../typeorm/models/services/dialog.service";
import { _DialogService } from "../dialog/dialog.service";
import { GroupService } from "../group/group.service";
import { Dialog } from "../typeorm/models/entities/dialog.entity";

@Injectable()
export class ChatingMessageService {
    constructor(
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly socketService: SocketService,
        private readonly _groupService: _GroupService,
        private readonly dialogService: DialogService,
        private readonly _dialogService: _DialogService,
        private readonly  groupService: GroupService
    ) {}

    /**
     * 已登录用户通过dialogId分页获取经过处理后的历史消息
     * @param userId 
     */
    async getHistoryMessages(dialogId: number,pageNo: number,pageSize: number, latestMessageId?: number) {
        const dialog = await this._dialogService.checkAndGetDialogMes({
            dialog_id: dialogId
        });
        const {
            dialog_from_id: dialogFromId,
            dialog_target_id: dialogTargetId
        } = dialog;

        let messageOption: any = {
            message_from_id: dialogFromId,
            message_to_id: dialogTargetId
        }
        if(latestMessageId) {
            messageOption = {
                ...messageOption,
                message_id: MoreThan(latestMessageId)
            }
        }
        
        const historyMesLimit = await this.getMessagesByOption({
            where: {
                ...messageOption
            },
            skip: (pageNo-1) * pageSize,
            take: pageSize,
            // order: {
            //     "message_created_time": "DESC"
            // }
        });

        const historyMessages = await this.resolveHistoryMessage(dialogFromId, dialogTargetId, historyMesLimit);
        return {
            pageNo: pageNo,
            total: historyMesLimit.length,
            pageSize: pageSize,
            list: historyMessages
        }
    }

    // 发送消息（需要将所有信息进行持久化）
    async sendMessage(mes: Message, socket: Socket): Promise<any> {
        try {
            const {
                message_from_id: messageFromId,
                message_to_id: messageToId,
                message_type: messageType,
                message_content: messageContent,
                message_content_type: messageContentType
            } = mes;
            
            // 在线消息
            mes.message_state = 1;
    
            let messageId: number;
    
            let messageTarget;
    
            const {
                user_name: messageFromName,
                nick_name: messageFromNickName,
                user_avatar: messageFromAvatar,
                user_state: messageFromState
            } = await this.userService.getUserBasicMes({
                user_id: messageFromId
            })
            const messageCreatedTime = Date.now();
            
            // 私聊
            if(messageType === 0) {
                const exitence: boolean =  await this.userService.checkUserExistence({
                    user_id: messageToId
                })
                if(!exitence) {
                    throw new CustomWsException("messageException", "目标用户不存在");
                }
                const userBasicMes = await this.userService.getUserBasicMes({
                    user_id: messageToId
                })
                
                const targetUserBasicMes = await this.userService.getUserBasicMes({
                    user_id: messageToId
                })
                const {
                    user_socketId: userSocketId,
                    user_avatar: messageToAvatar,
                    user_name: messageToName,
                    nick_name: messageToNickName,
                    user_state: messageToState
                } = targetUserBasicMes;
    
               
                const socketMes = await this.socketService.getSocketMes({
                    _id: userSocketId
                })
    
                const targetSocketId = socketMes.socket_id;
    
                // 当目标用户离线时，将消息转为离线消息
                if(userBasicMes.user_state === 0 || !targetSocketId) {
                    mes.message_state = 0;
                }

                // 将消息进行持久化存储（在提示用户对方不在线前执行）
                messageId = await this.messageService.createMessage(mes);
                messageTarget = {
                    userId: messageToId,
                    avatar: messageToAvatar,
                    userName: messageToName,
                    nickName: messageToNickName,
                    userState: messageToState
                }
                console.log('messageId==', messageId, targetSocketId)

                const dialogInfo = await this._dialogService.updateDialogMes({
                    dialog_from_id: messageFromId,
                    dialog_target_id: messageToId
                },{
                    dialog_from_id: messageFromId,
                    dialog_target_id: messageToId,
                    last_message_id: messageId,
                },{
                    last_message_id: messageId,
                    unread_num: () => {
                        // if(mes.message_state === 0) {
                        //     return `unread_num + 1`
                        // }
                        return `unread_num + 1`
                    }
                });

                if(targetSocketId) {
                    const updateDialogInfo = {
                        dialogId: dialogInfo.dialog_id,
                        dialogTargetId: dialogInfo.dialog_target_id,
                        dialogFromId: dialogInfo.dialog_from_id,
                        dialogTarget: {
                            targetType: 'user',
                            userId: messageFromId,
                            userName: messageFromName,
                            nickName: messageFromNickName,
                            avatar: messageFromAvatar,
                            userState: messageFromState
                        },
                        dialogLastTime: dialogInfo.dialog_last_time,
                        unreadNum: dialogInfo.unread_num,
                        lastMessage: {
                            messageId,
                            messageType,
                            messageFromId,
                            messageFromName,
                            messageContent,
                            messageContentType,
                            messageCreatedTime
                        }
                    }
                    await socket.to(targetSocketId).emit('updateDialog', updateDialogInfo);

                    // 发送消息
                    await socket.to(targetSocketId).emit('messageFromFriend', {
                        dialogId: dialogInfo.dialog_id,
                        from: {
                            userId: messageFromId,
                            userName: messageFromName,
                            nickName: messageFromNickName,
                            avatar: messageFromAvatar,
                            userState: messageFromState
                        },
                        target: messageTarget,
                        messageId,
                        messageContent,
                        messageContentType,
                        messageType,
                        messageCreatedTime,
                        messageReadState: 0
                    });
                }
                
            }
            // 群聊
            else if(messageType === 1) {
                if(!(await this._groupService.checkGroupExistence({
                    group_id: messageToId
                }))) {
                    throw new CustomWsException("messageException","目标群组不存在");
                }
                else {
                    // 将消息进行持久化存储
                    messageId = await this.messageService.createMessage(mes);
                    const groupMes: Group = await this._groupService.getGroupMes({
                        group_id: messageToId
                    })
                    const {
                        group_name: groupName,
                        group_avatar: groupAvatar
                    } = groupMes;
                    messageTarget = {
                        messageToId,
                        messageToAvatar: groupAvatar,
                        messageToName: groupName,
                        messageToState: 1
                    }
                    socket.to(groupName).emit('groupMemberMessage',{
                        from: {
                            messageFromId,
                            messageFromName,
                            messageFromAvatar,
                            messageFromState
                        },
                        target: messageTarget,
                        messageId,
                        messageContent,
                        messageContentType,
                        messageType,
                        messageCreatedTime,
                        messageReadState: 0
                    });
                }
            }
    
            // 对于消息接收者来说，只适用于私聊
            if(messageType === 0) {
                
            }
            // 如果是群聊，则更新所有在群聊中成员的对话信息
            else {
                const groupMembers = await this.groupService.getGroupMembersId(messageToId);
                groupMembers.map(async userId => {
                    await this._dialogService.updateDialogMes({
                        dialog_from_id: userId,
                        dialog_target_id: messageToId
                    },{
                        dialog_id: undefined,
                        dialog_from_id: userId,
                        dialog_target_id: messageToId,
                        last_message_id: messageId,
                    },{
                        last_message_id: messageId,
                    });
                })
            }
    
            return {
                from: {
                    userId: messageFromId,
                    userName: messageFromName,
                    nickName: messageFromNickName,
                    avatar: messageFromAvatar,
                    userState: messageFromState
                },
                target: messageTarget,
                messageId,
                messageContent,
                messageContentType,
                messageType,
                messageCreatedTime,
                messageReadState: 0
            }
        } catch (error) {
            console.error('error===', error)
        }
        
    }

    /**
     * 通过指定条件获取相关message中的最后一条消息
     * @param id 
     */
    async getLastMessageMesByOption<T>(option: T): Promise<Message> {
        const messageMes: Message = (await this.messageService.findMessageByOption({
            where: option,
            order: {
                message_created_time: 'DESC'
            },
            skip: 0,
            take: 1
        }))[0];
        return messageMes;
    }
    /**
     * 通过指定条件获取messages
     * @param option 
     */
    async getMessagesByOption<T>(option: T): Promise<Array<Message>> {
        return await this.messageService.findMessageByOption(option);
    }

    /**
     * 处理历史消息
     * @param historyMessages 
     */
    async resolveHistoryMessage(fromUserId: string, targetUserId: string, historyMessages: Array<Message>) {
        try {
            if(historyMessages.length ===0) {
                return []
            }
            let messageFromMes, messageToMes;
            const users = await this.userService.getUsersMes({
                where: {
                    user_id: In([fromUserId, targetUserId])
                }
            })
            users.forEach(item => {
                if(item.user_id === fromUserId) {
                    messageFromMes = item
                } else if(item.user_id === targetUserId) {
                    messageToMes = item
                }
            })

            messageToMes = {
                userId: messageToMes.user_id,
                userName: messageToMes.user_name,
                nickName: messageToMes.nick_name,
                avatar: messageToMes.user_avatar,
                userState: messageToMes.user_state
            }
            messageFromMes = {
                userId: messageFromMes.user_id,
                userName: messageFromMes.user_name,
                nickName: messageFromMes.nick_name,
                avatar: messageFromMes.user_avatar,
                userState: messageFromMes.user_state
            }
            const promiseHistoryMessages = historyMessages.map( message => {
                const {
                    message_id: messageId,
                    message_from_id: messageFromId,
                    message_to_id: messageToId,
                    message_type: messageType,
                    message_content: messageContent,
                    message_content_type: messageContentType,
                    message_created_time: messageCreatedTime,
                    message_state: messageState,
                    message_read_state: messageReadState
                } = message;

                return {
                    from: messageFromMes,
                    target: messageToMes,
                    messageId,
                    messageType,
                    messageContent,
                    messageContentType,
                    messageCreatedTime,
                    messageState,
                    messageReadState
                }
            })
            return promiseHistoryMessages;
        } catch (error) {
            console.error('resolveHistoryMessage', error)
            return []
        }
        
    }
   
}