import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Content/ChatProvider";
import axiosInstance from "../helpers/axios";
import { useChat } from "../hooks/useChat";
import ChatLoading from "./ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "./UserAvatar/UserListItem";

const SideBar = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getSender } = useChat();
  const navigate = useNavigate();
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notifications,
    setNotifications,
  } = ChatState();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState({
    user: false,
    chat: false,
  });
  const logoutHandler = () => {
    localStorage.removeItem("user");
    navigate("/", {
      replace: false,
    });
  };

  const handleSearch = async () => {
    setLoading((prev) => ({
      ...prev,
      user: true,
    }));
    try {
      const res = await axiosInstance.get(`/user?search=${search}`);
      setSearchResult(res);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the search results!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading((prev) => ({
        ...prev,
        user: false,
      }));
    }
  };

  const accessChat = async (userId) => {
    setLoading((prev) => ({
      ...prev,
      chat: true,
    }));
    try {
      const res = await axiosInstance.post("/chat", { userId });
      if (!chats.find((c) => c._id === res?._id)) {
        setChats([res, ...chats]);
      }
      setSelectedChat(res);
      onClose();
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
      setLoading((prev) => ({
        ...prev,
        chat: false,
      }));
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        p="5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button onClick={onOpen} variant="ghost">
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work Sans">
          Talk-A-Tive
        </Text>
        <div>
          <Menu>
            <MenuButton p={1} position={"relative"}>
              <BellIcon fontSize="2xl" m={1} />
              {notifications?.length > 0 && (
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  borderRadius={"50%"}
                  bg={"red"}
                  p={"8px"}
                  fontSize={"12px"}
                  position={"absolute"}
                  top={1}
                  right={2}
                  fontWeight={600}
                  color={"white"}
                  textAlign={"center"}
                  w={3.5}
                  h={3.5}
                >
                  {notifications?.length}
                </Box>
              )}
            </MenuButton>
            <MenuList p={2}>
              {!notifications?.length && <Text>No New Messages</Text>}
              {notifications?.map((notif) => (
                <MenuItem
                  key={notif?._id}
                  onClick={() => {
                    setSelectedChat(notif?.chat);
                    setNotifications((prev) =>
                      prev?.filter((n) => n !== notif)
                    );
                  }}
                >
                  {notif?.chat?.isGroupchat
                    ? `New Message in ${notif?.chat?.chatName}`
                    : `New Message from ${getSender(user, notif?.chat?.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                mr={2}
                placeholder="Search by email or name"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button isDisabled={!search} onClick={handleSearch}>
                Go
              </Button>
            </Box>
            {loading.user ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user?._id}
                  user={user}
                  onClick={() => accessChat(user?._id)}
                />
              ))
            )}
            {loading.chat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideBar;
