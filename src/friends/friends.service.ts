import { Injectable, HttpStatus, HttpException} from "@nestjs/common";
import { Socket } from "socket.io";
import { In } from "typeorm";

import {CustomWsException} from "../common/excption/customException";

import {UserService, UserBasicMes} from "../typeorm/models/services/user.service";
import {FriendshipService} from "../typeorm/models/services/friendship.service";
import {SocketService} from "../typeorm/models/services/socket.service";
import {InfoService} from "../typeorm/models/services/info.service";
import { DialogService } from "../typeorm/models/services/dialog.service";
import {_UserService} from "../user/user.service";
import { ComplaintService } from "../typeorm/models/services/complaint.service"
import { User } from "../typeorm/models/entities/user.entity";
import { Friendship } from "../typeorm/models/entities/friendship.entity";

var cnchar = require('cnchar');

interface AddFriendMes {
    fromUserId: string;
    targetUserName: string;
    addFriendTime: string;
    validation: string;
}

@Injectable()
export class FriendsService {
    constructor(
        private readonly userService: UserService,
        private readonly friendshipService: FriendshipService,
        private readonly socketService: SocketService,
        private readonly infoService: InfoService,
        private readonly dialogService: DialogService,
        private readonly _userService: _UserService,
        private readonly complaintService: ComplaintService
    ) {}

    /**
     * 获取好友列表
     * @param userId 
     */
    async getFriendsList(userId: User['user_id'], isShield: boolean) {
        await this._userService.checkUser({
            user_id: userId
        })
        const allFriendsIds = await this.getAllFriendsIds(userId, isShield);
        const allFriendsMes = await this.getFriendsMes(allFriendsIds);
        const friendsList = this.classifyFriendsByChar(allFriendsMes);
        return {
            length: allFriendsIds.length,
            list: friendsList
        }
    }

    /**
     * 根据首字母进行分类（非26个大写字母则分到#）
     * @param allFriendsMes 
     */
    classifyFriendsByChar(allFriendsMes: Array<UserBasicMes>) {
        const friendsCharMap: Map<string,Array<UserBasicMes>> = new Map();
        allFriendsMes.forEach(friendMes => {
            const firstLetter: string = cnchar.spell(friendMes.nick_name,'array','first')[0].toLocaleUpperCase();
            const pattern = /[A-Z]/g;
            if(pattern.test(firstLetter)) {
                this.solveCharMap(friendsCharMap,firstLetter,friendMes);
            }
            else {
                this.solveCharMap(friendsCharMap,'#',friendMes);
            }
        })
        const friendsList: {[char: string]: UserBasicMes[]} = {};
        friendsCharMap.forEach((friendsMes,char)=>{
            // 将数组内的好友根据unicode进行排序
            this.sortFriends(friendsMes);
            friendsList[char] = friendsMes;
        })
        return friendsList;
    }

    solveCharMap(friendsCharMap: Map<string,Array<UserBasicMes>>,char: string,friendMes: UserBasicMes) {
        if(friendsCharMap.has(char)) {
            friendsCharMap.get(char).push(friendMes);
        }
        else {
            friendsCharMap.set(char,[friendMes]);
        }
    }

    /**
     * 根据好友好友name的Unicode进行排序
     */
    sortFriends(allFriendsMes: Array<UserBasicMes>) {
        allFriendsMes.sort((friendA,friendB)=>{
            if(friendA.user_name < friendB.user_name) {
                return -1;
            }
            else if(friendA.user_name === friendB.user_name) {
                return 0;
            }
            else return 1;
        })
    }

    /**
     * 获取所有好友的基本信息
     * @param allFriendsIds 
     */
    async getFriendsMes(allFriendsIds: Array<User['user_id']>) {
        return await this.userService.getUsersMes({
            where: {
                user_id: In(allFriendsIds)
            }
        })
    }

    /**
     * 获取所有好友的ID
     * @param userId 
     */
    async getAllFriendsIds(userId: User['user_id'], isShield: boolean): Promise<Array<User['user_id']>> {
        const friendshipMess: Array<Friendship> = await this.friendshipService.getFriendshipMes({
            where: {
                user_id: userId,
                is_shield: isShield
            }
        })
        const friendsIds: Array<User['user_id']> = friendshipMess.map(item => {
            return item.friend_user_id
        });
        return friendsIds;
    }

