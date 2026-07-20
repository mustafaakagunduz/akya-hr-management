import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { UserRole } from '../common/enums';
import { LeaveRequest } from './leave-request.entity';

const MANAGERS_ROOM = 'managers';

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class LeavesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(LeavesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.usersService.findById(payload.id);
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      client.join(userRoom(user.id));
      if (user.role === UserRole.MANAGER) {
        client.join(MANAGERS_ROOM);
      }
    } catch (err) {
      this.logger.warn(`WebSocket bağlantısı reddedildi: ${err}`);
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // socket.io odalardan kendiliğinden temizler, ek işlem gerekmiyor.
  }

  notifyManagersOfNewRequest(leaveRequest: LeaveRequest) {
    this.server.to(MANAGERS_ROOM).emit('leave.created', leaveRequest);
  }

  notifyUserOfDecision(userId: string, leaveRequest: LeaveRequest) {
    this.server.to(userRoom(userId)).emit('leave.updated', leaveRequest);
  }
}
