// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Role } from '../types'; // Use Role from your types

let socket: Socket | null = null;
let currentUserId: string | null = null; // Track associated user

const WS_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3001';
if (!WS_URL) console.error("FATAL: VITE_WS_BASE_URL not set");

export const initializeSocket = (userId: string, userRole: Role): void => {
  // Prevent re-init for same user if connected
  if (socket?.connected && currentUserId === userId) {
    // console.log(`ℹ️ Socket already connected for user ${userId}.`);
    return;
  }
  if (socket) disconnectSocket(); // Clean up old socket if user changes

  console.log(`🚀 Initializing Socket for user ${userId} -> ${WS_URL}`);
  currentUserId = userId;

  socket = io(WS_URL, { query: { userId } });

  // Standard Listeners
  socket.on('connect', () => {
    if (!socket || currentUserId !== userId) return; // Stale connection check
    console.log(`✅ Socket connected: ${socket.id}, User: ${userId}`);
    socket.emit('identify-user', userId);
    if (userRole === 'ADMIN') socket.emit('join-admin-room');
    socket.emit('join-user-room', userId);
    toast.success("Real-time link active.", { toastId: 'socket-connect', updateId:'socket-disconnect' });
  });

  socket.on('disconnect', (reason) => {
    console.warn(`🔌 Socket disconnected: ${reason}`);
    if (reason !== 'io client disconnect') { // Avoid toast on manual logout disconnect
        toast.warn(`Real-time link lost: ${reason}`, { toastId: 'socket-disconnect', updateId:'socket-connect' });
    }
  });

  socket.on('connect_error', (error) => {
    console.error(`❌ Socket connection error: ${error.message}`);
    toast.error(`Cannot connect for real-time updates.`, { toastId: 'socket-connect-error' });
  });

  // --- Custom App Listeners ---
  socket.on('new-edit-request', (data: { message: string, editRequest?: any }) => {
      console.log('📬 [Socket] new-edit-request:', data);
      toast.info(`🔔 ${data.message || 'New edit request submitted!'}`);
      // TODO: Optionally trigger global state update for admin badge/list
  });

  socket.on('edit-request-update', (data: { message: string, requestId: string, status: 'APPROVED' | 'REJECTED', editRequest?: any }) => {
      console.log(`📝 [Socket] edit-request-update for ${data.requestId}:`, data);
      const baseMessage = data.message || `Edit request ${data.requestId} ${data.status.toLowerCase()}.`;
      if (data.status === 'APPROVED') toast.success(`✅ ${baseMessage}`);
      else if (data.status === 'REJECTED') toast.error(`❌ ${baseMessage}`);
      else toast.info(`ℹ️ ${baseMessage}`);
      // TODO: Optionally trigger UI update specific to this request ID if visible
  });

  socket.on('joined-admin-room-ack', (data: { success: boolean, message?: string }) => {
     if(data.success) console.log("👍 Admin room joined ack.");
     else console.warn(`👎 Failed ack join admin room: ${data.message || 'N/A'}`);
  });

};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log(`🛑 Disconnecting socket for user ${currentUserId}...`);
    socket.disconnect();
    socket.off(); // Remove all listeners
    socket = null;
    currentUserId = null;
  }
};

export const getSocket = (): Socket | null => socket; // Allow checking status