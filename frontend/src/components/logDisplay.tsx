import styled from "styled-components";

const LogContainer = styled.div`
  width: 100%;
  min-height: 150px;
  max-height: 150px;
  position: fixed;
  bottom: 0;
  z-index: -1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: monospace;
`;

const LogMessage = styled.div`
  padding: 5px;
  margin-bottom: 8px;
  background-color: #e8e8e8;
  border-radius: 3px;
  font-size: 14px;
  color: #333;
  text-align: left;
  margin-left: 60px;

  &:nth-child(even) {
    background-color: #dcdcdc;
  }
`;

interface ScrollableLogProps {
  messages: string[]; // Array of log messages
}

const LogDsipaly = ({ messages }: ScrollableLogProps) => {
  return (
    <LogContainer>
      {messages.map((message, index) => (
        <LogMessage key={index}>{message}</LogMessage>
      ))}
    </LogContainer>
  );
};

export default LogDsipaly;
