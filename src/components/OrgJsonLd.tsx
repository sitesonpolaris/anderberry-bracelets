import { site } from "@/lib/site";

export default function OrgJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}/og.jpg`,
    email: site.email,
    foundingDate: String(site.founded),
    founders: [{ "@type": "Person", name: "Amy Anderson" }, { "@type": "Person", name: "Aaron Anderson" }],
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
    sameAs: Object.values(site.social),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
