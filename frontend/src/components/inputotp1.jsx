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
    <div className="flex flex-col items-center gap-4">
      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

export { OTPInputBox };
