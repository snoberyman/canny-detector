import { useRef, useEffect } from "react";
import styled from "styled-components";

const LogContainer = styled.div`
  width: 100%;
  min-height: 150px;
  max-height: 150px;
  position: fixed;
  bottom: 0;
  z-index: -1;
  overflow-y: scroll;
  padding: 10px;
  background-color: black;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: monospace;
`;

const LogMessage = styled.div`
  padding: 3px;
  margin-bottom: 2px;
  font-size: 14px;
  color: white;
  text-align: left;
  margin-left: 60px;
`;

const LogTime = styled.span`
  color: #aaa;
`;

interface ScrollableLogProps {
  messages: string[][]; // Array of log messages
}

const LogDisplay = ({ messages }: ScrollableLogProps) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]); // Run this effect when messages change

  return (
    <LogContainer ref={logContainerRef}>
      {messages.map((msg, index) => (
        <LogMessage key={index}>
          <LogTime>
            {">>"} {msg[1]}:
          </LogTime>{" "}
          {msg[0]}
        </LogMessage>
      ))}
    </LogContainer>
  );
};

export default LogDisplay;
// `<div style="color:#ccc; display:inline"> >> ${new Date().toLocaleTimeString()}:</div> ${
