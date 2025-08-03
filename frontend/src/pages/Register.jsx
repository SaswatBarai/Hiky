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
          notify.notify(error.response.data.message, "top-center", "error");
          setIsOtpLoading(false);
          console.error(error.response.data.message);
          
        }
      }
    );
  };

  return (
    <section className="bg-muted h-screen">
      <div
        onClick={() => navigate("/")}
        className="fixed left-2 top-4 cursor-pointer z-10"
      >
        <Home className="w-6 h-6 text-foreground hover:text-primary" />
      </div>
      <div className="flex h-full items-center justify-center">
        {/* Registration Form */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <form className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}

            <Input
              type="text"
              placeholder="Username"
              className="text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              className="text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password field with eye toggle */}
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="text-sm pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password field with eye toggle */}
            <div className="relative w-full">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="text-sm pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" onClick={handleRegister} disabled = {isMainLoading}  className="w-full">
              {
                isMainLoading ? (
                  <Spinner className="animate-spin" size={16} />
                ) : (
                  buttonText
                )
              }
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button ref={otpInput} className="hidden">
                  hello
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Verify Your Email</AlertDialogTitle>
                  <AlertDialogDescription>
                    We've sent a verification code to <strong>{email}</strong>. Please
                    enter the 6-digit code below to complete your registration.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                  <OTPInputBox />
                  
                  {/* Resend OTP Section */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isResendLoading}
                      className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
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

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      handleOTPSubmit(e)
                    }}
                  >
                    {
                      isOtpLoading ? (
                        <Spinner className="animate-spin" size={16} />
                      ) : (
                        "Verify & Continue"
                      )
                    }
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>

          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{loginText}</p>
            <Link
              to={"/login"}
              className="text-primary font-medium hover:underline"
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
