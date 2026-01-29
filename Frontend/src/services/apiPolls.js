import { AxiosInstance } from "./apiConfig.js";

export const getAllPolls = async function () {
  const res = await AxiosInstance({
    url: "/polls",
    method: "get",
  });

  return res.data;
};

export const getPollsWithPagination = async function ({ pageParam = 1 }) {
  const res = await AxiosInstance({
    url: `/polls/getPollsWithPagination/${pageParam}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data;
  }

  return null;
};

export const createPoll = async function (data) {
  const { question, options } = data;

  const optionsToSend = [];

  options.forEach((option) => {
    optionsToSend.push({ text: option });
  });

  const res = await AxiosInstance({
    url: "/polls",
    method: "post",
    data: {
      question,
      options: optionsToSend,
    },
  });

  if (res.data.status === "success") {
    return res;
  }

  return null;
};

export const caseVote = async function (data) {
  const { pollId, optionId } = data;

  const res = await AxiosInstance({
    url: "/polls/castVote",
    method: "post",
    data: {
      pollId,
      optionId,
    },
  });

  if (res.data.status === "success") {
    return res;
  }

  return null;
};

export const whichOptionVoted = async function (pollId) {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) return 0;

  const res = await AxiosInstance({
    url: `/polls/whichOptionVoted/${pollId}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data.optionId;
  }

  return 0;
};

export const countVotesForPoll = async function (pollId) {
  const res = await AxiosInstance({
    url: `/polls/countVotes/${pollId}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data.options; // returns array of { optionId, voteCount }
  }

  return [];
};
