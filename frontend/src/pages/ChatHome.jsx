import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usegetRooms } from "../utils/queries";
import { cn } from "../lib/utils";
import { useIsMobile } from "../hooks/use-mobile";
import { SidebarTrigger } from "../components/ui/sidebar";
import { useTheme } from "../components/theme-provider";
import { Moon, Sun } from "lucide-react";

function ChatHome() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedChat, setSelectedChat] = useState(null);
  const isMobile = useIsMobile();

  const { data, error, isError } = usegetRooms();
  if (isError) {
  }
  console.log(data);
  // Mock data - replace with actual data from your backend
  const chats = [
    {
      id: 1,
      name: "John Doe",
      avatar: "/avatars/john.jpg",
      lastMessage: "Hello there!",
      time: "10:30 AM",
      unread: 2,
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "/avatars/jane.jpg",
      lastMessage: "How are you?",
      time: "9:15 AM",
      unread: 0,
    },
    {
      id: 3,
      name: "Bob Johnson",
      avatar: "/avatars/bob.jpg",
      lastMessage: "See you tomorrow!",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: 4,
      name: "Alice Brown",
      avatar: "/avatars/alice.jpg",
      lastMessage: "Thanks for the info",
      time: "Yesterday",
      unread: 1,
    },
    {
      id: 5,
      name: "Team Hiky",
      avatar: "/avatars/team.jpg",
      lastMessage: "Meeting at 3pm",
      time: "Monday",
      unread: 0,
    },
  ];

  // Mock messages for selected chat
  const messages = [
    { id: 1, text: "Hey there!", sender: "other", time: "10:25 AM" },
    { id: 2, text: "Hi! How are you?", sender: "me", time: "10:26 AM" },
    {
      id: 3,
      text: "I'm good, thanks! Just wanted to check in.",
      sender: "other",
      time: "10:28 AM",
    },
    {
      id: 4,
      text: "That's great to hear. I'm doing well too.",
      sender: "me",
      time: "10:30 AM",
    },
  ];

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
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="icon"> */}
              <div
                className={cn(
                  "flex left-4 bottom-6 transition-all duration-300 cursor-pointer z-50 group",
                  "hover:scale-110"
                )}
              >
                <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl transition-all duration-200"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? (
                    <Sun
                      className="w-5 h-5 text-yellow-500 transition-all duration-300 group-hover:rotate-45"
                
                    />
                  ) : (
                    <Moon
                      className="w-5 h-5 text-blue-600 transition-all duration-300 group-hover:-rotate-45"
                    
                    />
                  )}
                </div>
              </div>
           
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className={`flex items-center p-3 hover:bg-accent cursor-pointer ${
                selectedChat === chat.id ? "bg-accent" : ""
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
                  <span className="text-xs text-muted-foreground">
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Message Section */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full",
          isMobile ? (selectedChat ? "flex" : "hidden") : "flex"
        )}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div
              className={cn(
                "p-3 flex items-center justify-between bg-card border-b"
              )}
            >
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
                    src={chats.find((c) => c.id === selectedChat)?.avatar}
                    alt="Chat"
                  />
                  <AvatarFallback>
                    {chats.find((c) => c.id === selectedChat)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {chats.find((c) => c.id === selectedChat)?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-[#f0f0f0] dark:bg-[#2a2a2a] flex flex-col">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[70%] mb-3 ${
                    message.sender === "me" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <Card
                    className={`p-3 ${
                      message.sender === "me" ? "bg-primary/10" : "bg-card"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {message.time}
                    </p>
                  </Card>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-3 flex items-center gap-2 bg-card border-t">
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input placeholder="Type a message" className="flex-grow" />
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
              <Button size="icon" className="rounded-full">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          // Welcome screen when no chat is selected
          <div className="flex-grow flex flex-col items-center justify-center bg-[#f0f0f0] dark:bg-[#2a2a2a] text-center p-6 h-full">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-4">Welcome to Hiky</h2>
              <p className="text-muted-foreground">
                Select a chat from the sidebar to start messaging, or create a
                new chat.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHome;
