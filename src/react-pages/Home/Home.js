import Hero from "../../components/Hero/Hero";
import Services from "../../components/Services/Services";
import WhyAbacus from "../../components/WhyAbacus/WhyAbacus";
import CallToAction from "../../components/CallToAction/CallToAction";
import ResidentialBanner from "../../components/ResidentialBanner/ResidentialBanner";
import LatestInRealEstate from "../../components/LatestInRealEstate/LatestInRealEstate";
import RegionsMapWrapper from "../../components/RegionsMap/RegionsMapWrapper";
import {
  organizationSchema,
  generateBreadcrumbSchema,
} from "../../utils/seoConfig";

const Home = () => {
  const breadcrumbs = [{ name: "Home", url: "/" }];

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}
      </script>

      <Hero />
      <LatestInRealEstate />
      <WhyAbacus />
      <RegionsMapWrapper />
      <ResidentialBanner />
      <Services />
      <CallToAction />
    </>
  );
};

export default Home;
