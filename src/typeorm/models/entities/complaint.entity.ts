import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

/**
 * 投诉举报表
 */
@Entity()
export class Complaint {
    @Column({type:"int", width: 10})
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 100, comment: '投诉用户id'})
    user_id: string;

    @Column({type: "varchar", length: 100, comment: '被投诉用户id'})
    being_complained_user_id: string;

    @CreateDateColumn({comment: '投诉时间'})
    create_time: Date;

    @Column({type: "varchar", width: 255, comment: '投诉内容'})
    content: string;
}