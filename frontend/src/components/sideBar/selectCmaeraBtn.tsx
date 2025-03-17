import styled from "styled-components";
import { ReactNode, useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/useAppContext";

import { Tooltip } from "react-tooltip";

interface BtnProps {
  $noCameras?: number;
}

const Btn = styled.button<BtnProps>`
  align-items: center;
  margin: 10px auto;
  padding: 5px;
  background-color: white;
  color: black;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.3s;
  disabled: disabled;
  background-color: ${(props) =>
    props.$noCameras !== undefined &&
    props.$noCameras >= 1 &&
    props.$noCameras <= 9
      ? "white"
      : "gray"};
  pointer-events: ${(props) =>
    props.$noCameras !== undefined &&
    props.$noCameras >= 1 &&
    props.$noCameras <= 9
      ? ""
      : "none"};

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
  width: 100px;
  top: 90px; /* Position dropdown below the button */
  left: 5px;
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;

interface SelectCmaeraBtnProps {
  icon: ReactNode; // Icon component (optional)
  onClick?: () => void; // Click event handler (optional)
}

const SelectCmaeraBtn = ({ icon }: SelectCmaeraBtnProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Manage dropdown visibility
  const [options, setOptions] = useState<number[]>([]);
  const { cameraIndex, setCameraIndex, addLogMessage } = useAppContext();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option: number) => {
    setIsDropdownOpen(false); // close dropdonw
    setCameraIndex(option);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // handle close dropdown when clicking outisde
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof cameraIndex === "number") {
      addLogMessage([
        `Camera ${cameraIndex + 1} is selected.`,
        new Date().toLocaleTimeString(),
      ]);
    }
  }, [cameraIndex, addLogMessage]); // This runs when cameraIndex changes

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.fetchCams().then((response) => {
        if (response.data.length === 1) {
          addLogMessage([
            `1 Camera detected.`,
            new Date().toLocaleTimeString(),
          ]);
        } else if (response.data.length > 1 && response.data.length << 10) {
          addLogMessage([
            `${response.data.length} Cameras detected.`,
            new Date().toLocaleTimeString(),
          ]);
        } else {
          addLogMessage([
            `No camera detected! Please check your connection and ensure a camera is plugged in.`,
            new Date().toLocaleTimeString(),
          ]);
        }

        setOptions(response.data);
      });
    }
  }, [addLogMessage]);

  return (
    <>
      <Tooltip anchorSelect=".SelectCmaeraBtn" place="right" variant="light">
        Select camera
      </Tooltip>
      <a className="SelectCmaeraBtn">
        <Btn
          ref={buttonRef}
          onClick={toggleDropdown}
          $noCameras={options.length}
        >
          {icon} {/* Render icon if provided */}
        </Btn>
      </a>
      {isDropdownOpen && (
        <Dropdown ref={dropdownRef}>
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
    </>
  );
};

export default SelectCmaeraBtn;
