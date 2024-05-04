import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Lottie from "react-lottie";
import { io } from "socket.io-client";
import { ChatState } from "../Content/ChatProvider";
import typingAnimation from "../animations/typing.json";
import axiosInstance from "../helpers/axios";
import { useChat } from "../hooks/useChat";
import "../index.css";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./UpdateGroupChatModal";

const ENDPOINT = "http://localhost:8000";
let socket, selectedChatCompare;
const SingleChat = ({ refetch, setRefetch }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
  } = ChatState();
  const toast = useToast();
  const { getSender } = useChat();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messageRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare?._id !== newMessageReceived?.chat?._id
      ) {
        if (!notifications?.includes(newMessageReceived)) {
          setNotifications((prev) => [newMessageReceived, ...prev]);
          setRefetch((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });
  }, []);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/message/${selectedChat?._id}`);
      setMessages(res);
      socket.emit("join chat", selectedChat?._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat?._id);
      setNewMessage("");
      try {
        const res = await axiosInstance.post("/message", {
          chatId: selectedChat?._id,
          content: newMessage,
        });
        socket.emit("new message", res);
        setMessages((prev) => [...prev, res]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: error,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat?._id);
    }

    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat?._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{
              base: "28px",
              md: "30px",
            }}
            w="100%"
            fontFamily={"Work sans"}
            pb={3}
            px={2}
            display="flex"
            justifyContent={{
              base: "space-between",
            }}
            alignItems="center"
          >
            <IconButton
              display={{
                base: "flex",
                md: "none",
              }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat?.isGroupChat ? (
              <>
                {getSender(user, selectedChat?.users)}
                <ProfileModal
                  user={getSender(user, selectedChat?.users, true)}
                />
              </>
            ) : (
              <>
                {selectedChat?.chatName?.toUpperCase()}
                <UpdateGroupChatModal
                  setRefetch={setRefetch}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius={"lg"}
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner w={20} h={20} alignSelf={"center"} margin={"auto"} />
            ) : (
              <div className="message">
                <ScrollableChat messages={messages} />
                <div ref={messageRef} />
              </div>
            )}
            {isTyping ? (
              <Box
                display={"flex"}
                justifyContent={"flex-start"}
                alignItems={"center"}
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  cursor="pointer"
                  size="sm"
                  name={getSender(user, selectedChat?.users, true)?.name}
                  src={getSender(user, selectedChat?.users, true)?.pic}
                />
                <Lottie
                  options={defaultOptions}
                  width={30}
                  style={{
                    marginLeft: 0,
                  }}
                />
              </Box>
            ) : null}
            <FormControl onKeyDown={sendMessage} mt={3} isRequired>
              <Input
                variant={"filled"}
                bg="#e0e0e0"
                placeholder="Enter a message..."
                name="message"
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"1005"}
        >
          <Text fontSize={"3xl"} fontFamily={"Work sans"} pb={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