    /**
     * 通过用户id添加好友
     * @param friendUserId 
     */
    async addFriend(socket, mes): Promise<any> {
        const {userId, friendUserId} = mes;
        console.log('addFriend===', socket.id, mes, userId, friendUserId)

        const isExist = await this.friendshipService.checkFriendshipExistence({
            where: {
                user_id: userId,
                friend_user_id: friendUserId
            }
        })
        if(isExist) {
            throw new CustomWsException("messageException", "两者已经是好友, 请勿重复添加");
        }

        const res = await this.friendshipService.createFriendship({
            user_id: userId,
            friend_user_id: friendUserId
        })

        if(res) {
            // 查询添加好友的socketId
            const targetUserBasicMes = await this.userService.getUserBasicMes({
                user_id: friendUserId
            })
            const { user_socketId: targetSocketId } = targetUserBasicMes;

            // 通知对方结果
            if(targetSocketId) {
                socket.to(targetSocketId).emit('addFriendFrom', {
                    fromUserId: userId
                })
            }
        }
    }

     /**
     * 查询好友状态
     * @param userId 
     * @param friendUserId 
     */
     async getFriendState(userId: string, friendUserId: string): Promise<any> {
        const fromFriendState = await this.friendshipService.checkFriendshipExistence({
            where: {
                user_id: userId,
                friend_user_id: friendUserId
            }
        })

        const toFriendState = await this.friendshipService.checkFriendshipExistence({
            where: {
                user_id: friendUserId,
                friend_user_id: userId
            }
        })

        return {
            isFriendFrom: fromFriendState,
            isFriendTo: toFriendState
        }
    }

    /**
     * 更新好友状态
     * @param userId 
     * @param friendUserId 
     * @param is_shield_state 
     * @returns 
     */
    async updateShieldFriend(userId: string, friendUserId: string, is_shield_state: number): Promise<any> { 
        await this._userService.checkUser({
            user_id: friendUserId
        })
        
        const checkFriendState = await this.friendshipService.checkFriendshipExistence({
            where: {
                user_id: userId,
                friend_user_id: friendUserId
            }
        })
        
        if(!checkFriendState) {
            throw new HttpException({
                success: false,
                message: '未添加此好友，请勿进行此操作',
            }, HttpStatus.OK);
        }

        return await this.friendshipService.updateFriendship({
            user_id: userId,
            friend_user_id: friendUserId
        }, {
            is_shield: is_shield_state
        })
    }

    /**
     * 投诉举报
     * @param userId 投诉用户
     * @param complainedUserId 被投诉用户 
     * @param content 投诉内容 
     */
    async genComplaint(userId: string, complainedUserId: string, content: string): Promise<any> {
        console.log('genComplaint===', userId, complainedUserId, content)
        
        await this._userService.checkUser({
            user_id: complainedUserId
        })

        return await this.complaintService.createComplaint({
            user_id: userId,
            being_complained_user_id: complainedUserId,
            content
        })
    }

    /**
     * 认可
     * @param userId 
     * @param acceptUserId 
     */
    async acceptFriend(socket, mes): Promise<any> {
        const {userId, acceptUserId} = mes;
       
        console.log('acceptFriend 111===', userId, acceptUserId)
        
        const isAccept = await this.dialogService.checkDialog({
            dialog_from_id: acceptUserId,
            dialog_target_id: userId,
            is_accept: 1
        })
 
        console.log('acceptFriend 222===', isAccept)
        
        if(isAccept) {
            throw new CustomWsException("messageException", "已认可此用户，请刷新页面");
        }
        
        const res = await this.dialogService.updateDialog({
            dialog_from_id: acceptUserId,
            dialog_target_id: userId,
        }, {
            is_accept: 1
        })

        
        if(res) {
            // 查询好友的socketId
            const targetUserBasicMes = await this.userService.getUserBasicMes({
                user_id: acceptUserId
            })
            const { user_socketId: userSocketId } = targetUserBasicMes;
            const socketMes = await this.socketService.getSocketMes({
                _id: userSocketId
            })
            const targetSocketId = socketMes.socket_id;
    
            console.log('acceptFriend 555===', targetSocketId)
        
            // 通知对方结果
            if(targetSocketId) {
                await socket.to(targetSocketId).emit('acceptFriendFrom', {
                    fromUserId: userId
                })
            }
        }

    }

    /**
     * 判断认可状态
     * @param userId 
     * @param acceptUserId 
     */
    async checkIsAcceptState(userId: string, acceptUserId: string): Promise<any> {
        const isAcceptFrom = await this.dialogService.checkDialog({
            dialog_from_id: acceptUserId,
            dialog_target_id: userId,
            is_accept: 1
        })

        const isAcceptTo = await this.dialogService.checkDialog({
            dialog_from_id: userId,
            dialog_target_id: acceptUserId,
            is_accept: 1
        })

        return {
            isAcceptFrom,
            isAcceptTo
        }
    }
}