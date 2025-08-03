import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Link, useNavigate} from "react-router-dom"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Home, Spinner } from "@mynaui/icons-react";
import { loginSchema } from "../validation/auth.validation";
import {useNotification} from "../hooks/useNotification";
import { useLogin } from "../utils/queries";
import { useDispatch } from "react-redux";
import { setUser } from "../state/authSlice";
import Cookie from "js-cookie";

const Login = ({
  heading = "Login",
  buttonText = "Login",
  signupText = "Need an account?"
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [mainInput,setMainInput] = useState("");
  const [password ,setPassword] = useState("");
  const {notify} = useNotification();
  const loginMutation = useLogin();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a plain object for validation (not FormData)
    const formData = {
      emailOrUsername: mainInput,
      password: password
    };

    try {
      await loginSchema.validateAsync(formData, {
        abortEarly: false
      });
    } catch (error) {
      console.error("Validation errors:", error.details);
      const errorMessages = error.details.map((detail) => detail.message);
      errorMessages.forEach((msg) => {
        notify(msg, "top-center", "error");
      });
      return;
    }

    setIsLoading(true);

    // Make login API call
    loginMutation.mutate(
      { mainInput, password },
      {
        onSuccess: (data) => {
          if (data?.success) {
            // Store token
            localStorage.setItem("accessToken", data.accessToken);
            Cookie.set("accessToken", data.accessToken, {
              expires: 1,
              secure: true,
              sameSite: "Lax",
            });

            // Update user state
            if (data?.user) {
              dispatch(setUser(data?.user));
            }

            setIsLoading(false);
            notify("Login successful!", "top-center", "success");
            
            // Navigate based on user's email verification status
            if (!data.user?.isEmailVerified) {
              navigate("/register"); // Go to email verification
            } else if (!data.user?.name || !data.user?.profileImage) {
              navigate("/profile-uploader"); // Complete profile
            } else {
              navigate("/"); // Go to dashboard
            }
          }
        },
        onError: (error) => {
          setIsLoading(false);
          console.error("Login error:", error.response?.data);
          const errorMessage = error.response?.data?.message || "Login failed";
          notify(errorMessage, "top-center", "error");
        },
      }
    );

  }
  return (
    <section className="bg-gradient-to-br from-muted via-muted to-muted/50 h-screen relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,226,0.05),transparent_50%)]"></div>
        </div>
        
        <div onClick={() => navigate("/")} className="fixed left-4 top-6 cursor-pointer z-10 transition-all duration-200 hover:scale-110">
            <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 hover:shadow-xl">
                <Home className="w-5 h-5 text-foreground hover:text-primary transition-colors duration-200" />
            </div>
        </div>
        
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 lg:justify-start">
         
          <form
            onSubmit= {handleSubmit}
            className="min-w-sm border-border/50 bg-background/95 backdrop-blur-sm flex w-full max-w-sm flex-col items-center gap-y-6 rounded-xl border px-8 py-10 shadow-2xl hover:shadow-3xl transition-all duration-300">
            
            {/* Welcome header with enhanced styling */}
            <div className="text-center space-y-2 mb-2">
              {heading && <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{heading}</h1>}
              <p className="text-sm text-muted-foreground">Welcome back! Please sign in to continue</p>
            </div>

            {/* Enhanced input styling */}
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <Input 
                  type="text"
                  onChange={(e) => setMainInput(e.target.value)}
                  value={mainInput}
                  placeholder="Email or Username" 
                  className="text-sm h-11 px-4 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                  required 
                />
              </div>
              
              {/* Enhanced password field with eye toggle */}
              <div className="relative space-y-1">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="text-sm h-11 px-4 pr-12 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                  required
                  placeholder="Password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Enhanced button styling */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-11 rounded-lg font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="animate-spin" size={16} />
                  Logging in...
                </div>
              ) : (
                buttonText
              )}
            </Button>
          </form>
          
          {/* Enhanced link styling */}
          <div className="text-muted-foreground flex justify-center gap-1 text-sm bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
            <p>{signupText}</p>
            <Link to={"/register"} className="text-primary font-medium hover:underline transition-all duration-200 hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
