import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  register,
  getUser,
  verifyEmail,
  profileUploader,
  login,
  getRooms,
  getMessages,
  sendMessage,
  createRoom,
  searchUsers,
  deleteRoom,
  markMessagesAsRead
} from "../utils/axios.js";

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};

export const useGetUser = () => {
  return useQuery({
    queryKey: ["getUser"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
  });
};

export const useProfileUploader = () => {
  return useMutation({
    mutationFn: profileUploader,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};


export const usegetRooms = () => {
  return useQuery({
    queryKey:["getRooms"],
    queryFn:getRooms,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 1, 
    refetchIntervalInBackground:true
  })
}

export const useGetMessages = (roomId,enabled = false) => {
  return useQuery({
    queryKey:["getMessages",roomId],
    queryFn:() => getMessages(roomId,1,20),
    enabled:enabled && !!roomId,
    staleTime: 1000 * 60,
  })
}

export const useGetMessagesInfinite = (roomId, enabled = false) => {
  return useInfiniteQuery({
    queryKey: ["getMessagesInfinite", roomId],
    queryFn:({pageParam   = 1 }) => getMessages(roomId, pageParam, 20),
    enabled: enabled && !!roomId,
    getNextPageParam :(lastPage) => {
      if(lastPage.pagination && lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage +1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess:(data,variables) => {
      queryClient.invalidateQueries({
        queryKey:["getRooms"]
      });

      const roomId = variables.roomId;
      queryClient.setQueryData(["getMessages",roomId],(oldData) => {
        if(!oldData) return;
        return {
          ...oldData,
          message:[...(oldData.message || []), data.data]
        }
      })
    }
  })
}


export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:["getRooms"]
      })
    }
  })
}


export const useSearchUsers = () => {
  return useQuery({
    mutationFn: searchUsers
  })
}


export const useDeletRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:["getRooms"]
      })
    }
  })
}


export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess:(data,roomId) => {
      queryClient.setQueryData(["getMessages",roomId], (oldData) => {
        if(!oldData) return;
        return{
          ...oldData,
          room:oldData.room.map(room => {
            room._id === roomId  ? {...room, unreadCount: 0} : room
          })
        }
      })
    }
  })
}