"use client";

import { TestimonialGlobe } from "@/components/ui/testimonial-globe";
import type { GlobeTestimonial } from "@/components/ui/testimonial-globe";

// SafeHer Global Solo Women Travellers & Verified Guardians Network
export const SAFEHER_GLOBE_REVIEWS: GlobeTestimonial[] = [
  {
    id: "new-delhi",
    quote: "The live journey tracking gave me complete peace of mind during late-night cab rides from Connaught Place to South Extension.",
    name: "Priya Sharma",
    role: "Solo Traveller & Engineer",
    company: "SafeHer Community",
    city: "New Delhi",
    country: "IN",
    lat: 28.61,
    lng: 77.21,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 5,
    tone: 1,
  },
  {
    id: "paris",
    quote: "Exploring Paris solo felt empowering knowing verified community guardians and 24/7 safe havens were mapped in real-time.",
    name: "Camille Laurent",
    role: "Travel Photographer",
    company: "Wanderlust Studio",
    city: "Paris",
    country: "FR",
    lat: 48.85,
    lng: 2.35,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    rating: 5,
    tone: 2,
  },
  {
    id: "london",
    quote: "The 3-second accidental SOS cancellation gave me confidence. A true digital safety net, not just a panic button.",
    name: "Emma Watson",
    role: "Tech Consultant",
    company: "Global Nomad",
    city: "London",
    country: "GB",
    lat: 51.51,
    lng: -0.13,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    rating: 5,
    tone: 3,
  },
  {
    id: "sao-paulo",
    quote: "My family tracked my ride live via the web link without needing an app install. SafeHer made my solo South America trip worry-free.",
    name: "Beatriz Silva",
    role: "Solo Backpacker",
    company: "Explorer",
    city: "São Paulo",
    country: "BR",
    lat: -23.55,
    lng: -46.63,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    rating: 5,
    tone: 4,
  },
  {
    id: "toronto",
    quote: "The AI safety assistant gave me instant neighborhood security advice before I even checked into my downtown hostel.",
    name: "Maya Patel",
    role: "Graduate Researcher",
    company: "U of T",
    city: "Toronto",
    country: "CA",
    lat: 43.65,
    lng: -79.38,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    rating: 5,
    tone: 5,
  },
  {
    id: "tokyo",
    quote: "The multilingual emergency phrasebook and SOS dispatch helped me feel secure walking back late from Shibuya station.",
    name: "Aoi Tanaka",
    role: "Cultural Journalist",
    company: "Tokyo Press",
    city: "Tokyo",
    country: "JP",
    lat: 35.68,
    lng: 139.69,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    rating: 5,
    tone: 1,
  },
  {
    id: "sydney",
    quote: "The safety arrival timer automatically checked in on me after my night walk. Best safety ecosystem I have ever used.",
    name: "Chloe Davis",
    role: "Solo Adventurer",
    company: "Coastal Trails",
    city: "Sydney",
    country: "AU",
    lat: -33.87,
    lng: 151.21,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    tone: 2,
  },
  {
    id: "cape-town",
    quote: "SafeHer verified safe places pointed me straight to 24/7 medical assistance and verified security desks.",
    name: "Zola Ndlovu",
    role: "Medical Volunteer",
    company: "Red Cross Affiliate",
    city: "Cape Town",
    country: "ZA",
    lat: -33.93,
    lng: 18.42,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
    rating: 5,
    tone: 3,
  },
];

export function TestimonialGlobeDemo({ autoplay = true }: { autoplay?: boolean }) {
  return (
    <div data-globe-demo className="flex min-h-[600px] w-full items-center justify-center bg-background text-foreground py-12">
      <TestimonialGlobe
        items={SAFEHER_GLOBE_REVIEWS}
        eyebrow="Global Guardian & Solo Traveller Network"
        heading="Trusted by Solo Women Travellers Worldwide."
        caption="From New Delhi to Paris and Tokyo — real community guardians and travellers connecting for safer journeys."
        autoplay={autoplay}
        interval={3500}
        action={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore Guardian Network
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h9.5M8.5 4l4 4-4 4" />
            </svg>
          </button>
        }
      />
    </div>
  );
}

export default TestimonialGlobeDemo;

