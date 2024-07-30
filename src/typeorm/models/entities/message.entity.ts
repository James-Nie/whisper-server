import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Message {
    @Column({type: "int", width: 100})
    @PrimaryGeneratedColumn()
    message_id: number;

    @Column({type: "char", length: 100})
    message_from_id: string;

    @Column({type: "char", length: 100})
    message_to_id: string;

    @Column({type: "int", width: 1, comment: "消息类型，私聊还是群聊:0|1"})
    message_type: number;

    @Column({type: "text", comment: "消息内容"})
    message_content: string;

    @Column({type: "char", length: 20, default: 'text', comment: "消息内容类型:text|image|audio"})
    message_content_type: string;

    @CreateDateColumn()
    message_created_time: Date;

    @Column({type: "int", width: 1, comment: "消息在线状态:0|1"})
    message_state: number;

    @Column({type: "int", width: 1, default: 0, comment: "图片/语音消息已读状态:0|1"})
    message_read_state: number;
}