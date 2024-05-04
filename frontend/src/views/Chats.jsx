import { Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../Content/ChatProvider";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideBar from "../components/SideBar";

const Chats = () => {
  const { user } = ChatState();
  const [refetch, setRefetch] = useState(false);

  return (
    <Box width="100%">
      {user && <SideBar />}
      <Box
        width="100%"
        h="91.5vh"
        display="flex"
        justifyContent="space-between"
        p="10px"
      >
        {user && <MyChats refetch={refetch} />}
        {user && <ChatBox refetch={refetch} setRefetch={setRefetch} />}
      </Box>
    </Box>
  );
};

export default Chats;
