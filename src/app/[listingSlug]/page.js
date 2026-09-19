import CityListings from "../../react-pages/CityListings/CityListings";
import { parseCityListingPath } from "../../utils/seoConfig";

export const metadata = {
  title: "Commercial Properties for Rent in India | Abacus Spaces",
  description:
    "Explore premium commercial properties, office spaces, retail spaces, and managed workspaces for rent in Bangalore, Chennai, Coimbatore, and Hyderabad with Abacus Spaces.",
  alternates: {
    canonical: "/listings",
  },
};

export default async function Page({ params }) {
  const { listingSlug } = await params;
  const routeDetails = parseCityListingPath(listingSlug);

  return (
    <CityListings
      city={routeDetails?.citySlug || listingSlug}
      propertyType={routeDetails?.propertyType || "all"}
    />
  );
}