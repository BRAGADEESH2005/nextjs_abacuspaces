import CityListings from "../../react-pages/CityListings/CityListings";

export const metadata = {
  title: "Commercial Properties for Rent in India | Abacus Spaces",
  description:
    "Explore premium commercial properties, office spaces, retail spaces, and managed workspaces for rent in Bangalore, Chennai, Coimbatore, and Hyderabad with Abacus Spaces.",
  alternates: {
    canonical: "/listings",
  },
};

export default function Page() {
  return <CityListings />;
}