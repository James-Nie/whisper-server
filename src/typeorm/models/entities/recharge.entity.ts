import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum RechargeChannel {
    Apple = 'Apple',
    WECHAT = 'Weixin',
    Alipay = 'Alipay'
}

// 充值状态
export enum RechargeState {
    CREATE = 'create',
    SUCCESS = 'success',
    FAIL = 'fail'
}

@Entity()
export class Recharge {
    @Column({type:"int", width: 10})
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "char", length: 100, comment: '用户id'})
    user_id: string;

    @Column({type: "enum", enum: RechargeChannel, comment: '充值方式'})
    recharge_channel: RechargeChannel;

    @Column({type: "char",length: 10, comment: '平台系统'})
    recharge_platform: string;

    @Column({ type: "int", width: 10, comment: "充值金额" })
    recharge_amount: number;

    @Column({ type: "char", width: 50, comment: "交易唯一标识", nullable: true, unique: true })
    transactionIdentifier: string;

    @Column({ type: "char", width: 30, comment: "产品id" })
    product_id: string;

    @Column({ type: "enum", enum: RechargeState, comment: "充值状态", default: RechargeState.CREATE })
    recharge_state: RechargeState;

    @CreateDateColumn({comment: '充值时间'})
    recharge_time: Date;

    @Column({ type: "date", comment: "到期时间" })
    expiration_time: Date;
}