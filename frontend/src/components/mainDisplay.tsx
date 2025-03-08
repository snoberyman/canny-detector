import { useAppContext } from "../context/useAppContext";

const MainDisplay = () => {
  const { latestMessage } = useAppContext(); // Get the latest message

  return (
    <div style={{ flex: 1, padding: "20px" }}>
      <h1>📩 Received Message:</h1>
      <p>{latestMessage}</p>
    </div>
  );
};

export default MainDisplay;
