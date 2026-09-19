"use client";

import dynamic from "next/dynamic";

const Footer = dynamic(() => import("./Footer"), {
  ssr: false,
});

export default function FooterShell() {
  return <Footer />;
}
