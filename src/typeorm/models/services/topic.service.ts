import { Injectable, Inject } from "@nestjs/common";
import { Repository, getRepository } from "typeorm";
import { Topic } from "../entities/topic.entity";
import { from } from "rxjs";
import * as dayjs from 'dayjs';

@Injectable()
export class _TopicService {
    constructor(
        @Inject("TOPIC_REPOSITORY")
        private readonly topicRepository: Repository<Topic>
    ) {}

    /**
     * 添加消息
     * @param topicMes 
     */
    async createTopic<T extends keyof Topic>(topicMes: Partial<Topic>): Promise<Topic["id"]> {
        let v = await this.topicRepository.insert(topicMes);
        return v.identifiers[0].id;
    }

    /**
     * 查找消息
     * @param option 
     */
    async findTopicByOption<T>(option: T): Promise<Topic> {
        return await this.topicRepository.findOne(option);
    }

    /**
     * 更新消息
     * @param option 
     * @param updateContent
     */
    async updateTopicByOption<T,N>(option: T, updateContent: N) {
        return await this.topicRepository.update(option, updateContent);
    }

    
    /**
     * 为搜索一条消息建个专门的查询 
     */
    async searchTopic(userIds: Array<string>) {
        const end = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const start = dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss');
        
        console.log('start end ===', start, end)

        const topic = await getRepository(Topic)
            .createQueryBuilder('topic')
            .where('topic.from_user_id NOT IN (:userIds)', { userIds })
            .andWhere('topic.created_time BETWEEN :start AND :end', {start, end})
            .andWhere('topic.accept_number < 3')
            .orderBy('topic.created_time', 'DESC')
            .getOne();

        return topic;
    }
}