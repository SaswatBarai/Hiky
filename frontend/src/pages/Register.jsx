import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Home } from "@mynaui/icons-react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { OTPInputBox, OTPProvider, useOtp } from "../components/inputotp1";
import { registerSchema } from "../validation/auth.validation";
import { useNotification } from "../hooks/useNotification";
import { useRegister, useVerifyEmail } from "../utils/queries";
import Cookie from "js-cookie";
import { useDispatch } from "react-redux";
import {setUser} from "../state/authSlice"
import { Spinner } from "@mynaui/icons-react";
import { resendOTP } from "../utils/axios";


const Register = ({
  heading = "Create Account",
  buttonText = "Sign Up",
  loginText = "Already have an account?",
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <OTPProvider>
      <RegisterContent
        heading={heading}
        buttonText={buttonText}
        loginText={loginText}
        navigate={navigate}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
    </OTPProvider>
  );
};

const RegisterContent = ({
  heading,
  buttonText,
  loginText,
  navigate,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  const { otp, setOtp } = useOtp();
  const notify = useNotification();
  const dispatch = useDispatch();
  const registerMutation = useRegister();
  const verifyEmailMutation = useVerifyEmail();
  const otpInput = useRef(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMainLoading, setIsMainLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsResendLoading(true);

    try {
      const response = await resendOTP({ email });
      
      if (response?.success) {
        notify.notify("OTP resent successfully", "top-center", "success");
        setResendTimer(60); 
        setOtp(""); // Clear the OTP input
      } else {
        notify.notify("Failed to resend OTP", "top-center", "error");
      }
    } catch (error) {
      console.error("Error resending OTP:", error?.response);
      notify.notify(error?.response?.data?.message || "Failed to resend OTP", "top-center", "error");
    } finally {
      setIsResendLoading(false);
    }
  };





  
  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMainLoading(true);
    // Create a plain object for validation
    const formData = {
      username,
      email,
      password,
      confirmPassword,
    };

    // Validate the data
    try {
      const { error } = await registerSchema.validateAsync(formData, {
        abortEarly: false, // Collect all errors
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Validation errors:", error.details);
      const errorMessages = error.details.map((detail) => detail.message);
      errorMessages.forEach((msg) => {
        notify.notify(msg, "top-center", "error");
      });
      setIsMainLoading(false);
      return;
    }
    registerMutation.mutate(
      { username, email, password },
      {
        onSuccess: (data) => {
          if (data?.success) {
            localStorage.setItem("accessToken", data.accessToken);
            Cookie.set("accessToken", data.accessToken, {
              expires: 1, // 1 day expiration
              secure: true, // Use secure cookies in production
              sameSite: "Lax",
            });

            if(data?.user){
              dispatch(setUser(data?.user));
            }
            setIsMainLoading(false);
            setOtp("");
            setResendTimer(60); // Start 60 second timer
            otpInput.current.click();
          }
        },
        onError: (error) => {
          setIsMainLoading(false);
          console.error("Registration error:", error.response.data);
          notify.notify(error.response.data.message, "top-center", "error");
          return;
        },
      }
    );
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOtpLoading(true);
    if (!otp || otp.length < 6) {
      notify.notify("Please enter a valid OTP", "top-center", "warning");
      setIsOtpLoading(false);
      setOtp("");
      return;
    }

    // const user = useSelector((state) => state.auth.user);
    // const storeEmail = user?.email;
    // //testing email
    // const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    // if (!emailRegex.test(storeEmail)) {
    //   notify.notify(
    //     "Please enter a valid email address",
    //     "top-center",
    //     "warning"
    //   );
    //   return;
    // }
    // Here you would typically send the OTP to your backend for verification
    verifyEmailMutation.mutate(
      { email, otp },
      {
        onSettled: (data) =>{
          console.log(data)
          if(data?.success){
            dispatch(setUser(data?.user));
            setIsOtpLoading(false);
            navigate("/profile-uploader")
            notify.notify("Email verified successfully", "top-center", "success");
          }
        },
        onError : (error) => {
          setIsOtpLoading(false);
          notify.notify(error.response.data.message, "top-center", "error");
          console.error(error.response.data.message);
          
        }
      }
    );
  };

  return (
    <section className="bg-gradient-to-br from-muted via-muted to-muted/50 h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,226,0.05),transparent_50%)]"></div>
      </div>

      <div
        onClick={() => navigate("/")}
        className="fixed left-4 top-6 cursor-pointer z-10 transition-all duration-200 hover:scale-110"
      >
        <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl">
          <Home className="w-5 h-5 text-foreground hover:text-primary transition-colors duration-200" />
        </div>
      </div>
      
      <div className="flex h-full items-center justify-center p-4">
        {/* Registration Form */}
        <div className="flex flex-col items-center gap-8 lg:justify-start">
          <form className="min-w-sm border-border/50 bg-background/95 backdrop-blur-sm flex w-full max-w-sm flex-col items-center gap-y-6 rounded-xl border px-8 py-10 shadow-2xl hover:shadow-3xl transition-all duration-300">
            
            {/* Enhanced header */}
            <div className="text-center space-y-2 mb-2">
              {heading && <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{heading}</h1>}
              <p className="text-sm text-muted-foreground">Join us today! Create your account to get started</p>
            </div>

            {/* Enhanced input styling */}
            <div className="w-full space-y-4">
              <Input
                type="text"
                placeholder="Username"
                className="text-sm h-11 px-4 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                className="text-sm h-11 px-4 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Enhanced password field with eye toggle */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="text-sm h-11 px-4 pr-12 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Enhanced confirm password field with eye toggle */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="text-sm h-11 px-4 pr-12 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Enhanced button styling */}
            <Button 
              type="submit" 
              onClick={handleRegister} 
              disabled={isMainLoading}  
              className="w-full h-11 rounded-lg font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isMainLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="animate-spin" size={16} />
                  Creating account...
                </div>
              ) : (
                buttonText
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button ref={otpInput} className="hidden">
                  hello
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md rounded-xl border-border/50 bg-background/95 backdrop-blur-sm">
                <AlertDialogHeader className="space-y-3">
                  <AlertDialogTitle className="text-xl font-bold text-center">Verify Your Email</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-muted-foreground">
                    We've sent a verification code to <strong className="text-foreground">{email}</strong>. Please
                    enter the 6-digit code below to complete your registration.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-6 space-y-6">
                  <OTPInputBox />
                  
                  {/* Enhanced resend OTP Section */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isResendLoading}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 p-2 h-auto font-medium rounded-lg transition-all duration-200"
                    >
                      {isResendLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="animate-spin" size={14} />
                          Sending...
                        </div>
                      ) : resendTimer > 0 ? (
                        `Resend OTP in ${resendTimer}s`
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                  </div>
                </div>

                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      handleOTPSubmit(e)
                    }}
                    className="rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {isOtpLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="animate-spin" size={16} />
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Continue"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>

          {/* Enhanced link styling */}
          <div className="text-muted-foreground flex justify-center gap-1 text-sm bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
            <p>{loginText}</p>
            <Link
              to={"/login"}
              className="text-primary font-medium hover:underline transition-all duration-200 hover:text-primary/80"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
