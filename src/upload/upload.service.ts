import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import * as OSSClient from 'ali-oss';
import * as dayjs from 'dayjs';
import _config, {staticDirPath}  from "../common/config/config";
import {join, dirname} from "path"
import { createWriteStream, WriteStream } from "fs";

@Injectable()
export class UploadService {
    private storeOss;
    constructor() {
        const {endpoint, accessKeyId, accessKeySecret, bucketName} = _config['oss'];
        this.storeOss = new OSSClient({
            endpoint,
            accessKeyId,
            accessKeySecret,
            bucket: bucketName
        })
    }

    async getUrl(file) {
        const staticFilePath: string = await this.saveFile(file);
        return {
            fileUrl: staticFilePath,
            fileType: file.mimetype
        }
    }
    
    async saveFile(file): Promise<string> {
        const datetime: number = Date.now();
        const fileName: string = datetime+file.originalname;
        const fileBuffer: Buffer = file.buffer;
        const filePath: string = join(__dirname,'../../public/','static',fileName);
        const staticFilePath: string = staticDirPath + fileName;
        const writeFile: WriteStream = createWriteStream(filePath);
        return await new Promise((resolve,reject)=> {
            writeFile.write(fileBuffer,(error: Error) => {
                if(error) {
                    throw new HttpException('文件上传失败',HttpStatus.FORBIDDEN);
                } 
                resolve(staticFilePath);
            });
        })        
    }


    /**
     * 获取上传oss签名
     */
    async getSingature(fileType: string): Promise<any> {
        const {endpoint, accessKeyId, accessKeySecret, bucketName} = _config['oss'];
        const date = new Date();
        // 时长加 1 天，作为签名的有限期
        date.setDate(date.getDate() + 1);
    
        //上传目录
        const format = dayjs().format('YYYY-MM-DD');
        const dir = fileType + '/' + format

        const policy = {
          // 设置签名的有效期，格式为Unix时间戳
          expiration: date.toISOString(),
          conditions: [
            ['content-length-range', 0, 1024 * 1024 * 100], // 设置上传文件的大小限制
          ],
        };
    
        // 生成签名，策略等信息
        const formData = await this.storeOss.calculatePostSignature(policy);
    
        const host = `http://${bucketName}.${endpoint}`;
        // 响应给客户端的签名和策略等信息
        return {
          expire: dayjs().add(1, 'days').unix().toString(),
          policy: formData.policy,
          signature: formData.Signature,
          accessId: formData.OSSAccessKeyId,
          host,
          dir
        };
      }
}