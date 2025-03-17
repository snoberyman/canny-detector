import styled from "styled-components";
import { ReactNode } from "react";

interface BtnProps {
  $cameraIndex?: number;
}

const Btn = styled.button<BtnProps>`
  align-items: center;
  margin: 10px auto;
  padding: 5px;
  color: black;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.3s;

  background-color: ${(props) =>
    props.$cameraIndex !== undefined &&
    props.$cameraIndex >= 0 &&
    props.$cameraIndex <= 9
      ? "white"
      : "gray"};
  pointer-events: ${(props) =>
    props.$cameraIndex !== undefined &&
    props.$cameraIndex >= 0 &&
    props.$cameraIndex <= 9
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

interface ToggleCmaeraBtnProps {
  icon: ReactNode; // Icon component (optional)
  onClick?: () => void; // Click event handler (optional)
  $cameraIndex: number | undefined;
}

const ToggleCmaeraBtn = ({
  icon,
  onClick,
  $cameraIndex,
}: ToggleCmaeraBtnProps) => {
  return (
    <Btn onClick={onClick} $cameraIndex={$cameraIndex}>
      {icon} {/* Render icon if provided */}
    </Btn>
  );
};

export default ToggleCmaeraBtn;

//***
//

//
//  */
