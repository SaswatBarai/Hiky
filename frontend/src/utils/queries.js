import {useMutation} from "@tanstack/react-query";
import {
    register
} from "../utils/axios.js";




export const useRegister = () => {
   return useMutation({
    mutationFn: register,
   })
}
