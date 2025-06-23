// /**
//  * @file Network Status Monitoring Service
//  * @description Provides network connectivity monitoring and event handling
//  * @module utils/network-status
//  */

// import NetInfo, {
//   type NetInfoState,
//   type NetInfoSubscription,
// } from "@react-native-community/netinfo";

// /**
//  * Interface for network status listeners
//  */
// export interface NetworkStatusListener {
//   onOffline: () => void;
//   onOnline: () => void;
// }

// /**
//  * Network request queue item interface
//  */
// export interface QueuedRequest {
//   id: string;
//   execute: () => Promise<any>;
//   timestamp: number;
//   retryCount: number;
//   maxRetries: number;
// }

// /**
//  * @class NetworkStatusService
//  * @description Monitors network connectivity and manages offline/online transitions
//  */
// class NetworkStatusService {
//   private isConnected = true;
//   private listeners: NetworkStatusListener[] = [];
//   private unsubscribe: NetInfoSubscription | null = null;
//   private requestQueue: QueuedRequest[] = [];
//   private isProcessingQueue = false;
//   private lastOnlineTime: number | null = null;
//   private lastOfflineTime: number | null = null;

//   /**
//    * Initialize network monitoring
//    */
//   public initialize(): void {
//     // Start monitoring network status
//     this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);

//     // Get initial state
//     NetInfo.fetch().then(this.handleNetworkChange);

//     // TODO: Remove detailed logging before production
//     console.log("🌐 NETWORK: Monitoring initialized");
//   }

//   /**
//    * Clean up network monitoring
//    */
//   public cleanup(): void {
//     if (this.unsubscribe) {
//       this.unsubscribe();
//       this.unsubscribe = null;
//     }
//     this.listeners = [];

//     // TODO: Remove detailed logging before production
//     console.log("🌐 NETWORK: Monitoring stopped");
//   }

//   /**
//    * Add network status listener
//    * @param listener - Object with onOffline and onOnline callbacks
//    */
//   public addListener(listener: NetworkStatusListener): void {
//     this.listeners.push(listener);

//     // Immediately notify of current status
//     if (!this.isConnected) {
//       listener.onOffline();
//     }
//   }

//   /**
//    * Remove network status listener
//    * @param listener - Previously registered listener
//    */
//   public removeListener(listener: NetworkStatusListener): void {
//     this.listeners = this.listeners.filter((l) => l !== listener);
//   }

//   /**
//    * Check if device is currently online
//    * @returns Current connection status
//    */
//   public isOnline(): boolean {
//     return this.isConnected;
//   }

//   /**
//    * Get time since last online state
//    * @returns Milliseconds since last online state or null if unknown
//    */
//   public getTimeSinceLastOnline(): number | null {
//     if (!this.lastOnlineTime) return null;
//     return Date.now() - this.lastOnlineTime;
//   }

//   /**
//    * Get time since last offline state
//    * @returns Milliseconds since last offline state or null if unknown
//    */
//   public getTimeSinceLastOffline(): number | null {
//     if (!this.lastOfflineTime) return null;
//     return Date.now() - this.lastOfflineTime;
//   }

//   /**
//    * Add request to queue for execution when online
//    * @param request - Request to be executed when online
//    */
//   public queueRequest(
//     request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">
//   ): string {
//     const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const queuedRequest: QueuedRequest = {
//       ...request,
//       id,
//       timestamp: Date.now(),
//       retryCount: 0,
//     };

//     this.requestQueue.push(queuedRequest);

//     // TODO: Remove detailed logging before production
//     console.log(
//       `🌐 NETWORK: Request queued (${id}), queue size: ${this.requestQueue.length}`
//     );

//     // If we're online, try processing the queue immediately
//     if (this.isConnected && !this.isProcessingQueue) {
//       this.processQueue();
//     }

//     return id;
//   }

//   /**
//    * Remove request from queue
//    * @param id - ID of request to remove
//    */
//   public removeQueuedRequest(id: string): boolean {
//     const initialLength = this.requestQueue.length;
//     this.requestQueue = this.requestQueue.filter((req) => req.id !== id);
//     return initialLength !== this.requestQueue.length;
//   }

//   /**
//    * Get current queue size
//    * @returns Number of queued requests
//    */
//   public getQueueSize(): number {
//     return this.requestQueue.length;
//   }

//   /**
//    * Handle network state changes
//    * @private
//    * @param state - Network state from NetInfo
//    */
//   private handleNetworkChange = (state: NetInfoState): void => {
//     const wasConnected = this.isConnected;
//     this.isConnected = !!state.isConnected;

//     // Update timestamps
//     if (this.isConnected) {
//       this.lastOnlineTime = Date.now();

//       // TODO: Remove detailed logging before production
//       console.log("🌐 NETWORK: Connection restored");

//       if (!wasConnected) {
//         // We just came online
//         this.notifyListeners("online");
//         this.processQueue();
//       }
//     } else {
//       this.lastOfflineTime = Date.now();

//       // TODO: Remove detailed logging before production
//       console.log("🌐 NETWORK: Connection lost");

//       if (wasConnected) {
//         // We just went offline
//         this.notifyListeners("offline");
//       }
//     }
//   };

//   /**
//    * Notify all listeners of network status change
//    * @private
//    * @param event - Event type ('online' or 'offline')
//    */
//   private notifyListeners(event: "online" | "offline"): void {
//     this.listeners.forEach((listener) => {
//       try {
//         if (event === "online") {
//           listener.onOnline();
//         } else {
//           listener.onOffline();
//         }
//       } catch (error) {
//         // TODO: Remove detailed logging before production
//         console.error(
//           `🌐 NETWORK: Error notifying listener of ${event} event:`,
//           error
//         );
//       }
//     });
//   }

//   /**
//    * Process queued requests when online
//    * @private
//    */
//   private async processQueue(): Promise<void> {
//     if (
//       !this.isConnected ||
//       this.isProcessingQueue ||
//       this.requestQueue.length === 0
//     ) {
//       return;
//     }

//     this.isProcessingQueue = true;

//     // TODO: Remove detailed logging before production
//     console.log(
//       `🌐 NETWORK: Processing queue (${this.requestQueue.length} items)`
//     );

//     // Process oldest requests first
//     const sortedQueue = [...this.requestQueue].sort(
//       (a, b) => a.timestamp - b.timestamp
//     );

//     for (const request of sortedQueue) {
//       // Skip if we've gone offline during processing
//       if (!this.isConnected) {
//         break;
//       }

//       try {
//         // TODO: Remove detailed logging before production
//         console.log(`🌐 NETWORK: Executing queued request (${request.id})`);

//         await request.execute();

//         // Remove successful request from queue
//         this.removeQueuedRequest(request.id);

//         // TODO: Remove detailed logging before production
//         console.log(
//           `🌐 NETWORK: Request completed successfully (${request.id})`
//         );
//       } catch (error) {
//         // TODO: Remove detailed logging before production
//         console.error(
//           `🌐 NETWORK: Error executing queued request (${request.id}):`,
//           error
//         );

//         request.retryCount++;

//         if (request.retryCount >= request.maxRetries) {
//           // TODO: Remove detailed logging before production
//           console.log(
//             `🌐 NETWORK: Max retries reached for request (${request.id}), removing from queue`
//           );
//           this.removeQueuedRequest(request.id);
//         }
//       }
//     }

//     this.isProcessingQueue = false;

//     // TODO: Remove detailed logging before production
//     console.log(
//       `🌐 NETWORK: Queue processing complete, ${this.requestQueue.length} items remaining`
//     );
//   }
// }

// export const networkStatus = new NetworkStatusService();