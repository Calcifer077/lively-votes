import { useInfiniteQuery } from "@tanstack/react-query";

import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { getPollsWithPagination } from "../../services/apiPolls";

export function useGetPollsWithPagination() {
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
    queryKey: ["polls"],
    queryFn: ({ pageParam = 1 }) =>
      getPollsWithPagination({ axiosInstance, pageParam }),
    getNextPageParam: (axiosInstance, lastPage) => {
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
