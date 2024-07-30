import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket, WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket, Server} from "socket.io"

import {UserService} from "../typeorm/models/services/user.service";
import {SocketService} from "../typeorm/models/services/socket.service";
import {ChatingMessageService} from "../chating_message/chating_message.service";
import {FriendsService} from  "../friends/friends.service";
import { UseFilters, Catch, Inject, forwardRef } from '@nestjs/common';
import { CustomWsExceptionFilter } from '../common/excption/customExceptionFilter';
import { WebsocketService } from './websocket.service';
import { CustomWsException } from '../common/excption/customException';

@WebSocketGateway({namespace: 'websocket', cors: {
    origin: '*',
    transports: ['websocket']
}})
export class EventsGateway {
    @WebSocketServer() server: Server;

    constructor(
        private readonly socketService: SocketService,
        private readonly chatingMessageService: ChatingMessageService,
        private readonly friendsService: FriendsService,
        @Inject(forwardRef(() => WebsocketService))
        private readonly websocketService: WebsocketService
    ) {}

    /**
     * 发送消息
     * @param socket 
     * @param mes 
     */
    @UseFilters(new CustomWsExceptionFilter())
    @SubscribeMessage('message')
    async sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg: any) {
        const msgBody = JSON.parse(msg);
        return await this.chatingMessageService.sendMessage(msgBody, socket);
    }

    /**
     * 添加好友
     * @param socket 
     * @param mes 
     */
    @UseFilters(new CustomWsExceptionFilter())
    @SubscribeMessage('addFriend')
    async addFriend(@ConnectedSocket() socket: Socket, @MessageBody() msg:any) {
        const msgBody = JSON.parse(msg);
        return await this.friendsService.addFriend(socket, msgBody);
    }

    /**
     * 认可/关注好友
     * @param socket 
     * @param mes 
     */
    @UseFilters(new CustomWsExceptionFilter())
    @SubscribeMessage('acceptFriend')
    async acceptFriend(@ConnectedSocket() socket: Socket,@MessageBody() msg: any) {
        const msgBody = JSON.parse(msg);
        return await this.friendsService.acceptFriend(socket, msgBody);
    }

    /**
     * 加入指定房间（聊天室）
     * @param socket 
     * @param roomName 
     */
    @UseFilters(new CustomWsExceptionFilter())
    @SubscribeMessage('joinChatingRoom')
    async joinChatingRoom(@ConnectedSocket() socket: Socket,@MessageBody() msgBody: any) {
        const {roomName} = JSON.parse(msgBody);
        
        return await this.websocketService.joinChatingRoom(socket,roomName);
    }

    /**
     * 当有新的连接建立时调用该函数，已登录用户更新自身的socketId并加入所有群聊
     * 返回默认群组的基本信息
     * @param socket 
     */
    @UseFilters(new CustomWsExceptionFilter())
    async handleConnection(socket: Socket) {
        const query = socket.handshake.query;
        const socketId = socket.id;
        const clientIp = socket.handshake.address;
        
        if(query.userId) {
            const userId = query.userId.toString();
            await this.websocketService.updateSocketMes(socketId,clientIp,userId);
            await this.websocketService.userJoinRooms(socket,userId);
        }
    }

    /**
     * 断开链接
     */
    async handleDisconnect(socket: Socket) {
        const socketId = socket.id;
        const userId = socket.handshake.query.userId.toString();
        
        await this.websocketService.userOffline(socketId, userId)
    }

    /**
     * 游客加入默认房间
     * @param socket 
     */
    @UseFilters(new CustomWsExceptionFilter())
    @SubscribeMessage('guest')
    async guestJoinRoom(@ConnectedSocket() socket: Socket) {
        return this.websocketService.guestJoinRoom(socket);
    }

    /**
     * 获取连接同一房间的列表与人数
     * @param roomName 
     */
    @UseFilters(new CustomWsExceptionFilter())
    async getClientsInChatingRoom(roomName: string) {
        console.log(this.server);
        return await new Promise((resolve,reject) => {
            // this.server.in(roomName).clients((error,clients) => {
            //     if(error) throw new CustomWsException("gerClientsException",error);
            //     console.log(clients);
            //     resolve({
            //         clients,
            //         clientsNum: clients.length
            //     });
            // })
            resolve({})
        })
    }

}