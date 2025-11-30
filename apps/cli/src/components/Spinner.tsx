import { Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

interface SpinnerComponentProps {
  label?: string;
  type?:
    | "dots"
    | "dots2"
    | "dots3"
    | "line"
    | "pipe"
    | "simpleDots"
    | "simpleDotsScrolling"
    | "star"
    | "arrow"
    | "balloon"
    | "noise"
    | "bounce"
    | "boxBounce"
    | "circle"
    | "squareCorners"
    | "circleQuarters"
    | "circleHalves"
    | "arc"
    | "bouncingBar"
    | "bouncingBall"
    | "smiley"
    | "monkey"
    | "hearts"
    | "clock"
    | "earth"
    | "moon"
    | "runner"
    | "pong"
    | "shark"
    | "dqpb"
    | "aesthetic"
    | "material"
    | "layer"
    | "betaWave"
    | "fingerDance"
    | "fistBump"
    | "soccerHeader"
    | "mindblown"
    | "speaker"
    | "orangePulse"
    | "bluePulse"
    | "orangeBluePulse"
    | "timeTravel"
    | "weather"
    | "christmas"
    | "grenade"
    | "point"
    | "layer2";
}

export const SpinnerComponent: React.FC<SpinnerComponentProps> = ({
  label,
  type = "dots",
}) => {
  return (
    <Text color="cyan">
      <Spinner type={type} /> {label}
    </Text>
  );
};
