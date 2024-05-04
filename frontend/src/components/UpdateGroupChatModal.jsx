import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
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

const UpdateGroupChatModal = ({ setRefetch, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [loading, setLoading] = useState({
    user: false,
    name: false,
    addUser: false,
  });
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, 500);
  const [searchResult, setSearchResult] = useState([]);
  const toast = useToast();
  const { user, selectedChat, setSelectedChat } = ChatState();

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

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    try {
      setLoading((prev) => ({
        ...prev,
        name: true,
      }));

      const res = await axiosInstance.put("/chat/rename", {
        chatId: selectedChat?._id,
        chatName: groupChatName,
      });
      setSelectedChat(res);
      setRefetch((prev) => !prev);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      setGroupChatName("");
    } finally {
      setLoading((prev) => ({
        ...prev,
        name: false,
      }));
    }
  };
  const handleRemove = async (user1) => {
    if (
      selectedChat?.groupAdmin?._id !== user?._id &&
      user1?._id !== user?._id
    ) {
      toast({
        title: "Only admin can remove users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    try {
      setLoading((prev) => ({
        ...prev,
        addUser: true,
      }));

      const res = await axiosInstance.put("/chat/group-remove", {
        chatId: selectedChat?._id,
        userId: user1?._id,
      });

      user1?._id === user?._id ? setSelectedChat(null) : setSelectedChat(res);
      setRefetch((prev) => !prev);
      fetchMessages();
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
        addUser: false,
      }));
    }
  };
  const handleAddUser = async (user1) => {
    if (selectedChat?.users?.find((u) => u?._id === user1?._id)) {
      toast({
        title: "User already added!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    if (selectedChat?.groupAdmin?._id !== user?._id) {
      toast({
        title: "Only admin can add users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    try {
      setLoading((prev) => ({
        ...prev,
        addUser: true,
      }));

      const res = await axiosInstance.put("/chat/group-add", {
        chatId: selectedChat?._id,
        userId: user1?._id,
      });

      setSelectedChat(res);
      setRefetch((prev) => !prev);
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
        addUser: false,
      }));
    }
  };
  return (
    <>
      <IconButton
        icon={<ViewIcon />}
        display={{
          base: "flex",
        }}
        onClick={onOpen}
      />
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <Box display={"flex"} flexWrap={"wrap"} w="100%" pb={3}>
              {selectedChat?.users?.map((user) => (
                <UserBadgeItem
                  onClick={() => handleRemove(user)}
                  user={user}
                  key={user?._id}
                />
              ))}
            </Box>
            <FormControl display={"flex"}>
              <Input
                name="name"
                mb={3}
                type="text"
                value={groupChatName}
                placeholder="Chat Name"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                isLoading={loading.name}
                colorScheme="green"
                ml={1}
                onClick={handleRename}
              >
                Update
              </Button>
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

            {loading.user ? (
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                ?.map((user) => (
                  <UserListItem
                    key={user?._id}
                    user={user}
                    onClick={() => handleAddUser(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={loading.addUser}
              colorScheme="green"
              onClick={() => handleRemove(user)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
