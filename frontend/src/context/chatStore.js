import { create } from 'zustand'
import { chatAPI, messageAPI } from '../services/api'

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
  typingUsers: {},     // { chatId: { userId: { username, timer } } }
  onlineUsers: new Set(),

  fetchChats: async () => {
    set({ loadingChats: true })
    try {
      const { data } = await chatAPI.getUserChats()
      set({ chats: data, loadingChats: false })
    } catch {
      set({ loadingChats: false })
    }
  },

  selectChat: async (chat) => {
    set({ selectedChat: chat, messages: [], loadingMessages: true })
    try {
      const { data } = await messageAPI.getMessages(chat.id)
      set({ messages: data, loadingMessages: false })
      await messageAPI.markAsRead(chat.id)
    } catch {
      set({ loadingMessages: false })
    }
  },

  deselectChat: () => set({ selectedChat: null, messages: [] }),

  accessOrCreateChat: async (userId) => {
    const { data } = await chatAPI.accessChat(userId)
    const { chats } = get()
    if (!chats.find(c => c.id === data.id)) {
      set({ chats: [data, ...chats] })
    }
    return data
  },

  addMessage: (message) => {
    const { messages, chats, selectedChat } = get()
    if (selectedChat && message.chatId === selectedChat.id) {
      set({ messages: [...messages, message] })
    }
    // Update latest message in chat list
    set({
      chats: chats.map(c =>
        c.id === message.chatId ? { ...c, latestMessage: message } : c
      )
    })
  },

  deleteMessage: (messageId) => {
    set({
      messages: get().messages.map(m =>
        m.id === messageId ? { ...m, deleted: true, content: 'This message was deleted' } : m
      )
    })
  },

  clearMessages: () => set({ messages: [] }),

  setTyping: (chatId, userId, username, isTyping) => {
    const { typingUsers } = get()
    const chatTyping = { ...(typingUsers[chatId] || {}) }
    if (isTyping) {
      // Clear any existing timer for this user
      if (chatTyping[userId]?.timer) clearTimeout(chatTyping[userId].timer)
      const timer = setTimeout(() => {
        get().setTyping(chatId, userId, username, false)
      }, 4000)
      chatTyping[userId] = { username, timer }
    } else {
      if (chatTyping[userId]?.timer) clearTimeout(chatTyping[userId].timer)
      delete chatTyping[userId]
    }
    set({ typingUsers: { ...typingUsers, [chatId]: chatTyping } })
  },

  setUserOnline: (userId) => {
    const { onlineUsers } = get()
    const updated = new Set(onlineUsers)
    updated.add(userId)
    set({ onlineUsers: updated })
  },

  setUserOffline: (userId) => {
    const { onlineUsers } = get()
    const updated = new Set(onlineUsers)
    updated.delete(userId)
    set({ onlineUsers: updated })
  },

  updateChatAfterClear: (chatId) => {
    const { chats, selectedChat } = get()
    set({
      chats: chats.map(c => c.id === chatId ? { ...c, latestMessage: null } : c),
      messages: selectedChat?.id === chatId ? [] : get().messages,
    })
  },

  updateChatList: (updatedChat) => {
    const { chats } = get()
    const exists = chats.find(c => c.id === updatedChat.id)
    if (exists) {
      set({ chats: chats.map(c => c.id === updatedChat.id ? updatedChat : c) })
    } else {
      set({ chats: [updatedChat, ...chats] })
    }
  },

  removeChat: (chatId) => {
    const { chats, selectedChat } = get()
    set({
      chats: chats.filter(c => c.id !== chatId),
      selectedChat: selectedChat?.id === chatId ? null : selectedChat,
    })
  },
}))
