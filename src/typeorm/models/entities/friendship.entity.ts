import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Friendship {
    @Column({type: "varchar", length: 100})
    @PrimaryColumn()
    user_id: string;

    @Column({type: "varchar", length: 100})
    @PrimaryColumn()
    friend_user_id: string;
    
    @CreateDateColumn()
    add_time: Date;

    @Column({type: "int", width: 1, default: false, comment: '是否屏蔽删除',})
    is_shield: boolean;

    @Column({type: "boolean", width: 1, default: false, comment: '是否置顶'})
    top_if: boolean;
}