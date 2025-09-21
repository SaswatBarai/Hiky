import React, { useState, useEffect } from 'react';
import { HikyLogo } from '@/components/hiky-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import {useVerifyResetToken,useResetPassword} from "../utils/queries"
import {useNotification} from "../hooks/useNotification";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const resetPasswordMutation = useResetPassword();
  const {notify} = useNotification();

  useEffect(() => {
    const resetToken = params.token;
    console.log(resetToken);
    if (resetToken) {
      setToken(resetToken);
    }
  }, [params]);

 
  const { data: tokenData, isError: tokenError, error: tokenErrorDetails, isLoading: tokenLoading } = useVerifyResetToken(token);

  const tokenValid = !tokenError && !tokenLoading && !!tokenData;
  

  
  useEffect(() => {
    if (tokenError && tokenErrorDetails) {
      console.log(tokenErrorDetails)
      notify(tokenErrorDetails?.response?.data?.message || "Invalid or expired reset token", "top-center", "error");
    }
  }, [tokenError, tokenErrorDetails, notify]);
  
  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains number', met: /\d/.test(password) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid || !doPasswordsMatch) return;
    
    setIsLoading(true);
    
    resetPasswordMutation.mutate(
      {
        token: token,
        newPassword: password
      },
      {
        onSuccess: (data) => {
          console.log(data);
          setIsSuccess(true);
          notify("Password reset successfully!", "top-center", "success");
        },
        onError: (error) => {
          console.error('Password reset failed:', error);
          notify(error?.response?.data?.message || "Failed to reset password", "top-center", "error");
        },
        onSettled: () => {
          setIsLoading(false);
        }
      }
    );
  };

  // Show loading while verifying token
  if (tokenLoading) {
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

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
          <div className="w-full max-w-md">
            <div className="bg-white/70 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-green-100 dark:border-green-900/20 p-8 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Verifying Reset Link</h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your password reset link...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
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

        {/* Invalid Token Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
          <div className="w-full max-w-md">
            <div className="bg-white/70 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-red-100 dark:border-red-900/20 p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Invalid Reset Link</h1>
                <p className="text-muted-foreground">
                  This password reset link is invalid or has expired.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-600/10 rounded-lg border border-red-200 dark:border-red-600/20">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Reset links expire after 24 hours for security reasons. Please request a new password reset link.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  >
                    Request New Reset Link
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
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
                <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Password Reset Successful</h1>
                <p className="text-muted-foreground">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-600/10 rounded-lg border border-green-200 dark:border-green-600/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Security tip:</strong> Make sure to keep your new password secure and don't share it with anyone.
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                >
                  Continue to Login
                </Button>
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

      {/* Reset Password Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/70 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-green-100 dark:border-green-900/20 p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Reset Your Password</h1>
              <p className="text-muted-foreground">
                Enter your new password below. Make sure it's secure and memorable.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground dark:text-white">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-green-200 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground dark:text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-green-200 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && doPasswordsMatch && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground dark:text-white">Password Requirements:</p>
                <div className="grid grid-cols-1 gap-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
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
