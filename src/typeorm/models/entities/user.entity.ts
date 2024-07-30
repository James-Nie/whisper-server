import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn, Collection } from 'typeorm';

@Entity()
export class User {
    @Column({type: "varchar", length: 100})
    @PrimaryGeneratedColumn("uuid")
    user_id: string;

    @Column({type: "varchar", length: 50, unique: true})
    user_name: string;

    @Column({type: "varchar", length: 50})
    nick_name: string;

    @Column({
        type: "int",
        comment: "性别 1男|0女",
        width: 1
    })
    gender: number;

    @Column({
        type: "int",
        comment: "期望收到什么性别用户的消息",
        width: 1,
        default: 2
    })
    desired_message: number;

    @Column({
        type: "boolean",
        comment: "是否被封号",
        default: false
    })
    freeze: boolean;

    @Column({
        type: "varchar",
        length: 50,
        unique: true,
        comment: "绑定的设备id"
    })
    device_id: string;

    @Column({type: "varchar", length: 100})
    user_saltPassword: string;

    @Column({type: "char", length: 255, nullable: true})
    user_avatar: string;

    @CreateDateColumn()
    user_reg_time: Date;

    @Column({type: "datetime", nullable: true})
    user_lastLogin_time: string;

    @Column({type: "int", width: 1, comment: '登录状态'})
    user_state: number;

    @Column({type: "int", width: 10, unique: true, nullable: true})
    user_socketId: number;

    @Column({type: "int", width: 10, unique: true, nullable: true})
    user_preferSetting_id: number;
}
