import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Link, useNavigate} from "react-router-dom"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Home } from "@mynaui/icons-react";

const Login = ({
  heading = "Login",
  buttonText = "Login",
  signupText = "Need an account?"
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  return (
    <section className="bg-muted h-screen ">
        <div onClick={() => navigate("/")} className="fixed left-2 top-4 cursor-pointer z-10">
            <Home className="w-6 h-6 text-foreground hover:text-primary" />
        </div>
        
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
         
          <div
            className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            <Input type="email" placeholder="Email" className="text-sm" required />
            
            {/* Password field with eye toggle */}
            <div className="relative w-full">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="text-sm pr-10" 
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

            <Button type="submit" className="w-full">
              {buttonText}
            </Button>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <Link to={"/register"} className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
