import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";

import * as bcrypt from "bcryptjs";

import { User } from "../entities/user.entity";
import { userInfo } from "os";

export interface UserBasicMes {
    user_id: string;
    user_name: string;
    nick_name: string;
    device_id: string;
    user_avatar: string;
    // user_reg_time: string;
    user_lastLogin_time: string;
    user_state: number;
    user_socketId: number;
    user_preferSetting_id: number;
    gender: number;
}

interface RegisterUserMes {
    user_name: string;
    user_saltPassword: string;
    user_avatar?: string;
    user_state: number;
    device_id: string;
    nick_name: string;
    gender: number;
}

@Injectable()
export class UserService {
    constructor(@Inject('USER_REPOSITORY') private readonly userRepository: Repository<User>){}

    /**
     * 判断当前用户是否在线
     * @param option 
     */
    async checkUserState<T>(option: T): Promise<boolean> {
        const {user_state: userState} = await this.userRepository.findOne(option);
        return userState === 0 ? false : true;
    }

    /**
     * 检查用户是否存在
     * @param checkOption 
     */
    async checkUserExistence<T>(checkOption: T): Promise<boolean> {
        const count = await this.userRepository.count({
            where: checkOption
        });
        return count === 0 ? false : true;
    }

    /**
     * 用户注册（向user表添加用户注册信息）并返回注册用户必要的基本信息
     * @param registerUserMes 
     */
    async userRegister(registerUserMes: RegisterUserMes): Promise<UserBasicMes> {
        await this.userRepository.insert(registerUserMes);
        const userBasicMes = await this.getUserBasicMes({user_name: registerUserMes.user_name});
        return userBasicMes;
    }

    /**
     * 检查用户密码与加密后的密码是否匹配
     * @param userName 
     * @param password 
     */
    async checkUserPassword(userName: string,password: string): Promise<boolean> {
        let saltPassword: string;
        const user = await this.userRepository.findOne({
            where: {
                user_name: userName
            }
        });
        if(user) {
            saltPassword = user.user_saltPassword;
            return await bcrypt.compare(password,saltPassword);
        }
        return false;
    }

    utf8_bin

    /**
     * 获取用户基本信息
     * @param option 
     */
    async getUserBasicMes<T>(option: T): Promise<UserBasicMes> {
        const user = await this.userRepository.findOne({
            where: option
        });

        if(user) {
            const userBasicMes: UserBasicMes = {
                user_id: user.user_id,
                user_name: user.user_name,
                user_avatar: user.user_avatar,
                user_lastLogin_time: user.user_lastLogin_time,
                user_state: user.user_state,
                user_socketId: user.user_socketId,
                user_preferSetting_id: user.user_preferSetting_id,
                device_id: user.device_id,
                nick_name: user.nick_name,
                gender: user.gender
            }
            return userBasicMes;
        }
        
        return null;
    }

    /**
     * 更新用户信息
     * @param option 
     * @param updateContent 
     */
    async updateUser<T,N>(option: T,updateContent: N) {
        await this.userRepository.update(option,updateContent);
    }

    /**
     * 获取用户列表
     * @param option 
     */
    async getUsersMes<T>(option: T): Promise<Array<UserBasicMes>> {
        return await this.userRepository.find(option);
    }
}
