import { siteUrl, work } from "@/lib/content";

export default function sitemap() {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...work.map((item) => ({
      url: `${siteUrl}/work/${item.slug}`,
      changeFrequency: "yearly",
      priority: 0.8,
    })),
  ];
}
