import React, { useState } from 'react';
import { HikyLogo } from '@/components/hiky-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {useNotification} from "../hooks/useNotification"
import {useForgotPassword} from "../utils/queries"

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {notify} = useNotification();
  const ForgotPasswordMutation = useForgotPassword();

  //using the regex to check password is valid or not
  const checkEmail = () => {
    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(regex.test(email)){
      return true
    } else {
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(!checkEmail()){
      notify("Please enter a valid email address","error");
      setIsLoading(false);
      return;
    }
    ForgotPasswordMutation.mutate(
      {
        email: email
      },
      {
        onSuccess: (data) => {
          console.log(data);
          setIsSubmitted(true);
          notify("Password reset email sent successfully!", "top-center", "success");
        },
        onError: (error) => {
          console.error('Forgot password failed:', error?.response?.data?.message);
          notify(error?.response?.data?.message || "Failed to send reset email", "top-center", "error");
          setIsLoading(false);
        },
        onSettled: () => {
          setIsLoading(false);
        }
      }
    )

  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:from-background dark:via-background dark:to-muted/20 text-foreground">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.03),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.02),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.02),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.06),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05),transparent_30%)] pointer-events-none" />

        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <HikyLogo 
              onClick={() => navigate("/")}
              width={48} height={48} className="rounded-lg cursor-pointer" />
            <h1 className="text-xl font-bold text-green-600 dark:text-green-500">Hiky</h1>
          </div>
        </header>

        {/* Success Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
          <div className="w-full max-w-md">
            <div className="bg-white/70 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-green-100 dark:border-green-900/20 p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-600/10 rounded-lg border border-green-200 dark:border-green-600/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Next steps:</strong><br />
                    1. Check your email inbox<br />
                    2. Click the reset link we sent you<br />
                    3. Create a new password
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="w-full border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
                  >
                    Try Different Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:from-background dark:via-background dark:to-muted/20 text-foreground">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.03),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.02),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.02),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.06),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05),transparent_30%)] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <HikyLogo 
            onClick={() => navigate("/")}
            width={48} height={48} className="rounded-lg cursor-pointer" />
          <h1 className="text-xl font-bold text-green-600 dark:text-green-500">Hiky</h1>
        </div>
      </header>

      {/* Forgot Password Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/70 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-green-100 dark:border-green-900/20 p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Forgot Password?</h1>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground dark:text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-green-200 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-green-100 dark:border-green-900/20">
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="w-full text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}
