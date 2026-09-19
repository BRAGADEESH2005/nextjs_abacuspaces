import LatestInRealEstateClient from "./LatestInRealEstateClient";

const LatestInRealEstate = async () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  let allContentData = [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/content?status=Published&limit=100&sort=-date`,
      {
        next: {
          revalidate: 300,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();

      if (result.success) {
        allContentData = result.data;
      }
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  }

  return <LatestInRealEstateClient allContentData={allContentData} />;
};

export default LatestInRealEstate;