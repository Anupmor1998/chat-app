import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Content/ChatProvider";
import axiosInstance from "../helpers/axios";
import { useChat } from "../hooks/useChat";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./GroupChatModal";

const MyChats = ({ refetch }) => {
  const toast = useToast();
  const { user, setSelectedChat, chats, setChats, selectedChat } = ChatState();
  const { getSender } = useChat();
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/chat");
      setChats(res);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("user")));
    fetchAllChats();
  }, [refetch]);

  return (
    <Box
      display={{
        base: selectedChat ? "none" : "flex",
        md: "flex",
      }}
      flexDirection="column"
      alignItems={"center"}
      p={3}
      bg={"white"}
      width={{
        base: "100%",
        md: "31%",
      }}
      borderRadius={"lg"}
      borderWidth={"1px"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily={"Work sans"}
        display={"flex"}
        width={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        My chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{
              base: "17px",
              md: "10px",
              lg: "17px",
            }}
            rightIcon={<AddIcon fontSize={"small"} />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display={"flex"}
        flexDir={"column"}
        p={3}
        bg={"#f8f8f8"}
        w={"100%"}
        height={"100%"}
        borderRadius={"lg"}
        overflowY={"hidden"}
      >
        {chats ? (
          <Stack overflowY={"scroll"}>
            {chats?.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor={"pointer"}
                bg={selectedChat === chat ? "#38b2ac" : "#e8e8e8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius={"lg"}
                key={chat?._id}
              >
                <Text>
                  {!chat?.isGroupChat
                    ? getSender(loggedUser, chat?.users)
                    : chat?.chatName}
                </Text>
                {chat?.latestMessage &&
                user?._id !== chat?.latestMessage?.sender?._id ? (
                  <Text
                    fontSize={"14px"}
                    fontWeight={"400"}
                    color={"black"}
                    mt={1}
                  >
                    {chat?.isGroupChat && (
                      <b>{chat?.latestMessage?.sender?.name}:</b>
                    )}{" "}
                    {chat?.latestMessage?.content}
                  </Text>
                ) : null}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
