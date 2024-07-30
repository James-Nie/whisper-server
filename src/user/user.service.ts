import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { UserService } from "../typeorm/models/services/user.service";
import { _RechargeService } from "../typeorm/models/services/recharge.service";
import { User } from "src/typeorm/models/entities/user.entity";
import { MoreThan } from "typeorm";

@Injectable()
export class _UserService {
    constructor(
        private readonly userService: UserService,
        private readonly _rechargeService: _RechargeService,
    ) {}
    
    /**
     * 获取用户信息
     * @param option 
     */
    async getUserMes<T extends keyof User>(option: Pick<User,T>) {
        this.checkUser(option);
        return this.userService.getUserBasicMes(option);
    }
    /**
     * 检查用户是否存在
     * @param userMes 
     */
    async checkUser<T extends keyof User>(userMes: Pick<User,T>) {
        const existence: boolean = await this.userService.checkUserExistence(userMes);
        if(!existence) {
            throw new HttpException('该用户不存在，为非法登录',HttpStatus.FORBIDDEN);
            return false;
        }
        return existence;
    }

    /**
     * 更新用户信息
     * @param userMes 
     */
    async updateUserInfo<T extends keyof User>(option: Partial<User>) {
        const { user_id, nick_name,user_avatar, user_saltPassword } = option;
        this.checkUser({
            user_id
        });
        await this.userService.updateUser({
            user_id
        },{
            nick_name,
            user_avatar,
            user_saltPassword
        })
        return this.userService.getUserBasicMes({user_id});
    }

    // 获取所有的用户
    async getAllUsers() {
        return this.userService.getUsersMes({})
    }

    /**
     * 判断是否vip
     * @param userId 
     * @returns 
     */
    async isVip(userId: string) {
        const option = {
            where: {
                user_id: userId,
                recharge_state: 'success',
                expiration_time: MoreThan(new Date())
            }
        }
        const info = await this._rechargeService.getOne(option)
        return info;
    }
}