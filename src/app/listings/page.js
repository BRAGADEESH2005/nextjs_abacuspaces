import Listings from "../../react-pages/Listings/Listings";

export const metadata = {
  title: "Commercial Property Listings | Abacus Spaces",
  description:
    "Browse office, retail, hospitality, and healthcare properties from Abacus Spaces.",
  alternates: {
    canonical: "/listings",
  },
};

export default function Page() {
  return <Listings />;
}
