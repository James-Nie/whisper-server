import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { LoginInterceptor } from '../common/interceptor/login.interceptor';

@Controller('file')
@UseInterceptors(LoginInterceptor)
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
      return await this.uploadService.getUrl(file);
    }

    @Post('signature')
    async signature(@Body('fileType') fileType) {
      return await this.uploadService.getSingature(fileType)
    }

}