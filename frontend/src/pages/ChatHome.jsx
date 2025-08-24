import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "../lib/utils";
import { useIsMobile } from "../hooks/use-mobile";
import { SidebarTrigger } from "../components/ui/sidebar";
import { useTheme } from "../components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useNotification } from "../hooks/useNotification";
import { useSelector } from "react-redux";
import { usegetRooms, useGetMessagesInfinite } from "../utils/queries";
import { useWebSocket } from "../hooks/useWebSocket";
import { useQueryClient } from "@tanstack/react-query";

function ChatHome() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";
  const userId = useSelector((state) => state.auth?.user?._id);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // Input field state
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const [typingUsers, setTypingUsers] = useState(new Map()); // Track typing users per room
  const isMobile = useIsMobile();
  const { notify } = useNotification();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevSelectedChatRef = useRef(null);
  const queryClient = useQueryClient();

  // // Debug effect to track online users
  // useEffect(() => {
  //   console.log("Online users updated:", Array.from(onlineUsers));
  // }, [onlineUsers]);

  // Stable WebSocket message handler with useCallback and proper dependencies
  const handleWebSocketMessage = useCallback((data) => {
    console.log("Received WebSocket message:", data);

    switch (data.type) {
      case "message":
        // Always refresh the rooms list to update last message and timestamps
        queryClient.invalidateQueries({ queryKey: ["getRooms"] });
        
        if (data.roomId === selectedChat) {
          const newMsg = {
            id: data.messageId,
            text: data.content,
            sender: data.senderId === userId ? "me" : "other",
            time: new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }),
            timeStr: data.timestamp,
            profileImage: data.sender?.profileImage?.image,
            optimistic: false,
            pending: false,
            delivered: true,
            failed: false,
            showDeliveryStatus: data.senderId === userId // Only show for our own messages in real-time
          };

          setMessages(prev => {
            // If this is our message, try to replace the optimistic version
            if (newMsg.sender === "me") {
              const optimisticIndex = prev.findIndex(msg => 
                msg.optimistic && 
                msg.text === newMsg.text && 
                msg.sender === "me" &&
                Math.abs(new Date(msg.timeStr).getTime() - new Date(newMsg.timeStr).getTime()) < 10000 // within 10 seconds
              );
              
              if (optimisticIndex !== -1) {
                const updated = [...prev];
                // Replace optimistic message with real one, keeping showDeliveryStatus: true
                updated[optimisticIndex] = { 
                  ...newMsg, 
                  pending: false,
                  delivered: true,
                  showDeliveryStatus: true 
                };
                console.log("Replaced optimistic message with real message, delivered=true");
                return updated;
              }
            }
            
            // Check if message already exists to avoid duplicates
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev;
            }
            
            // Add new message from others or if no optimistic message found
            return [...prev, newMsg];
          });
        } else {
          notify(`New message from ${data.sender?.username || "Unknown"}`, "info");
        }
        break;

      case "typing":
        // Handle typing indicators
        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (data.content) { // is typing
            updated.set(data.roomId, { userId: data.userId, isTyping: true });
          } else { // stopped typing
            updated.delete(data.roomId);
          }
          return updated;
        });
        break;

      case "friendOnline":
        console.log("Friend came online:", data.userId, data.user?.username);
        setOnlineUsers(prev => new Set([...prev, data.userId]));
        notify(`${data.user?.username || "Someone"} is online`, "info");
        break;

      case "friendOffline":
        console.log("Friend went offline:", data.userId);
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
        notify(`Someone went offline`, "info");
        break;

      case "registered":
        console.log("Successfully registered to WebSocket");
        break;

      // case "initialOnlineStatus":
      //   // Handle bulk online status update when connecting
      //   if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
      //     setOnlineUsers(new Set(data.onlineUsers));
      //     console.log("Received initial online status for users:", data.onlineUsers);
      //   }
      //   break;

      case "joinedRoom":
        console.log(`Joined room ${data.roomId} successfully`);
        break;

      case "offlineMessages":
        console.log(`Received ${data.count} offline messages`);
        // Handle offline messages if needed
        break;

      case "error":
        notify(data.message || "WebSocket error occurred", "error");
        break;

      default:
        console.log("Unknown WebSocket message type:", data);
    }
  }, [selectedChat, userId, notify, queryClient]); // Added queryClient to dependencies


  const {
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendChatMessage,
  } = useWebSocket(handleWebSocketMessage);

  const { data, error, isError } = usegetRooms();
  useEffect(() => {
    if (isError) {
      notify("Error fetching chat rooms", "error");
    }
  }, [isError, notify]);

  const {
    data: messageData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading,
  } = useGetMessagesInfinite(selectedChat, !!selectedChat);

  // Optimized room join/leave logic
  useEffect(() => {
    if (!selectedChat || !isConnected) return;

    // Leave previous room if different
    if (prevSelectedChatRef.current && prevSelectedChatRef.current !== selectedChat) {
      leaveRoom(prevSelectedChatRef.current);
    }

    // Join new room
   joinRoom(selectedChat); 
    // Mark messages as read after a short delay
    const markReadTimer = setTimeout(() => {
      // Also update local unread count
      queryClient.setQueryData(["getRooms"], (oldData) => {
        if (!oldData?.rooms) return oldData;
        return {
          ...oldData,
          rooms: oldData.rooms.map(room => 
            room._id === selectedChat 
              ? { ...room, unreadCount: 0 }
              : room
          )
        };
      });
    }, 500);
    
    // Update ref
    prevSelectedChatRef.current = selectedChat;

    return () => {
      clearTimeout(markReadTimer);
    };
  }, [selectedChat, isConnected, joinRoom, leaveRoom, queryClient]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Process messages from API - these should NOT show delivery status
  useEffect(() => {
    if (!messageData) return;

    const allMessages = messageData.pages
      .flatMap((page) => page.messages)
      .map((msg) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.senderId._id === userId ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeStr: msg.createdAt,
        profileImage: msg.senderId.profileImage?.image,
        // For messages loaded from database - NO delivery status shown
        optimistic: false,
        pending: false,
        delivered: false, // Don't mark as delivered to avoid showing tick
        failed: false,
        showDeliveryStatus: false // Critical: Never show delivery status for database messages
      }))
      .sort((a, b) => new Date(a.timeStr) - new Date(b.timeStr));

    console.log("Loading messages from API:", allMessages.length, "messages with showDeliveryStatus:", allMessages.filter(m => m.showDeliveryStatus).length);
    setMessages(allMessages);
  }, [messageData, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;

    const handleScroll = () => {
      if (container.scrollTop < 100) {
        fetchNextPage();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  //Handle sending messages with optimistic UI
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedChat || !isConnected) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      text: messageText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeStr: new Date().toISOString(),
      profileImage: null,
      optimistic: true,
      pending: true,
      delivered: false,
      showDeliveryStatus: true // Show delivery status for new messages
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    // sendTypingIndicator(selectedChat, false);

    // Send via WebSocket
    const success = sendChatMessage(selectedChat, messageText);
    if(success){
      console.log("Message sent successfully with tempId:", tempId);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId 
            ? { ...msg, pending: false, delivered: true, showDeliveryStatus: true }
            : msg
        )
      );
    }
    
    if (!success) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, failed: true, pending: false, showDeliveryStatus: true }
            : msg
        )
      );
      notify("Failed to send message. WebSocket not connected.", "error");
    }
  }, [newMessage, selectedChat, isConnected, sendChatMessage, notify]);

  //Handle typing indicator 
  const handleTyping = useCallback((value) => {
    setNewMessage(value);
    if (!selectedChat || !isConnected) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (value.trim()) {
      // sendTypingIndicator(selectedChat, true);
      const timeout = setTimeout(() => {
        // sendTypingIndicator(selectedChat, false);
      }, 3000);
      setTypingTimeout(timeout);
    } else {
      // sendTypingIndicator(selectedChat, false);
    }
  }, [selectedChat, isConnected, typingTimeout]);

  //clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);




  // Structure room data
  let structureData = null;
  if (data && data.success && data.rooms?.length > 0) {
    structureData = data.rooms.map(
      (room) => {
      let name, avatar, otherUserId = null;
      if (room.roomType === "private") {
        const otherUser = room.participants.find((x) => x._id !== userId);
        name = otherUser?.username;
        avatar = otherUser?.profileImage?.image;
        otherUserId = otherUser?._id;
      } else if (room.roomType === "group") {
        name = room.name;
        avatar = room.avatar || "/avatars/group.png";
      }

      return {
        id: room._id,
        name,
        avatar,
        roomType: room.roomType,
        participants: room.participants,
        otherUserId, // For private chats, store the other user's ID
        lastMessage: room.lastMessage?.content || "No messages yet",
        lastMessageTime: room.lastMessage?.createdAt || room.createdAt,
        time: new Date(room.lastMessage?.createdAt || room.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        unread: room.unreadCount || 0,
      };
    });
  }

  const chats = structureData || [];
  const selectedChatInfo = chats.find((c) => c.id === selectedChat);

  // Debug effect to track online users and chats relationship
  // useEffect(() => {
  //   if (chats.length > 0) {
  //     console.log("Chats and online status debug:", chats.map(chat => ({ 
  //       name: chat.name, 
  //       otherUserId: chat.otherUserId, 
  //       isOnline: chat.otherUserId && onlineUsers.has(chat.otherUserId),
  //       roomType: chat.roomType
  //     })));
  //   }
  // }, [onlineUsers, chats]);

  // WhatsApp-style background SVG (encoded)
  const whatsappBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075E54' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* Left Sidebar - Chat List */}
      <div
        className={cn(
          "border-r flex flex-col h-full bg-background",
          isMobile ? (selectedChat ? "hidden" : "w-full") : "w-1/3 max-w-xs"
        )}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between bg-card border-b">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger />}
            <h1 className="text-lg font-semibold">Chats</h1>
          </div>
          <div
            className="flex cursor-pointer z-50 group hover:scale-110 transition-transform"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl transition-all">
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-45 transition-transform" />
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search or start a new chat"
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-grow">
          {chats.map((chat) => {
            const isOtherUserOnline = chat.otherUserId && onlineUsers.has(chat.otherUserId);
            
            return (
              <div
                key={chat.id}
                className={`flex items-center p-3 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors ${selectedChat === chat.id ? "bg-green-100 dark:bg-green-900/30" : ""
                  }`}
                onClick={() => {
                  setSelectedChat(chat.id);
                }}
              >
                <div className="relative">
                  <Avatar className="size-12 mr-3">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {/* Online indicator for private chats */}
                  {chat.roomType === "private" && isOtherUserOnline && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      {chat.roomType === "private" && isOtherUserOnline && (
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="bg-green-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center ml-2 px-1.5">
                        {chat.unread > 99 ? "99+" : chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Message Section with WhatsApp-like Background */}
         <div
        className={cn(
          "flex-1 flex flex-col h-full",
          isMobile ? (selectedChat ? "flex" : "hidden") : "flex"
        )}
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle at 50% 50%, rgba(13, 30, 30, 0.8), rgba(0, 0, 0, 0.9)), linear-gradient(to bottom, #0b1a1a, #0a1212)"
            : `${whatsappBgPattern}, linear-gradient(to bottom, #f0fdf4, #e6f5e6)`,
          backgroundBlendMode: "overlay, normal",
          backgroundColor: isDark ? "#0a1212" : "#f0fdf4",
          backgroundSize: "30px 30px, auto",
        }}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1"
                    onClick={() => setSelectedChat(null)}
                    aria-label="Back to chats"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="size-10 mr-3">
                  <AvatarImage src={selectedChatInfo?.avatar} alt={selectedChatInfo?.name} />
                  <AvatarFallback>{selectedChatInfo?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">{selectedChatInfo?.name}</h3>
                  <div className="flex items-center gap-2">
                    {/* Online Status */}
                    {(() => {
                      // For private chats, check if the other user is online
                      if (selectedChatInfo) {
                        const otherUserId = selectedChatInfo.otherUserId;
                        const isUserOnline = otherUserId && onlineUsers.has(otherUserId);
                        const typingInfo = typingUsers.get(selectedChat);
                        
                        if (typingInfo && typingInfo.userId !== userId) {
                          return (
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <span className="animate-pulse">●</span>
                              typing...
                            </p>
                          );
                        } else if (selectedChatInfo.roomType === "private" && isUserOnline) {
                          return (
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Online
                            </p>
                          );
                        } else if (selectedChatInfo.roomType === "private") {
                          return (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Last seen recently
                            </p>
                          );
                        } else {
                          // For group chats, show participant count
                          const onlineCount = selectedChatInfo.participants?.filter(p => onlineUsers.has(p._id)).length || 0;
                          return (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {onlineCount} online
                            </p>
                          );
                        }
                      }
                      return (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isConnected ? "Connected" : "Connecting..."}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Phone className="h-8 w-8" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Video className="h-7 w-7" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Search className="h-7 w-7" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <MoreVertical className="h-7 w-7" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-grow p-4 overflow-y-auto flex flex-col space-y-2"
              style={{
                backdropFilter: isDark ? "blur(4px)" : "none",
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMe = message.sender === "me";
                  const prevMessage = messages[index - 1];
                  const showAvatar = !isMe && (!prevMessage || prevMessage.sender !== "other");

                  const currentMsgDate = new Date(message.timeStr);
                  const prevMsgDate = prevMessage ? new Date(prevMessage.timeStr) : null;
                  const shouldShowDate = !prevMsgDate || formatDate(currentMsgDate) !== formatDate(prevMsgDate);

                  return (
                    <div key={message.id}>
                      {/* Date Separator */}
                      {shouldShowDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                            {formatDate(currentMsgDate)}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                        {!isMe && showAvatar && (
                          <Avatar className="size-8 mr-2 self-end flex-shrink-0">
                            <AvatarImage src={message.profileImage} alt="User" />
                            <AvatarFallback>{selectedChatInfo?.name[0]}</AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl break-words",
                              isMe
                                ? "bg-green-600 text-white rounded-tr-none"
                                : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-tl-none",
                              "shadow-sm transition-all duration-200 hover:shadow",
                              message.failed && "bg-red-500 text-white",
                              message.pending && "opacity-70"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 ml-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {message.time}
                            </span>
                            {/* Only show delivery status for messages that explicitly request it */}
                            {isMe && message.showDeliveryStatus === true && (
                              <span className="text-xs">
                                {message.failed ? (
                                  <span className="text-red-500" title="Failed to send">✗</span>
                                ) : message.pending ? (
                                  <span className="text-gray-400" title="Sending...">⏳</span>
                                ) : message.delivered ? (
                                  <span className="text-green-500" title="Delivered">✓</span>
                                ) : (
                                  <span className="text-gray-400" title="Sent">•</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 flex items-center gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <Smile className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message"
                className="flex-grow bg-white/80 dark:bg-gray-800/80 border-none shadow-sm"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!isConnected}
              />
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!isConnected || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div
            className="flex-grow flex flex-col items-center justify-center text-center p-6 h-full"
            style={{
              backgroundImage: isDark
                ? "radial-gradient(circle at 50% 50%, rgba(13, 30, 30, 0.6), rgba(0, 0, 0, 0.9)), linear-gradient(to bottom, #0b1a1a, #0a1212)"
                : `${whatsappBgPattern}, linear-gradient(to bottom, #f0fdf4, #e6f5e6)`,
              backgroundBlendMode: "overlay, normal",
              backgroundColor: isDark ? "#0a1212" : "#f0fdf4",
              backgroundSize: "30px 30px, auto",
              color: isDark ? "#e0f7e0" : "#1a5d1a",
            }}
          >
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Welcome to Hiky</h2>
              <p className="text-muted-foreground">
                Select a chat from the sidebar to start messaging, or create a new chat.
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {isConnected ? "Connected" : "Connecting..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHome;