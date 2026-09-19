import SpaceCalculator from "../../react-pages/SpaceCalculator/SpaceCalculator";

export const metadata = {
  title: "Space Calculator | Abacus Spaces",
  description:
    "Estimate your office space requirements with the Abacus Spaces space calculator.",
  alternates: {
    canonical: "/space-calculator",
  },
};

export default function Page() {
  return <SpaceCalculator />;
}
