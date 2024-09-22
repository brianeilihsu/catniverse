import { useState } from "react";
import Header from "../Header/Header";

function Map() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Header />
    </div>
  );
}

export default Map;
