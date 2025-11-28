import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { createChatMessage, getCircleMessages } from '../db';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/api/socket.io'
  });

  // Store active connections
  const activeUsers = new Map<string, { userId: number; circleId: number }>();

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);

    // Join circle room
    socket.on('join_circle', async (data: { userId: number; circleId: number; userName: string }) => {
      const { userId, circleId, userName } = data;
      
      // Store user info
      activeUsers.set(socket.id, { userId, circleId });
      
      // Join room
      socket.join(`circle_${circleId}`);
      
      // Notify others
      socket.to(`circle_${circleId}`).emit('user_joined', {
        userId,
        userName,
        timestamp: Date.now()
      });
      
      // Send recent messages
      try {
        const messages = await getCircleMessages(circleId, 50);
        socket.emit('message_history', messages);
      } catch (error) {
        console.error('Error fetching message history:', error);
      }
      
      console.log(`User ${userId} joined circle ${circleId}`);
    });

    // Send message
    socket.on('send_message', async (data: {
      circleId: number;
      userId: number;
      content: string;
      userName: string;
      isEncrypted?: number;
    }) => {
      const { circleId, userId, content, userName, isEncrypted = 1 } = data;
      
      try {
        // Save to database
        await createChatMessage({
          circleId,
          userId,
          content,
          isEncrypted,
          metadata: JSON.stringify({ userName })
        });
        
        // Broadcast to circle
        const message = {
          circleId,
          userId,
          userName,
          content,
          timestamp: Date.now()
        };
        
        io.to(`circle_${circleId}`).emit('new_message', message);
        
        console.log(`Message sent in circle ${circleId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { circleId: number; userName: string; isTyping: boolean }) => {
      const { circleId, userName, isTyping } = data;
      socket.to(`circle_${circleId}`).emit('user_typing', { userName, isTyping });
    });

    // Leave circle
    socket.on('leave_circle', (data: { circleId: number; userId: number; userName: string }) => {
      const { circleId, userName } = data;
      
      socket.leave(`circle_${circleId}`);
      socket.to(`circle_${circleId}`).emit('user_left', {
        userName,
        timestamp: Date.now()
      });
      
      activeUsers.delete(socket.id);
      console.log(`User left circle ${circleId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userInfo = activeUsers.get(socket.id);
      if (userInfo) {
        const { circleId } = userInfo;
        socket.to(`circle_${circleId}`).emit('user_disconnected', {
          timestamp: Date.now()
        });
        activeUsers.delete(socket.id);
      }
      console.log('WebSocket client disconnected:', socket.id);
    });

    // Panic alert broadcast
    socket.on('panic_alert', (data: { userId: number; userName: string; location?: any }) => {
      // Broadcast to all connected users in user's circles
      io.emit('panic_alert_received', {
        userId: data.userId,
        userName: data.userName,
        location: data.location,
        timestamp: Date.now()
      });
      console.log(`Panic alert from user ${data.userId}`);
    });
  });

  console.log('WebSocket server initialized on /api/socket.io');
  return io;
}
