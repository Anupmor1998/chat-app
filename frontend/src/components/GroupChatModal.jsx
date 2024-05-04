import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Content/ChatProvider";
import axiosInstance from "../helpers/axios";
import { useDebounce } from "../hooks/useDebounce";
import UserBadgeItem from "./UserAvatar/UserBadgeItem";
import UserListItem from "./UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupState, setGroupState] = useState({
    name: "",
    users: [],
  });
  const [loading, setLoading] = useState({
    user: false,
    chat: false,
  });
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);
  const [searchResult, setSearchResult] = useState([]);
  const toast = useToast();
  const { user, chats, setChats } = ChatState();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedValue) {
        return;
      }
      try {
        setLoading((prev) => ({
          ...prev,
          user: true,
        }));
        const res = await axiosInstance.get(`/user?search=${debouncedValue}`);
        setSearchResult(res);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: error || "Something went wrong!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } finally {
        setLoading((prev) => ({
          ...prev,
          user: false,
        }));
      }
    };

    handleSearch();
  }, [debouncedValue]);

  const handleSubmit = async () => {
    if (!groupState.name || !groupState.users) {
      toast({
        title: "Please fill all the fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    try {
      setLoading((prev) => ({
        ...prev,
        chat: true,
      }));

      const res = await axiosInstance.post("/chat/group", {
        name: groupState.name,
        users: JSON.stringify(groupState.users?.map((user) => user?._id)),
      });

      setChats([res, ...chats]);
      onClose();
      toast({
        title: "New group chat created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
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
      setLoading((prev) => ({
        ...prev,
        chat: false,
      }));
    }
  };
  const handleDelete = (userId) => {
    const filteredUsers = groupState.users?.filter(
      (user) => user?._id !== userId
    );

    setGroupState((prev) => ({
      ...prev,
      users: filteredUsers,
    }));
  };

  const handleGroup = (user) => {
    if (groupState.users.includes(user)) {
      toast({
        title: "User already added!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    setGroupState((prev) => ({
      ...prev,
      users: [...prev.users, user],
    }));
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <FormControl>
              <Input
                name="name"
                mb={3}
                type="text"
                value={groupState.name}
                placeholder="Chat Name"
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <Input
                name="search"
                type="text"
                mb={1}
                placeholder="Add Users eg: Anup, Mayank, Raj"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormControl>
            <Box display={"flex"} flexWrap={"wrap"} w={"100%"}>
              {groupState.users?.map((user) => (
                <UserBadgeItem
                  key={user?._id}
                  user={user}
                  onClick={() => handleDelete(user?._id)}
                />
              ))}
            </Box>
            {loading.user ? (
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                ?.map((user) => (
                  <UserListItem
                    key={user?._id}
                    user={user}
                    onClick={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={loading.chat}
              colorScheme="green"
              onClick={handleSubmit}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
