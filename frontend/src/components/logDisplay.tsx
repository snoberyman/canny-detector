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
  background-color: black;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: monospace;
`;

const LogMessage = styled.div`
  padding: 5px;
  margin-bottom: 2px;
  font-size: 14px;
  color: white;
  text-align: left;
  margin-left: 60px;
`;

interface ScrollableLogProps {
  messages: string[]; // Array of log messages
}

const LogDisplay = ({ messages }: ScrollableLogProps) => {
  return (
    <LogContainer>
      {messages.map((msg, index) => (
        <LogMessage key={index} dangerouslySetInnerHTML={{ __html: msg }} />
      ))}
    </LogContainer>
  );
};

export default LogDisplay;
