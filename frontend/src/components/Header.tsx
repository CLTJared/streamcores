import React, { useState, useEffect } from "react";
import { type HeaderProps } from "@/models/Header";
import Button from "@/components/Button";

const Header: React.FC<HeaderProps> = ({ channel, setChannel, onConnect }) => {
  const [inputValue, setInputValue] = useState(channel);

  // Sync local input if the connected channel changes externally
  useEffect(() => {
    setInputValue(channel);
  }, [channel]);

  const handleConnect = () => {
    setChannel(inputValue.trim().toLowerCase());
    onConnect(inputValue.trim().toLowerCase());
  };

  return (
    <header>
      <nav className="flex flex-row">
        <h2 className="text-xl font-bold mb-2 w-fit grow">Select Twitch Channel</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a twitch channel"
          className="border p-2 mr-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConnect();
          }}
        />
        <Button
          onClick={handleConnect}
          className="bg-purple-600 text-white"
        >
          Join
        </Button>
      </nav>
    </header>
  );
};

export default Header;