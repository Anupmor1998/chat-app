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

function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const initialState = {
    email: "",
    password: "",
  };
  const [formState, setFormState] = useState(initialState);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { email, password } = formState;

    if (!email || !password) {
      toast({
        title: "Please fill all the required fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/user/login", {
        email,
        password,
      });
      if (res.status === 200) {
        toast({
          title: "Log In is successful",
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
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          type="email"
          value={formState.email}
          placeholder="Enter Email"
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
      <Button
        colorScheme="green"
        width="100%"
        marginTop={15}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Log In
      </Button>
      <Button
        colorScheme="red"
        width="100%"
        marginTop={15}
        onClick={() =>
          setFormState({
            email: "guest123@gmail.com",
            password: "123456",
          })
        }
      >
        Guest Credentials
      </Button>
    </VStack>
  );
}

export default Login;
