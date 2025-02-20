import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={29}
    height={29}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="M5 7H19" stroke="#ccc" strokeLinecap="round" />
    <Path d="M5 12H19" stroke="#ccc" strokeLinecap="round" />
    <Path d="M5 17H19" stroke="#ccc" strokeLinecap="round" />
  </Svg>
);
export default SVGComponent;
