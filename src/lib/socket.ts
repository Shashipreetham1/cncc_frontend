import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

let socket: Socket | null = null;

const WS_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3001';

/**
 * Initializes the Socket.IO connection and sets up listeners.
 * Should be called after user logs in.
 * @param userId - The ID of the currently authenticated user.
 * @param userRole - The role ('ADMIN' | 'USER') of the user.
 */
export const initializeSocket = (userId: string, userRole: 'ADMIN' | 'USER'): void => {
  // Prevent multiple connections
  if (socket?.connected) {
    console.log(`ℹ️ Socket already connected for user ${userId}.`);
    return;
  }
  if (socket) { // If socket exists but isn't connected, attempt cleanup before reconnecting
      disconnectSocket();
  }


  console.log(`🚀 Initializing Socket.IO connection to ${WS_URL} for user ${userId}`);

  // Create socket instance - consider adding auth token if backend verifies it
  // const token = useAuthStore.getState().token; // Get token if needed for auth
  socket = io(WS_URL, {
    // reconnectionAttempts: 5, // Example: Limit reconnection attempts
    // reconnectionDelay: 3000, // Example: Delay between retries
    // auth: { token } // If backend socket middleware verifies JWT
    query: { userId } // Optionally send userId in query if helpful for backend connection logic
  });

  // --- Standard Connection Events ---
  socket.on('connect', () => {
    if (!socket) return; // Type guard
    console.log(`✅ Socket connected: ${socket.id} - User: ${userId}`);
    // 1. Identify this socket connection with the backend user ID
    socket.emit('identify-user', userId);
    // 2. If user is admin, join the admin notification room
    if (userRole === 'ADMIN') {
      socket.emit('join-admin-room'); // Relying on backend to check role implicitly, or send role here too
      console.log(`   -> Attempting to join admin-room`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${reason}`);
    if (reason === 'io server disconnect') {
        console.warn("   Server forced disconnect.");
        // Consider attempting manual reconnection if needed for your app logic
        // socket?.connect();
    }
    // If disconnected for other reasons, the client will attempt to reconnect automatically by default.
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
    toast.error(`Cannot connect to real-time server: ${error.message}`, { toastId: 'socket-connect-error' }); // Use toastId to prevent duplicates
  });

  // --- Custom Application Event Listeners ---

  // Listener for Admins receiving new edit request notifications
  socket.on('new-edit-request', (data: { message: string, editRequest?: any }) => {
    console.log('📬 Received new-edit-request:', data);
    // TODO: Integrate with Zustand or context to show badge/update admin list
    toast.info(`🔔 ${data.message || 'New edit request submitted!'}`);
  });

  // Listener for Users receiving updates on *their* submitted edit requests
  // Relies on backend emitting to the user-specific room ('user-{userId}')
  socket.on('edit-request-update', (data: { message: string, requestId: string, status: 'APPROVED' | 'REJECTED', editRequest?: any }) => {
    console.log(`📝 Received edit-request-update (for request ${data.requestId}):`, data);
    // TODO: Update UI state specific to the document/request ID if applicable
    const baseMessage = data.message || `Your edit request ${data.requestId} was ${data.status.toLowerCase()}.`;
    if (data.status === 'APPROVED') {
      toast.success(`✅ ${baseMessage}`);
    } else if (data.status === 'REJECTED') {
      toast.error(`❌ ${baseMessage}`);
    } else {
      toast.info(`ℹ️ ${baseMessage}`); // Handle other statuses if added
    }
  });

  // Listener for acknowledgement after trying to join admin room
  socket.on('joined-admin-room-ack', (data: { success: boolean, message?: string }) => {
      if(data.success) {
          console.log("   👍 Successfully joined admin-room confirmed by server.");
      } else {
           console.warn(`   👎 Failed to join admin-room: ${data.message || 'Reason unknown.'}`);
           toast.warn("Could not join admin notification channel.");
      }
  });

  // Add listeners for other custom events from your backend here...

};

/**
 * Disconnects the Socket.IO connection if it exists.
 */
export const disconnectSocket = (): void => {
  if (socket?.connected) {
    console.log("🛑 Disconnecting socket...");
    socket.disconnect();
  }
  // Clear the reference after explicitly disconnecting or if it wasn't connected
  socket = null;
};

/**
 * Retrieves the current socket instance (read-only access).
 * Useful for components needing to check connection status.
 * NOTE: Avoid directly emitting from components if possible; centralize emits in services/hooks.
 */
export const getSocket = (): Socket | null => {
  return socket;
};