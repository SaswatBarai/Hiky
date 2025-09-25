import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Palette,
  Shield,
  LogOut,
  Trash2,
  KeyRound,
  CreditCard,
  Camera,
  Sun,
  Moon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state?.auth?.user);
  const { theme, setTheme } = useTheme();

  // State for editing profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
  });

  // State for notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleProfileSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", profileData);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setProfileData({
      name: currentUser?.name || "",
      username: currentUser?.username || "",
      email: currentUser?.email || "",
    });
    setIsEditingProfile(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const SettingSection = ({
    icon: Icon,
    title,
    description,
    children,
    action,
  }) => (
    <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 transition-colors duration-200 hover:bg-primary/20">
              <Icon className="h-5 w-5 text-primary transition-transform duration-200 hover:scale-110" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              {children}
            </div>
          </div>
          {action && (
            <div className="flex items-center space-x-3">
              {action}
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:translate-x-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:from-background dark:via-background dark:to-muted/20 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.03),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.02),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.02),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.06),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05),transparent_30%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </header>

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex md:flex-col h-auto md:h-full bg-transparent p-0 border-r">
            <TabsTrigger value="profile" className="justify-start w-full">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="justify-start w-full">
              <Palette className="mr-2 h-4 w-4" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start w-full">
              <Shield className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="justify-start w-full">
              <CreditCard className="mr-2 h-4 w-4" /> Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start w-full">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="justify-start w-full text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Account
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="profile">
              <Card className="bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-500">Profile</CardTitle>
                  <CardDescription>
                    This is how others will see you on the site.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={currentUser?.profileImage?.image}
                          alt={currentUser?.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {currentUser?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">
                        {currentUser?.name}
                      </h3>
                      <p className="text-muted-foreground">
                        @{currentUser?.username}
                      </p>
                      <Badge
                        variant={
                          currentUser?.isVerified ? "default" : "secondary"
                        }
                      >
                        {currentUser?.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={currentUser?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        defaultValue={currentUser?.username}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={currentUser?.email}
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-500">Preferences</CardTitle>
                  <CardDescription>
                    Customize the appearance of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={toggleTheme}
                      className="w-24 justify-start border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
                    >
                      {theme === "dark" ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4" />
                      )}
                      {theme === "dark" ? "Light" : "Dark"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Set your preferred language.
                      </p>
                    </div>
                    <Button variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20">English</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-500">Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your password regularly to keep your account
                        secure.
                      </p>
                    </div>
                    <Button variant="outline">
                      <KeyRound className="mr-2 h-4 w-4" /> Change Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-500">Billing</CardTitle>
                  <CardDescription>
                    Manage your billing information and subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You are currently on the Free plan.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button>Upgrade to Pro</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-500">Notifications</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your account activity.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="w-20 justify-center border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
                    >
                      {notificationsEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get push notifications on your devices.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="w-20 justify-center border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
                    >
                      {notificationsEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="bg-white/70 dark:bg-card/50 border border-red-200 dark:border-red-900/20">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-500">
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Log Out</h4>
                      <p className="text-sm text-muted-foreground">
                        Log out of your account on this device.
                      </p>
                    </div>
                    <Button variant="outline">
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-500">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all of your
                        content.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
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
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
