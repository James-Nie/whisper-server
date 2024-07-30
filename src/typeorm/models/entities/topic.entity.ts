import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

/**
 * 话题库
 */
@Entity()
export class Topic {
    @Column({ type: "int", width: 10 })
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "char", length: 100 })
    from_user_id: string;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "char", length: 20, default: 'text', comment: "数据类型" })
    content_type: string;

    @CreateDateColumn()
    created_time: Date;

    @Column({ type: "int", width: 1, default: 0 })
    accept_number: number;
}