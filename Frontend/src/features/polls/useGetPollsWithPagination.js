import { useInfiniteQuery } from "@tanstack/react-query";
import { getPollsWithPagination } from "../../services/apiPolls";

export function useGetPollsWithPagination() {
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
    queryFn: getPollsWithPagination,
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
