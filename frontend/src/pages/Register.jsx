import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { OTPInputBox, OTPProvider, useOtp} from "../components/inputotp1";

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
  setShowConfirmPassword 
}) => {
  const { otp, setOtp } = useOtp();
  

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
          <div className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md">
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            <Input
              type="text"
              placeholder="Username"
              className="text-sm"
              required
            />
            <Input
              type="email"
              placeholder="Email"
              className="text-sm"
              required
            />

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

            {/* Confirm Password field with eye toggle */}
            <div className="relative w-full">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="text-sm pr-10"
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="submit" 
                onClick ={() => setOtp("")}
                className="w-full">
                  {buttonText}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Verify Your Email</AlertDialogTitle>
                  <AlertDialogDescription>
                    We've sent a verification code to your email address. Please enter the code below to complete your registration.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                  <OTPInputBox/>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate("/profile-uploader")}>
                    Verify & Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
