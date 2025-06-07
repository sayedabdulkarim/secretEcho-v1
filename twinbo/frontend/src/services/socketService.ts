import { io, Socket } from "socket.io-client";
import { SocketMessage } from "../types/chat";
import { API_CONFIG } from "../config/apiConfig";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(API_CONFIG.socketUrl, {
      auth: {
        token: token,
      },
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userId: string) {
    if (this.socket) {
      this.socket.emit("join", userId);
    }
  }

  sendMessage(message: { recipientId: string; text: string }) {
    if (this.socket) {
      this.socket.emit("sendMessage", message);
    }
  }

  onMessage(callback: (message: SocketMessage) => void) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  onUserOnline(callback: (data: { userId: string; username: string }) => void) {
    if (this.socket) {
      this.socket.on("userOnline", callback);
    }
  }

  onUserOffline(
    callback: (data: { userId: string; username: string }) => void
  ) {
    if (this.socket) {
      this.socket.on("userOffline", callback);
    }
  }

  onOnlineUsers(
    callback: (users: Array<{ userId: string; username: string }>) => void
  ) {
    if (this.socket) {
      this.socket.on("onlineUsers", callback);
    }
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on("typing", callback);
    }
  }

  emitTyping(recipientId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit("typing", { recipientId, isTyping });
    }
  }

  // Add method to remove typing listeners when component unmounts
  removeTypingListeners() {
    if (this.socket) {
      this.socket.off("typing");
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
