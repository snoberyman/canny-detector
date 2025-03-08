import styled from "styled-components";

interface SidebarProps {
  bgColor?: string; // bgColor is optional and should be a string (e.g., hex color)
}

const SidebarContainer = styled.div<SidebarProps>`
  background-color: ${(props) => props.bgColor || "#000"}; // fallback color
  height: 100%;
  width: 60px;
  position: fixed;
  left: 0;
  top: 0;
`;

const SideBar = () => {
  return (
    <>
      <SidebarContainer bgColor="#004643"></SidebarContainer>
    </>
  );
};

export default SideBar;
