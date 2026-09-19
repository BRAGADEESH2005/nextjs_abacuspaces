import CityListings from "../../../react-pages/CityListings/CityListings";
import { notFound } from "next/navigation";

const CITIES_SEO_DATA = {
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    seoTitle:
      "Office Space for Rent in Bangalore | Coworking & Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find premium office spaces for rent in Bangalore. Explore coworking spaces, managed offices, and commercial office spaces in prime business locations with Abacus Spaces.",
    keywords:
      "office space for rent in bangalore, commercial office space bangalore, coworking space bangalore, managed office bangalore, office lease bangalore",
  },

  coimbatore: {
    name: "Coimbatore",
    state: "Tamil Nadu",
    seoTitle:
      "Office Space for Rent in Coimbatore | Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find affordable office spaces for rent in Coimbatore. Explore managed offices, coworking spaces, and commercial office spaces for startups and enterprises.",
    keywords:
      "office space for rent in coimbatore, commercial office space coimbatore, coworking space coimbatore, managed office coimbatore, office lease coimbatore",
  },

  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    seoTitle:
      "Office Space for Rent in Hyderabad | Commercial Offices | Abacus Spaces",
    seoDescription:
      "Explore premium office spaces for rent in Hyderabad. Compare coworking spaces, managed offices, and commercial office spaces in leading business hubs.",
    keywords:
      "office space for rent in hyderabad, commercial office space hyderabad, coworking space hyderabad, managed office hyderabad, office lease hyderabad",
  },

  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    seoTitle:
      "Office Space for Rent in Chennai | Coworking & Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find premium office spaces for rent in Chennai. Compare managed offices, coworking spaces, and commercial office spaces in prime business locations with Abacus Spaces.",
    keywords:
      "office space for rent in chennai, commercial office space chennai, coworking space chennai, managed office chennai, office lease chennai",
  },
};

export async function generateMetadata({ params }) {
  const { city } = await params;

  const citySlug = city?.toLowerCase();
  const cityData = CITIES_SEO_DATA[citySlug];

  if (!cityData) {
    return {
      title: "City Not Found | Abacus Spaces",
      description: "The requested city could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: cityData.seoTitle,

    description: cityData.seoDescription,

    keywords: cityData.keywords,

    alternates: {
      canonical: `/locations/${citySlug}`,
    },

    openGraph: {
      title: cityData.seoTitle,
      description: cityData.seoDescription,
      url: `/locations/${citySlug}`,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: cityData.seoTitle,
      description: cityData.seoDescription,
    },
  };
}

export default async function Page({ params }) {
  const { city } = await params;

  const citySlug = city?.toLowerCase();

  if (!CITIES_SEO_DATA[citySlug]) {
    notFound();
  }

  return <CityListings city={citySlug} />;
}