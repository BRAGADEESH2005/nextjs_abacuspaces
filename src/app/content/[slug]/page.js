import { notFound } from "next/navigation";
import DetailedReport from "../../../react-pages/DetailedReport/DetailedReport";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function getContent(slug) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/content/slug/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: 300,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    return {
      title: "Content Not Found | Abacus Spaces",
      description:
        "The content you're looking for doesn't exist or has been removed.",
    };
  }

  return {
    title: `${content.title} | Abacus Spaces`,
    description:
      content.description ||
      content.excerpt ||
      `Read ${content.title} on Abacus Spaces.`,
    alternates: {
      canonical: `/content/${slug}`,
    },
    openGraph: {
      title: `${content.title} | Abacus Spaces`,
      description:
        content.description ||
        content.excerpt ||
        `Read ${content.title} on Abacus Spaces.`,
      url: `/content/${slug}`,
      type: "article",
      ...(content.image?.url && {
        images: [
          {
            url: content.image.url,
            alt: content.title,
          },
        ],
      }),
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;

  const content = await getContent(slug);

  if (!content) {
    notFound();
  }

  return <DetailedReport slug={slug} initialContent={content} />;
}
