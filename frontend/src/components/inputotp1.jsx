import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, createContext, useContext } from "react";


const OTPContext = createContext();




export const useOtp = () => {
  const context = useContext(OTPContext);
  if (!context) {
    throw new Error('useOtp must be used within an OTPProvider');
  }
  return context;
};


export const OTPProvider = ({ children }) => {
  const [otp, setOtp] = useState("");
  
  return (
    <OTPContext.Provider value={{ otp, setOtp }}>
      {children}
    </OTPContext.Provider>
  );
};

function OTPInputBox() {
  const { otp, setOtp } = useOtp();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>
      </div>
      
      <InputOTP 
        maxLength={6} 
        value={otp} 
        onChange={setOtp}
        className="gap-3"
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot 
            index={0} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
          <InputOTPSlot 
            index={1} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
          <InputOTPSlot 
            index={2} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
        </InputOTPGroup>
        <InputOTPSeparator className="text-muted-foreground mx-2">
          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
        </InputOTPSeparator>
        <InputOTPGroup className="gap-2">
          <InputOTPSlot 
            index={3} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
          <InputOTPSlot 
            index={4} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
          <InputOTPSlot 
            index={5} 
            className="w-12 h-12 text-lg font-bold border-2 border-border/60 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50" 
          />
        </InputOTPGroup>
      </InputOTP>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {otp.length}/6 digits entered
        </p>
      </div>
    </div>
  );
}

export { OTPInputBox };
