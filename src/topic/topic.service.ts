import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { MoreThan, Not } from "typeorm";
import { DialogService } from "../typeorm/models/services/dialog.service";
import { Dialog } from "../typeorm/models/entities/dialog.entity";
import { UserService } from "../typeorm/models/services/user.service";
import { FriendshipService} from "../typeorm/models/services/friendship.service";
import { _TopicService } from "../typeorm/models/services/topic.service";

@Injectable()
export class TopicService {
    constructor(
        private readonly dialogService: DialogService,
        private readonly userService: UserService,
        private readonly friendShipService: FriendshipService,
        private readonly _topicService: _TopicService
    ) { }

    /**
        * 发送一条新的临时消息
        */
    async createTopic(userId: string, message: string) {
        const opiton = {
            from_user_id: userId,
            content: message,
        };

        this._topicService.createTopic(opiton)
    }

    /**
     * 搜索一条新的临时消息
     */
    async searchNewTopic(userId: string) {
        // 好友列表用户id
        const friendshipOption = {
            select: ["friend_user_id"],
            where: {
                user_id: userId
            }
        }
        const friendsInfos = await this.friendShipService.getFriendshipMes(friendshipOption)
        const friendsIds = friendsInfos.map(item => {
            return item.friend_user_id
        })

        // 历史对话用户id
        const dialogOption = {
            select: ["dialog_target_id"],
            where: {
                dialog_from_id: userId,
                dialog_last_time: MoreThan(new Date( Date.now() - 86400000 * 10 ))
            }
        }
        const dialogUsers = await this.dialogService.getDialogs(dialogOption);
        const dialogUserIds = dialogUsers.map(item => {
            return item.dialog_target_id
        })

        const userIds = Array.from(new Set([...friendsIds, ...dialogUserIds, ...[userId]]));
        const message = await this._topicService.searchTopic(userIds)

        console.log('messages===', message, friendsIds, dialogUserIds)

        if (!message) {
            return {}
        }

        await this._topicService.updateTopicByOption({
            id: message.id
        }, {
            accept_number: message.accept_number + 1
        })

        const targetUserRes = await this.userService.getUserBasicMes({
            user_id: userId
        })

        const fromUserRes = await this.userService.getUserBasicMes({
            user_id: message.from_user_id
        })

        const {
            id: messageId,
            content: messageContent,
            content_type: messageContentType,
            created_time: messageCreatedTime
        } = message;

        const messageData = {
            from: {
                userId: fromUserRes.user_id,
                socketId: fromUserRes.user_socketId,
                avatar: fromUserRes.user_avatar,
                nickName: fromUserRes.nick_name,
                userState: fromUserRes.user_state
            },
            target: {
                userId: targetUserRes.user_id,
                socketId: targetUserRes.user_socketId,
                avatar: targetUserRes.user_avatar,
                nickName: targetUserRes.nick_name,
                userState: targetUserRes.user_state
            },
            messageId,
            messageContent,
            messageContentType,
            messageCreatedTime,
            messageReadState: 0
        }

        return messageData;
    }
}