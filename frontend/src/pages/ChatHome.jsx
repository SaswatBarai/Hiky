import { useEffect, useState, useRef } from "react";
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

function ChatHome() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";
  const userId = useSelector((state) => state.auth?.user?._id);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const isMobile = useIsMobile();
  const { notify } = useNotification();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

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

  // Format date for separators
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Process messages from API
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
      }))
      .sort((a, b) => new Date(a.timeStr) - new Date(b.timeStr));

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

  // Structure room data
  let structureData = null;
  if (data && data.success && data.rooms?.length > 0) {
    structureData = data.rooms.map((room) => {
      let name, avatar;
      if (room.roomType === "private") {
        const otherUser = room.participants.find((x) => x._id !== userId);
        name = otherUser?.username;
        avatar = otherUser?.profileImage?.image;
      } else if (room.roomType === "group") {
        name = room.name;
        avatar = room.avatar || "/avatars/group.png";
      }

      return {
        id: room._id,
        name,
        avatar,
        lastMessage: room.lastMessage?.content || "No messages yet",
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
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-3 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors ${
                selectedChat === chat.id ? "bg-green-100 dark:bg-green-900/30" : ""
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <Avatar className="size-12 mr-3">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  <p className="text-xs text-green-600 dark:text-green-400">Online</p>
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
                              "shadow-sm transition-all duration-200 hover:shadow"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                            {message.time}
                          </span>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // Add send message logic here
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHome;