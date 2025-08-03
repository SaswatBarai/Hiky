import {useMutation,useQuery} from "@tanstack/react-query";
import {
    register,
    getUser
} from "../utils/axios.js";




export const useRegister = () => {
   return useMutation({
    mutationFn: register,
   })
}

export const useGetUser = () => {
    return useQuery({
        queryKey: ["getUser"],
        queryFn: getUser,
        staleTime: 1000 * 60 * 5, 
        gcTime: 1000 * 60 * 10, 
        
    })
}
