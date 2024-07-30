import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { Complaint } from "../entities/complaint.entity";

@Injectable()
export class ComplaintService {
    constructor(
        @Inject("COMPLAINT_REPOSITORY")
        private readonly complaintRepository: Repository<Complaint>
    ) {}

    /**
     * 生成一条投诉记录
     * @param complaintMes 
     */
    async createComplaint<T extends keyof Complaint>(complaintMes: Partial<Complaint>): Promise<Complaint["id"]> {
        let v = await this.complaintRepository.insert(complaintMes);
        return v.identifiers[0].id;
    }

}