import styled from "styled-components";
import { ReactNode, useState } from "react";

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

const SideBtnDd = ({ icon, onClick }: SideBtnProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown visibility

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option: string) => {
    alert(`Selected option: ${option}`);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div style={{ position: "relative" }}>
      <Btn onClick={toggleDropdown}>
        {icon} {/* Render icon if provided */}
      </Btn>
      {isDropdownOpen && (
        <Dropdown>
          <DropdownItem onClick={onClick}>Camera 1</DropdownItem>
          <DropdownItem onClick={() => handleOptionSelect("Camera 2")}>
            Camera 2
          </DropdownItem>
          <DropdownItem onClick={() => handleOptionSelect("Camera 3")}>
            Camera 3
          </DropdownItem>
        </Dropdown>
      )}
    </div>
  );
};

export default SideBtnDd;
