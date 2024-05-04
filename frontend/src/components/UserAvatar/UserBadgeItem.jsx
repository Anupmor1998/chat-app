import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, onClick }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius={"lg"}
      m={1}
      mb={2}
      fontSize={12}
      bg={"green"}
      color={"white"}
    >
      {user?.name}
      <CloseIcon
        cursor={"pointer"}
        _hover={{
          color: "red",
        }}
        onClick={onClick}
        pl={1}
      />
    </Box>
  );
};

export default UserBadgeItem;
