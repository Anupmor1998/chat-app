import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const toast = useToast();
  const navigate = useNavigate();
  const initialState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: "",
  };
  const [formState, setFormState] = useState(initialState);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadPic = (pic) => {
    setLoading(true);
    if (!pic) {
      toast({
        title: "Please select an image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    if (["image/jpeg", "image/jpg", "image/png"].includes(pic?.type)) {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dx0ivisca");
      axios
        .post("https://api.cloudinary.com/v1_1/dx0ivisca/image/upload", data)
        .then((res) => {
          setFormState((prev) => ({
            ...prev,
            pic: res.data?.secure_url,
          }));
        })
        .catch((err) => {
          console.log(err, "err");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      toast({
        title: "Please select a valid image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  const handleSubmit = async () => {
    const { name, email, password, pic, confirmPassword } = formState;

    if (!name || !email || !password || !pic || !confirmPassword) {
      toast({
        title: "Please fill all the required fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password do not match!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/user/signup", {
        name,
        email,
        password,
        pic,
      });
      if (res.status === 200) {
        toast({
          title: "Sign up is successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        localStorage.setItem("token", res.data?.data?.token);
        localStorage.setItem("user", JSON.stringify(res.data?.data));
        navigate("/chats");
      }
    } catch (error) {
      console.log(error, "err");
      toast({
        title: "Error Occurred!",
        description: error?.response?.data?.message || "Something went wrong!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          name="name"
          type="text"
          placeholder="Enter Name"
          value={formState.name}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          type="email"
          placeholder="Enter Email"
          value={formState.email}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            value={formState.password}
            onChange={handleChange}
          />
          <InputRightElement w="4.5rem">
            <Button
              size="sm"
              h="1.75rem"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Enter Confirm Password"
            value={formState.confirmPassword}
            onChange={handleChange}
          />
          <InputRightElement w="4.5rem">
            <Button
              size="sm"
              h="1.75rem"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Pic</FormLabel>
        <Input
          name="pic"
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => uploadPic(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="green"
        width="100%"
        marginTop={15}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup;
