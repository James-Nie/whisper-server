import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { genSaltPassword } from '../common/util/util';

import { RandomAvatarsService } from "../typeorm/models/services/random_avatars.service";
import { UserService } from "../typeorm/models/services/user.service";
import { GroupRelationshipService } from "../typeorm/models/services/group_relationship.service";
import { _GroupService } from "../typeorm/models/services/_group.service";
import { DialogService } from "../typeorm/models/services/dialog.service";
import { ChatingMessageService } from "../chating_message/chating_message.service";


@Injectable()
export class RegisterService {
    constructor(
        private readonly randomAvatarService: RandomAvatarsService,
        private readonly userService: UserService,
        private readonly groupRelationshipService: GroupRelationshipService,
        private readonly groupService: _GroupService,
        private readonly dialogService: DialogService,
        private readonly chatingMessageService: ChatingMessageService
    ) {}
    
    /**
     * 用户注册（注册成员默认会加入默认群组，并且创建对话dialog关系）
     * @param userName 
     * @param password 
     */
    async register(userName: string, password: string, deviceId: string,nickName: string, gender: number) {
        const datetime: string = new Date().toLocaleString();
        const UserExistence = await this.userService.checkUserExistence({user_name: userName});
        if(UserExistence) {
            throw new HttpException('用户名已存在',HttpStatus.BAD_REQUEST);
        }
        const saltPassword = await genSaltPassword(password);
        // const randomAvatarUrl = await this.randomAvatarService.getRandomAvatarUrl();
        const userState = 0;
        const userBasicMes = await this.userService.userRegister({
            user_name: userName,
            user_saltPassword: saltPassword,
            user_state: userState,
            device_id: deviceId,
            nick_name: nickName,
            gender: gender
        })

        console.log('userBasicMes===', userBasicMes)
        // 注册的成员默认加入默认群组
        // const defaultGroup = await this.groupService.getDefaultGroup();
        // await this.groupRelationshipService.createGroupRelationship({
        //     user_id: userBasicMes.user_id,
        //     group_id: defaultGroup.group_id,
        //     top_if: 0,
        //     group_member_type: '普通'
        // })

        // // 获取默认群组的最后一条消息
        // const defaultLastMes = await this.chatingMessageService.getLastMessageMesByOption({
        //     message_to_id: defaultGroup.group_id
        // })

        // const {message_id: lastMessageId} = defaultLastMes; 

        // // 为注册成员创建默认dialog关系（与默认群组）
        // await this.dialogService.createDialog({
        //     dialog_id: undefined,
        //     dialog_from_id: userBasicMes.user_id,
        //     dialog_target_id: defaultGroup.group_id,
        //     last_message_id: lastMessageId,
        //     dialog_last_time: datetime
        // })
        return {
            ...userBasicMes
        }
    }
}
