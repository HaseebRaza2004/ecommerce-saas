export const COUNTRIES_DATA = Object.freeze([
  { code: "PK", label: "Pakistan", dbRegion: "asia-east" },
  { code: "AE", label: "United Arab Emirates", dbRegion: "asia-east" },
  { code: "SA", label: "Saudi Arabia", dbRegion: "asia-east" },
  { code: "QA", label: "Qatar", dbRegion: "asia-east" },
  { code: "KW", label: "Kuwait", dbRegion: "asia-east" },
  { code: "OM", label: "Oman", dbRegion: "asia-east" },
  { code: "MY", label: "Malaysia", dbRegion: "asia-east" },
  { code: "SG", label: "Singapore", dbRegion: "asia-east" },
  { code: "GB", label: "United Kingdom", dbRegion: "eu-central" },
  { code: "DE", label: "Germany", dbRegion: "eu-central" },
  { code: "FR", label: "France", dbRegion: "eu-central" },
  { code: "TR", label: "Turkey", dbRegion: "eu-central" },
  { code: "US", label: "United States", dbRegion: "us-east" },
  { code: "CA", label: "Canada", dbRegion: "us-east" },
  { code: "AU", label: "Australia", dbRegion: "asia-east" },
]);

export function getRegionForCountry(countryCode) {
  return (
    COUNTRIES_DATA.find((c) => c.code === countryCode)?.dbRegion || "asia-east"
  );
};