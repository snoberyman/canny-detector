import styled from "styled-components";
import { ReactNode } from "react";

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

interface SideBtnProps {
  icon: ReactNode; // Icon component (optional)
  onClick?: () => void; // Click event handler (optional)
}

const SideBtn = ({ icon, onClick }: SideBtnProps) => {
  return (
    <Btn onClick={onClick}>
      {icon} {/* Render icon if provided */}
    </Btn>
  );
};

export default SideBtn;
