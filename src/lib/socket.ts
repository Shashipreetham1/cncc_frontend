import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify'; // To show notifications
// import { useAuthStore } from '../store/authStore'; // Avoid using hooks in non-component files

let socket: Socket | null = null;

export const initializeSocket = (userId: string, userRole: 'ADMIN' | 'USER') => {
  if (socket) {
      console.log("Socket already initialized.");
      return;
  }

  const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3001';
  console.log(`Initializing Socket.IO connection to ${wsUrl} for user ${userId}`);

  // Get token - ideally passed, but can access store directly if careful
  // const token = useAuthStore.getState().token;

  socket = io(wsUrl, {
      // autoConnect: false, // Can manually connect later if needed
      // auth: { token } // Optional: Send token for backend socket auth if implemented
  });

   // --- Standard Connection Events ---
   socket.on('connect', () => {
        console.log(`Socket connected successfully: ${socket?.id}`);
         // Identify user to backend
        socket?.emit('identify-user', userId);
        // Join admin room if applicable
         if(userRole === 'ADMIN') {
             socket?.emit('join-admin-room', { role: 'ADMIN' }); // Send role info
         }
   });

   socket.on('disconnect', (reason) => {
       console.log(`Socket disconnected: ${reason}`);
        // Implement reconnection logic if needed
       if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
           // socket.connect(); // Or handle appropriately
       }
   });

    socket.on('connect_error', (error) => {
       console.error('Socket connection error:', error);
        // Show error toast
       toast.error(`Connection Error: ${error.message}`);
    });

    // --- Custom Application Events ---

    // Listener for admin notifications about new requests
    socket.on('new-edit-request', (data) => {
        console.log('Received new-edit-request:', data);
        // Show toast only if current user is admin? (Already targeted by room)
        toast.info(data.message || 'New edit request submitted!');
        // TODO: Update admin UI state (e.g., request count badge, list refresh)
    });

    // Listener for users regarding their request status updates
    socket.on('edit-request-update', (data) => { // Generic event name now, no ID needed
        console.log('Received edit-request-update:', data);
         // Frontend needs context to know if this update pertains to *its* specific open request
        // For now, just show the message generically
         const message = data.message || `Edit request status changed to ${data.status}.`;
         if (data.status === 'APPROVED') {
            toast.success(message);
         } else if (data.status === 'REJECTED') {
             toast.error(message);
         } else {
             toast.info(message);
         }
        // TODO: Update specific UI elements if possible (e.g., if user is viewing the relevant document)
    });


    // Example ack from joining admin room
    socket.on('joined-admin-room-ack', (data) => {
         if(data.success) {
             console.log("Successfully joined admin-room.");
         } else {
              console.warn("Failed to join admin-room:", data.message);
         }
    });

    // Connect manually if autoConnect was false
    // socket.connect();

};

export const disconnectSocket = () => {
  if (socket?.connected) {
    console.log("Disconnecting socket...");
    socket.disconnect();
  }
   socket = null; // Clear reference
};

// Optional: Function to explicitly emit events from frontend if needed
// export const emitSocketEvent = (eventName: string, data: any) => {
//    if (socket?.connected) {
//        socket.emit(eventName, data);
//    } else {
//        console.error('Cannot emit event: Socket not connected.');
//    }
// };