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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Badge } from "../components/ui/badge";
import { UserPlus } from "@mynaui/icons-react";

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // Control auto-scroll behavior
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false); // Track if loading older messages
  const isMobile = useIsMobile();
  const { notify } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevSelectedChatRef = useRef(null);
  const queryClient = useQueryClient();
  const scrollPositionRef = useRef(0); // Track scroll position for pagination
  const scrollLockRef = useRef(false); // Prevent scroll changes during pagination
  const isRestoringScrollRef = useRef(false); // Track if we're in the middle of scroll restoration
  const addFriendRef = useRef();

  const handleWebSocketMessage = useCallback(
    (data) => {
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
                minute: "2-digit",
              }),
              timeStr: data.timestamp,
              profileImage: data.sender?.profileImage?.image,
              optimistic: false,
              pending: false,
              delivered: true,
              failed: false,
              showDeliveryStatus: data.senderId === userId, // Only show for our own messages in real-time
            };

            setMessages((prev) => {
              // If this is our message, try to replace the optimistic version
              if (newMsg.sender === "me") {
                const optimisticIndex = prev.findIndex(
                  (msg) =>
                    msg.optimistic &&
                    msg.text === newMsg.text &&
                    msg.sender === "me" &&
                    Math.abs(
                      new Date(msg.timeStr).getTime() -
                        new Date(newMsg.timeStr).getTime()
                    ) < 10000 // within 10 seconds
                );

                if (optimisticIndex !== -1) {
                  const updated = [...prev];
                  // Replace optimistic message with real one, keeping showDeliveryStatus: true
                  updated[optimisticIndex] = {
                    ...newMsg,
                    pending: false,
                    delivered: true,
                    showDeliveryStatus: true,
                  };
                  console.log(
                    "Replaced optimistic message with real message, delivered=true"
                  );
                  return updated;
                }
              }

              // Check if message already exists to avoid duplicates
              if (prev.some((msg) => msg.id === newMsg.id)) {
                return prev;
              }

              // Add new message from others or if no optimistic message found
              return [...prev, newMsg];
            });

            // Enable auto-scroll for new real-time messages
            setShouldAutoScroll(true);
          } else {
            notify(
              `New message from ${data.sender?.username || "Unknown"}`,
              "info"
            );
          }
          break;

        case "typing":
          // Handle typing indicators
          setTypingUsers((prev) => {
            const updated = new Map(prev);
            if (data.content) {
              // is typing
              updated.set(data.roomId, { userId: data.userId, isTyping: true });
            } else {
              // stopped typing
              updated.delete(data.roomId);
            }
            return updated;
          });
          break;

        case "friendOnline":
          console.log("Friend came online:", data.userId, data.user?.username);
          setOnlineUsers((prev) => new Set([...prev, data.userId]));
          notify(`${data.user?.username || "Someone"} is online`, "info");
          break;

        case "friendOffline":
          console.log("Friend went offline:", data.userId);
          setOnlineUsers((prev) => {
            const updated = new Set(prev);
            updated.delete(data.userId);
            return updated;
          });
          notify(`Someone went offline`, "info");
          break;

        case "registered":
          console.log("Successfully registered to WebSocket");
          break;

        case "initialOnlineStatus":
          // Handle bulk online status update when connecting
          if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
            setOnlineUsers(new Set(data.onlineUsers));
            console.log(
              "Received initial online status for users:",
              data.onlineUsers
            );
          }
          break;

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
    },
    [selectedChat, userId, notify, queryClient]
  ); // Added queryClient to dependencies

  const { isConnected, sendMessage, joinRoom, leaveRoom, sendChatMessage } =
    useWebSocket(handleWebSocketMessage);

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
    if (
      prevSelectedChatRef.current &&
      prevSelectedChatRef.current !== selectedChat
    ) {
      leaveRoom(prevSelectedChatRef.current);
    }

    // Join new room
    joinRoom(selectedChat);

    // Enable auto-scroll when switching to a new chat and reset all scroll states
    setShouldAutoScroll(true);
    setIsLoadingOlderMessages(false);
    scrollLockRef.current = false;
    isRestoringScrollRef.current = false;

    // Mark messages as read after a short delay
    const markReadTimer = setTimeout(() => {
      // Also update local unread count
      queryClient.setQueryData(["getRooms"], (oldData) => {
        if (!oldData?.rooms) return oldData;
        return {
          ...oldData,
          rooms: oldData.rooms.map((room) =>
            room._id === selectedChat ? { ...room, unreadCount: 0 } : room
          ),
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
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Process messages from API - these should NOT show delivery status
  useEffect(() => {
    if (!messageData) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    // For pagination, we need to prevent ANY scroll changes
    const isPagination = messageData.pages.length > 1;

    if (isPagination) {
      // Completely lock scrolling during pagination
      scrollLockRef.current = true;
      isRestoringScrollRef.current = true;
      setShouldAutoScroll(false);
      setIsLoadingOlderMessages(true);

      // Store exact scroll metrics before DOM changes
      const scrollMetrics = {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        scrollBottom:
          container.scrollHeight - container.scrollTop - container.clientHeight,
      };

      console.log("Before loading older messages:", scrollMetrics);

      // Temporarily disable scroll events to prevent interference
      container.style.overflowY = "hidden";

      const allMessages = messageData.pages
        .flatMap((page) => page.messages)
        .map((msg) => ({
          id: msg._id,
          text: msg.content,
          sender: msg.senderId._id === userId ? "me" : "other",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeStr: msg.createdAt,
          profileImage: msg.senderId.profileImage?.image,
          optimistic: false,
          pending: false,
          delivered: false,
          failed: false,
          showDeliveryStatus: false,
        }))
        .sort((a, b) => new Date(a.timeStr) - new Date(b.timeStr));

      setMessages(allMessages);

      // Restore scroll position after DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (container && scrollLockRef.current) {
            const newScrollHeight = container.scrollHeight;
            const heightDifference =
              newScrollHeight - scrollMetrics.scrollHeight;
            const newScrollTop = scrollMetrics.scrollTop + heightDifference;

            // Force scroll position
            container.scrollTop = newScrollTop;

            console.log("Restored scroll:", {
              oldScrollTop: scrollMetrics.scrollTop,
              newScrollTop: newScrollTop,
              heightDifference: heightDifference,
              newScrollHeight: newScrollHeight,
            });

            // Multiple restoration attempts
            setTimeout(() => {
              container.scrollTop = newScrollTop;
              setTimeout(() => {
                container.scrollTop = newScrollTop;
                // Re-enable scrolling
                container.style.overflowY = "auto";
                // Unlock after everything is done
                setTimeout(() => {
                  scrollLockRef.current = false;
                  isRestoringScrollRef.current = false;
                  setIsLoadingOlderMessages(false);
                }, 50);
              }, 10);
            }, 10);
          }
        });
      });
    } else {
      // Initial load or new chat - normal processing
      const allMessages = messageData.pages
        .flatMap((page) => page.messages)
        .map((msg) => ({
          id: msg._id,
          text: msg.content,
          sender: msg.senderId._id === userId ? "me" : "other",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeStr: msg.createdAt,
          profileImage: msg.senderId.profileImage?.image,
          optimistic: false,
          pending: false,
          delivered: false,
          failed: false,
          showDeliveryStatus: false,
        }))
        .sort((a, b) => new Date(a.timeStr) - new Date(b.timeStr));

      console.log(
        "Loading messages from API:",
        allMessages.length,
        "messages with showDeliveryStatus:",
        allMessages.filter((m) => m.showDeliveryStatus).length
      );

      scrollLockRef.current = false;
      isRestoringScrollRef.current = false;
      setIsLoadingOlderMessages(false);
      setMessages(allMessages);
      setTimeout(() => setShouldAutoScroll(true), 100);
    }
  }, [messageData, userId]);

  // Auto-scroll to bottom only when conditions are right
  useEffect(() => {
    if (
      shouldAutoScroll &&
      !isLoadingOlderMessages &&
      !scrollLockRef.current &&
      !isRestoringScrollRef.current
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll, isLoadingOlderMessages]);

  // Infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;

    const handleScroll = () => {
      // Don't trigger if we're in the middle of restoration
      if (scrollLockRef.current || isRestoringScrollRef.current) {
        return;
      }

      // Store current scroll position
      scrollPositionRef.current = container.scrollTop;

      // Load more messages when scrolling to top
      if (container.scrollTop < 100) {
        // Prevent auto-scroll during pagination
        setShouldAutoScroll(false);
        setIsLoadingOlderMessages(true);
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
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timeStr: new Date().toISOString(),
      profileImage: null,
      optimistic: true,
      pending: true,
      delivered: false,
      showDeliveryStatus: true, // Show delivery status for new messages
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setShouldAutoScroll(true); // Enable auto-scroll for new messages being sent
    // sendTypingIndicator(selectedChat, false);

    // Send via WebSocket
    const success = sendChatMessage(selectedChat, messageText);
    if (success) {
      console.log("Message sent successfully with tempId:", tempId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                pending: false,
                delivered: true,
                showDeliveryStatus: true,
              }
            : msg
        )
      );
    }

    if (!success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, failed: true, pending: false, showDeliveryStatus: true }
            : msg
        )
      );
      notify("Failed to send message. WebSocket not connected.", "error");
    }
  }, [newMessage, selectedChat, isConnected, sendChatMessage, notify]);

  //Handle typing indicator
  const handleTyping = useCallback(
    (value) => {
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
    },
    [selectedChat, isConnected, typingTimeout]
  );

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
    structureData = data.rooms.map((room) => {
      let name,
        avatar,
        otherUserId = null;
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
        unreadMessagesCount: room?.unreadCount,
        lastMessageTime: room.lastMessage?.createdAt || room.createdAt,
        time: new Date(
          room.lastMessage?.createdAt || room.createdAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: room.unreadCount || 0,
      };
    });
  }

  const handleMarkAsReadn = (chatId, unreadCount) => {
    if (!chatId || unreadCount === 0) return;
    // Send read receipt via WebSocket
    sendMessage({
      type: "readReceipt",
      roomId: chatId,
      userId: userId,
    });
  };

  const chats = structureData || [];
  console.log("mark 1", structureData);

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const chatName = chat.name?.toLowerCase() || "";
    const lastMessage = chat.lastMessage?.toLowerCase() || "";

    return chatName.includes(query) || lastMessage.includes(query);
  });

  const selectedChatInfo = chats.find((c) => c.id === selectedChat);
  const whatsappBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075E54' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const handleAddFriend = () => {
    addFriendRef.current.click()
  }



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
          <div></div>
          <div className="flex justify-center items-center gap-2">
            <div 
            onClick={handleAddFriend}
            className="flex cursor-pointer z-50 group hover:scale-110 transition-transform">
              <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl transition-all">
                <UserPlus 
                className="w-5 h-5 text-green-400" />
                <AlertDialog asChild >
                  <AlertDialogTrigger className="hidden">
                    <Button variant="outline" ref={addFriendRef} >Show Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search or start a new chat"
              className="pl-10 pr-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-muted-foreground px-1">
              {filteredChats.length} chat{filteredChats.length !== 1 ? "s" : ""}{" "}
              found
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-grow">
          {filteredChats.length === 0 && searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No chats found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try searching with a different keyword or start a new
                conversation
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isOtherUserOnline =
                chat.otherUserId && onlineUsers.has(chat.otherUserId);

              return (
                <div
                  key={chat.id}
                  className={`flex items-center p-3 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors ${
                    selectedChat === chat.id
                      ? "bg-green-100 dark:bg-green-900/30"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedChat(chat.id);
                    handleMarkAsReadn(chat.id, chat.unreadMessagesCount);
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
                        <span className=" text-white text-xs min-w-[20px] h-5 flex items-center justify-center ml-2 px-1.5">
                          {/* {chat.unread > 99 ? "99+" : chat.unread} */}
                          {chat.unread > 99 ? (
                            <>
                              <Badge
                                className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
                                variant="destructive"
                              >
                                99+
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
                                {chat.unread}
                              </Badge>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
                  <AvatarImage
                    src={selectedChatInfo?.avatar}
                    alt={selectedChatInfo?.name}
                  />
                  <AvatarFallback>{selectedChatInfo?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    {selectedChatInfo?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Online Status */}
                    {(() => {
                      // For private chats, check if the other user is online
                      if (selectedChatInfo) {
                        const otherUserId = selectedChatInfo.otherUserId;
                        const isUserOnline =
                          otherUserId && onlineUsers.has(otherUserId);
                        const typingInfo = typingUsers.get(selectedChat);

                        if (typingInfo && typingInfo.userId !== userId) {
                          return (
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <span className="animate-pulse">●</span>
                              typing...
                            </p>
                          );
                        } else if (
                          selectedChatInfo.roomType === "private" &&
                          isUserOnline
                        ) {
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
                          const onlineCount =
                            selectedChatInfo.participants?.filter((p) =>
                              onlineUsers.has(p._id)
                            ).length || 0;
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
                  const showAvatar =
                    !isMe && (!prevMessage || prevMessage.sender !== "other");

                  const currentMsgDate = new Date(message.timeStr);
                  const prevMsgDate = prevMessage
                    ? new Date(prevMessage.timeStr)
                    : null;
                  const shouldShowDate =
                    !prevMsgDate ||
                    formatDate(currentMsgDate) !== formatDate(prevMsgDate);

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
                      <div
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        } mb-2`}
                      >
                        {!isMe && showAvatar && (
                          <Avatar className="size-8 mr-2 self-end flex-shrink-0">
                            <AvatarImage
                              src={message.profileImage}
                              alt="User"
                            />
                            <AvatarFallback>
                              {selectedChatInfo?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`flex flex-col ${
                            isMe ? "items-end" : "items-start"
                          } max-w-[70%]`}
                        >
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
                            <p className="text-sm leading-relaxed">
                              {message.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 ml-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {message.time}
                            </span>
                            {/* Only show delivery status for messages that explicitly request it */}
                            {isMe && message.showDeliveryStatus === true && (
                              <span className="text-xs">
                                {message.failed ? (
                                  <span
                                    className="text-red-500"
                                    title="Failed to send"
                                  >
                                    ✗
                                  </span>
                                ) : message.pending ? (
                                  <span
                                    className="text-gray-400"
                                    title="Sending..."
                                  >
                                    ⏳
                                  </span>
                                ) : message.delivered ? (
                                  <span
                                    className="text-green-500"
                                    title="Delivered"
                                  >
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-gray-400" title="Sent">
                                    •
                                  </span>
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
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
              >
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
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
              >
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
          /* Enhanced Welcome Screen */
          <div
            className="flex-grow flex flex-col items-center justify-center text-center p-6 h-full relative overflow-hidden"
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
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-green-500/20 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-2xl space-y-8">
              {/* Logo/Icon section */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-green-600/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-500/20">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-green-500/5 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>

              {/* Welcome text */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Welcome to Hiky
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Your gateway to seamless conversations and meaningful
                  connections
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/10 hover:border-green-500/20 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Connect Instantly
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start conversations with friends and colleagues in real-time
                  </p>
                </div>

                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/10 hover:border-green-500/20 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your conversations are protected with end-to-end encryption
                  </p>
                </div>

                <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/10 hover:border-green-500/20 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Lightning Fast
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Experience instant messaging with our optimized
                    infrastructure
                  </p>
                </div>
              </div>

              {/* Call to action */}
              <div className="mt-12 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    Start New Chat
                  </button>
                  <button className="px-8 py-3 border-2 border-green-600/20 hover:border-green-600/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1">
                    Join Group
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      isConnected ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {isConnected ? "🟢 Connected" : "🟡 Connecting..."}
                  </span>
                </p>
              </div>

              {/* Footer text */}
              <div className="mt-16 text-center">
                <p className="text-xs text-muted-foreground/70">
                  Select a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHome;
