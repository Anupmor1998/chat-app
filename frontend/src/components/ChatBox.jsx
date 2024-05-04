import { Box } from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../Content/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ refetch, setRefetch }) => {
  const { selectedChat } = ChatState();
  return (
    <Box
      display={{
        base: selectedChat ? "flex" : "none",
        md: "flex",
      }}
      alignItems={"center"}
      flexDir={"column"}
      p={3}
      w={{
        base: "100%",
        md: "68%",
      }}
      borderRadius={"lg"}
      borderWidth={"1px"}
      bg={"white"}
    >
      <SingleChat refetch={refetch} setRefetch={setRefetch} />
    </Box>
  );
};

export default ChatBox;
