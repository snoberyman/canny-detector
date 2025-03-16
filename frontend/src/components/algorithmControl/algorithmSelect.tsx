import styled from "styled-components";
import { useAppContext } from "../../context/useAppContext";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: fixed;
  top: 25%;
  left: 10%;
`;

const Button = styled.button<{ $pressed: boolean }>`
  width: 110px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid #999;
  background: ${(props) => (props.$pressed ? "#ccc" : "#ddd")};
  box-shadow: ${(props) =>
    props.$pressed ? "inset 4px 4px 8px #888" : "4px 4px 8px #666"};
  transition: all 0.1s ease-in-out;

  &:active {
    box-shadow: inset 4px 4px 8px #888;
    background: #bbb;
  }
`;

const AlgorithmSelect = ({
  selectedAlgorithm,
  setSelectedAlgorithm,
}: {
  selectedAlgorithm: number;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { addLogMessage } = useAppContext(); // Get the latest message

  const handleSelect = (algorithm: number) => {
    setSelectedAlgorithm(algorithm);
    window.electronAPI.selectAlgorithm("select-algorithm", algorithm);

    addLogMessage([
      `${buttonNames[algorithm]} algorithm is selected`,
      new Date().toLocaleTimeString(),
    ]);
  };

  const buttonNames = ["Canny", "Sobel", "Laplacian"];

  return (
    <Container>
      {[0, 1, 2].map((algorithm) => (
        <Button
          key={algorithm}
          $pressed={selectedAlgorithm === algorithm}
          onClick={() => handleSelect(algorithm)}
        >
          {buttonNames[algorithm]}
        </Button>
      ))}
    </Container>
  );
};

export default AlgorithmSelect;
