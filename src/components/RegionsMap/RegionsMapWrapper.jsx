"use client";

import dynamic from "next/dynamic";

const RegionsMap = dynamic(() => import("./RegionsMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default function RegionsMapWrapper() {
  return <RegionsMap />;
}