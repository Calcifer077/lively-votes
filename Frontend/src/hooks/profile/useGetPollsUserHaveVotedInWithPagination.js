import { useInfiniteQuery } from "@tanstack/react-query";

import { getPollsUserHaveVotedInWithPagination } from "../../services/apiUser";
import { useAxiosPrivate } from "../axios/useAxiosPrivate";

export function useGetPollsUserHaveVotedInWithPagination() {
  const axiosInstance = useAxiosPrivate();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["pollsUserHaveVotedInWithPagination"],
    queryFn: ({ pageParam = 1 }) =>
      getPollsUserHaveVotedInWithPagination({ axiosInstance, pageParam }),
    getNextPageParam: (lastPage) => {
      let currPage = lastPage.page;
      let totalPages = lastPage.totalPages;

      if (currPage >= totalPages) {
        return undefined;
      }
      return currPage + 1;
    },
  });

  return {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  };
}
