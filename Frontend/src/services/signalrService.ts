import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
  } from "@microsoft/signalr";
  
  class SignalRService {
    private connection:
      HubConnection | null = null;
  
    // =========================
    // Start Connection
    // =========================
  
    public async startConnection() {
      try {
        // Prevent Duplicate Connection
  
        if (
          this.connection &&
          (
            this.connection.state ===
              HubConnectionState
                .Connected
            ||
            this.connection.state ===
              HubConnectionState
                .Connecting
          )
        ) {
          return;
        }
  
        // Create Connection
  
        this.connection =
          new HubConnectionBuilder()
            .withUrl(
              "http://localhost:5108/hubs/notifications",
              {
                withCredentials:
                  true,
              }
            )
            .withAutomaticReconnect()
            .configureLogging(
              LogLevel.Information
            )
            .build();
  
        // Reconnecting
  
        this.connection.onreconnecting(
          () => {
            console.log(
              "SignalR reconnecting..."
            );
          }
        );
  
        // Reconnected
  
        this.connection.onreconnected(
          () => {
            console.log(
              "SignalR reconnected"
            );
          }
        );
  
        // Closed
  
        this.connection.onclose(
          () => {
            console.log(
              "SignalR disconnected"
            );
          }
        );
  
        // Start
  
        await this.connection.start();
  
        console.log(
          "SignalR connected"
        );
      } catch (error) {
        console.error(
          "SignalR connection error",
          error
        );
      }
    }
  
    // =========================
    // Receive Notification
    // =========================
  
    onReceiveNotification(
      callback: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notification: any
      ) => void
    ) {
    
      // Remove Old Listener
    
      this.connection.off(
        "ReceiveNotification"
      );
    
      // Register New Listener
    
      this.connection.on(
        "ReceiveNotification",
        (
          notification
        ) => {
    
          console.log(
            "Realtime notification received",
            notification
          );
    
          callback(
            notification
          );
        }
      );
    }
  
    // =========================
    // Stop Connection
    // =========================
  
    public async stopConnection() {
      try {
        if (this.connection) {
          await this.connection.stop();
  
          this.connection =
            null;
  
          console.log(
            "SignalR stopped"
          );
        }
      } catch (error) {
        console.error(
          "SignalR stop error",
          error
        );
      }
    }
  }
  
  export default new SignalRService();