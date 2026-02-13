import { AxiosInstance } from "./apiConfig.js";

export const getAllPolls = async function () {
  const res = await AxiosInstance({
    url: "/polls",
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data;
  }

  return null;
};

export const getPollsWithPagination = async function ({
  axiosInstance,
  pageParam = 1,
}) {
  const res = await axiosInstance({
    url: `/polls/getPollsWithPagination/${pageParam}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data;
  }

  return null;
};

export const createPoll = async function (axiosInstance, data) {
  const { question, options } = data;

  const optionsToSend = [];

  options.forEach((option) => {
    optionsToSend.push({ text: option });
  });

  const res = await axiosInstance({
    url: "/polls",
    method: "post",
    data: {
      question,
      options: optionsToSend,
    },
  });

  if (res.data.status === "success") {
    return res.data;
  }

  return null;
};

export const castVote = async function ({ axiosInstance, pollId, optionId }) {
  const res = await axiosInstance({
    url: "/polls/castVote",
    method: "post",
    data: {
      pollId,
      optionId,
    },
  });

  if (res.data.status === "success") {
    return res.data;
  }

  return null;
};

export const whichOptionVoted = async function (axiosInstance, pollId) {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) return 0;

  const res = await axiosInstance({
    url: `/polls/whichOptionVoted/${pollId}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data.optionId;
  }

  return 0;
};

export const countVotesForPoll = async function (axiosInstance, pollId) {
  const res = await axiosInstance({
    url: `/polls/countVotes/${pollId}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data.options;
    // returns array of { optionId, voteCount }
  }

  return [];
};

export const getPollById = async function (axiosInstance, pollId) {
  const res = await axiosInstance({
    url: `/polls/getPollById/${pollId}`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data;
  }

  return null;
};
