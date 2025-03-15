import React, { useState } from "react";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: fixed;
  top: 25%;
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

const AlgorithmControl = ({ selectedAlgorithm }: AlgorithmControlProps) => {
  const [lowThreshold, setLowThreshold] = useState(0);
  const [highThreshold, setHighThreshold] = useState(255);
  const [ksize, setKsize] = useState(3);
  const [scale, setScale] = useState(1.0);

  const handleLowThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLowThreshold = Math.min(Number(e.target.value), highThreshold - 1);
    setLowThreshold(newLowThreshold);
  };

  const handleHighThresholdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newHighThreshold = Math.max(Number(e.target.value), lowThreshold + 1);
    setHighThreshold(newHighThreshold);
  };

  const handleKsizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKsize(Number(e.target.value));
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  return (
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
          <SliderLabel>Scale</SliderLabel>
          <Slider
            type="range"
            min={0.5}
            max={2.0}
            step={0.1}
            value={scale}
            onChange={handleScaleChange}
          />
          {scale}
        </>
      )}
    </Container>
  );
};

export default AlgorithmControl;
