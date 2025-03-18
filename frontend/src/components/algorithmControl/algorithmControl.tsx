import React, { useState } from "react";
import styled from "styled-components";
import { useAppContext } from "../../context/useAppContext";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: fixed;
  top: 20%;
  right: 3%;
`;

const SliderLabel = styled.label`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  width: 200px;
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  margin-bottom: 0px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #666;
    cursor: pointer;
  }
`;

interface AlgorithmControlProps {
  selectedAlgorithm: number;
}
// algorithms-params apertureSize, L2gradient,
const AlgorithmControl = ({ selectedAlgorithm }: AlgorithmControlProps) => {
  const { cameraStatus } = useAppContext();
  const [lowThreshold, setLowThreshold] = useState(100);
  const [highThreshold, setHighThreshold] = useState(200);
  const [L2gradient, setL2gradient] = useState(false);
  const [ksize, setKsize] = useState(3);
  const [delta, setdelta] = useState(0);

  const handleLowThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLowThreshold = Math.min(Number(e.target.value), highThreshold - 1);
    setLowThreshold(newLowThreshold);
    window.electronAPI.algorithmsParmas(
      "algorithms-params",
      newLowThreshold,
      highThreshold,
      L2gradient,
      ksize,
      delta
    );
  };

  const handleHighThresholdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newHighThreshold = Math.max(Number(e.target.value), lowThreshold + 1);
    setHighThreshold(newHighThreshold);
    window.electronAPI.algorithmsParmas(
      "algorithms-params",
      lowThreshold,
      newHighThreshold,
      L2gradient,
      ksize,
      delta
    );
  };

  const handleL2gradientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setL2gradient(Number(e.target.value) ? true : false);
    window.electronAPI.algorithmsParmas(
      "algorithms-params",
      lowThreshold,
      highThreshold,
      L2gradient,
      ksize,
      delta
    );
  };

  const handleKsizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKsize(Number(e.target.value));
    window.electronAPI.algorithmsParmas(
      "algorithms-params",
      lowThreshold,
      highThreshold,
      L2gradient,
      ksize,
      delta
    );
  };

  const handledeltaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setdelta(parseFloat(e.target.value));
    window.electronAPI.algorithmsParmas(
      "algorithms-params",
      lowThreshold,
      highThreshold,
      L2gradient,
      ksize,
      delta
    );
  };

  return cameraStatus ? (
    <Container>
      {selectedAlgorithm === 0 ? (
        <>
          <SliderLabel>Low Threshold</SliderLabel>
          <Slider
            type="range"
            min={0}
            max={255}
            value={lowThreshold}
            onChange={handleLowThresholdChange}
          />{" "}
          {lowThreshold}
          <SliderLabel>High Threshold</SliderLabel>
          <Slider
            type="range"
            min={lowThreshold + 1}
            max={255}
            value={highThreshold}
            onChange={handleHighThresholdChange}
          />
          {highThreshold}
          <SliderLabel>L2gradient</SliderLabel>
          <Slider
            type="range"
            min={0}
            max={1}
            step={1}
            value={L2gradient ? 1 : 0}
            onChange={handleL2gradientChange}
          />
          {L2gradient ? "True" : "False"}
        </>
      ) : (
        <>
          <SliderLabel>Ksize</SliderLabel>
          <Slider
            type="range"
            min={1}
            max={23}
            step={2}
            value={ksize}
            onChange={handleKsizeChange}
          />
          {ksize}
          <SliderLabel>delta</SliderLabel>
          <Slider
            type="range"
            min={0}
            max={255}
            step={1}
            value={delta}
            onChange={handledeltaChange}
          />
          {delta}
        </>
      )}
    </Container>
  ) : (
    ""
  );
};

export default AlgorithmControl;
