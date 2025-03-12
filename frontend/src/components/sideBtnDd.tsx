import styled from "styled-components";
import { ReactNode, useState, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";

const Btn = styled.button`
  align-items: center;
  margin: 10px auto;
  padding: 5px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e5f4e3;
  }

  svg {
    width: 30px;
    height: 18px;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  width: 150px;
  top: 40px; /* Position dropdown below the button */
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;

interface SideBtnProps {
  icon: ReactNode; // Icon component (optional)
  onClick?: () => void; // Click event handler (optional)
}

const SideBtnDd = ({ icon }: SideBtnProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Manage dropdown visibility
  const [options, setOptions] = useState<number[]>([]);
  const { cameraIndex, setCameraIndex } = useAppContext();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option: number) => {
    setCameraIndex(option);
    setIsDropdownOpen(false); // Close dropdown after selection
    console.log("selected Camera: ", cameraIndex);
  };

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.fetchCams().then((response) => {
        setOptions(response.data);
      });
    }
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Btn onClick={toggleDropdown}>
        {icon} {/* Render icon if provided */}
      </Btn>
      {isDropdownOpen && (
        <Dropdown>
          {options.map((option, index) => (
            <DropdownItem
              key={index}
              onClick={() => handleOptionSelect(option)}
            >
              Camera {option + 1}
            </DropdownItem>
          ))}
        </Dropdown>
      )}
    </div>
  );
};

export default SideBtnDd;
