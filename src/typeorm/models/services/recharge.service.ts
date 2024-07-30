import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { Recharge } from "../entities/recharge.entity";


@Injectable()
export class _RechargeService {
    constructor(
        @Inject("RECHARGE_REPOSITORY")
        private readonly rechargeRepository: Repository<Recharge>
    ) {}

    /**
     * 新增
     * @param content 
     */
    async createOrder<T extends keyof Recharge>(content: Partial<Recharge>): Promise<any> {
        const v = await this.rechargeRepository.insert(content);
        return v.identifiers[0];
    }

    /**
     * 更新
     * @param content 
     * @returns 
     */
    async updateOrder<T,N>(option: T,updateContent: Partial<Recharge>): Promise<any> {
        return await this.rechargeRepository.update(option, updateContent);
    }

    /**
     * 查询一条记录
     * @param option 
     */
    async getOne<T>(option: T): Promise<Recharge> {
        return await this.rechargeRepository.findOne(option);
    }

    /**
     * 通过指定条件查询
     * @param option 
     */
    async getRechargesByOption<T>(option: T): Promise<Array<Recharge>> {
        return await this.rechargeRepository.find(option);
    }
}