import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

class WebSocketService {
  constructor() {
    this.client = null
    this.subscriptions = new Map()
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnect = 5
    this.onConnectCallbacks = []
    this.onDisconnectCallbacks = []
  }

  connect(token) {
    if (this.client && this.connected) return

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: () => {},
      reconnectDelay: 3000,
      onConnect: () => {
        this.connected = true
        this.reconnectAttempts = 0
        this.onConnectCallbacks.forEach(cb => cb())
        // Notify server user is online
        this.send('/app/online', {})
      },
      onDisconnect: () => {
        this.connected = false
        this.onDisconnectCallbacks.forEach(cb => cb())
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
      }
    })

    this.client.activate()
  }

  disconnect() {
    if (this.client) {
      this.send('/app/offline', {})
      this.subscriptions.forEach(sub => sub.unsubscribe())
      this.subscriptions.clear()
      this.client.deactivate()
      this.connected = false
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      // Queue subscription for after connect
      this.onConnect(() => this._doSubscribe(destination, callback))
      return () => {}
    }
    return this._doSubscribe(destination, callback)
  }

  _doSubscribe(destination, callback) {
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe()
    }
    const sub = this.client.subscribe(destination, (message) => {
      try {
        const parsed = JSON.parse(message.body)
        callback(parsed)
      } catch (e) {
        callback(message.body)
      }
    })
    this.subscriptions.set(destination, sub)
    return () => {
      sub.unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  unsubscribe(destination) {
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  send(destination, body) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      })
    }
  }

  sendTyping(chatId, userId, username, isTyping) {
    this.send('/app/typing', { chatId, userId, username, typing: isTyping })
  }

  onConnect(callback) {
    if (this.connected) {
      callback()
    } else {
      this.onConnectCallbacks.push(callback)
    }
  }

  onDisconnect(callback) {
    this.onDisconnectCallbacks.push(callback)
  }

  subscribeToChat(chatId, onMessage) {
    return this.subscribe(`/topic/chat/${chatId}`, onMessage)
  }

  subscribeToTyping(chatId, onTyping) {
    return this.subscribe(`/topic/chat/${chatId}/typing`, onTyping)
  }

  subscribeToPresence(onPresence) {
    return this.subscribe('/topic/presence', onPresence)
  }

  isConnected() {
    return this.connected
  }
}

export const wsService = new WebSocketService()
export default wsService
