import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";

@Entity()
export class Dialog {
    @Column({type:"int", width: 10})
    @PrimaryGeneratedColumn()
    dialog_id: number;

    @Column({type: "char", length: 100})
    dialog_from_id: string;

    @Column({type: "char", length: 100})
    dialog_target_id: string;

    @UpdateDateColumn()
    dialog_last_time: Date;

    @Column({type: "int", width: 10, nullable: true})
    last_message_id: number;

    @Column({type: "boolean", default: false, comment: "认可状态"})
    is_accept: boolean;

    @Column({ type: "int", width: 10, default: 0, comment: "消息未读数" })
    unread_num: number;

}