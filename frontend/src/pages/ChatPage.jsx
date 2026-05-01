import { useEffect, useRef } from 'react'
import { useChatStore } from '../context/chatStore'
import { useAuthStore } from '../context/authStore'
import { wsService } from '../services/websocket'
import Sidebar from '../components/chat/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import WelcomeScreen from '../components/chat/WelcomeScreen'

export default function ChatPage() {
  const { user } = useAuthStore()
  const { selectedChat, addMessage, deleteMessage, updateChatList, setTyping, setUserOnline, setUserOffline, fetchChats } = useChatStore()
  const subscribedChats = useRef(new Set())
  const presenceUnsub = useRef(null)

  useEffect(() => {
    fetchChats()
  }, [])

  // Subscribe to presence events
  useEffect(() => {
    const subscribe = () => {
      presenceUnsub.current = wsService.subscribeToPresence((msg) => {
        if (msg.type === 'USER_ONLINE') setUserOnline(msg.payload.userId)
        else if (msg.type === 'USER_OFFLINE') setUserOffline(msg.payload.userId)
      })
    }
    if (wsService.isConnected()) subscribe()
    else wsService.onConnect(subscribe)

    return () => {
      if (presenceUnsub.current) presenceUnsub.current()
    }
  }, [])

  // Subscribe to selected chat messages
  useEffect(() => {
    if (!selectedChat) return
    const chatId = selectedChat.id
    if (subscribedChats.current.has(chatId)) return
    subscribedChats.current.add(chatId)

    const subscribe = () => {
      wsService.subscribeToChat(chatId, (msg) => {
        if (msg.type === 'NEW_MESSAGE') addMessage(msg.payload)
        else if (msg.type === 'MESSAGE_DELETED') deleteMessage(msg.payload.messageId)
      })
      wsService.subscribeToTyping(chatId, (event) => {
        if (event.userId !== user?.id) {
          setTyping(chatId, event.userId, event.username, event.typing)
        }
      })
    }

    if (wsService.isConnected()) subscribe()
    else wsService.onConnect(subscribe)
  }, [selectedChat])

  return (
    <div className="flex h-screen bg-nex-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {selectedChat ? <ChatWindow /> : <WelcomeScreen />}
      </div>
    </div>
  )
}
