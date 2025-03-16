import { Card, CardContent } from "@/app/components/ui/card";

interface PropertyCardProps {
  property: {
    address: string;
    postalCode: string;
    city: string;
    energyRating: string;
    owner: string;
    latitude?: number;
    longitude?: number;
  };
}

// Function to generate static Mapbox image URL
function generateMapboxStaticImage(property: PropertyCardProps["property"]) {
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const latitude = property.latitude || 0;
  const longitude = property.longitude || 0;
  const zoom = 15;
  const width = 300;
  const height = 128;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+${encodeURIComponent(getEnergyRatingColor(property.energyRating).replace("bg-", ""))}(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}?access_token=${mapboxAccessToken}`;
}

// Helper function for energy rating colors
function getEnergyRatingColor(rating: string) {
  // Implement your color logic here
  const ratings = {
    A: "bg-green-500",
    B: "bg-green-400",
    C: "bg-yellow-400",
    D: "bg-yellow-500",
    E: "bg-orange-400",
    F: "bg-orange-500",
    G: "bg-red-500",
  };

  return ratings[rating] || "bg-gray-500";
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-muted">
        <div
          className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white ${getEnergyRatingColor(property.energyRating)}`}
        >
          {property.energyRating}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 p-2 text-xs">
          {property.owner}
        </div>
        <img
          src={generateMapboxStaticImage(property)}
          alt={`Map view of ${property.address}`}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium">{property.address}</h3>
        <p className="text-sm text-muted-foreground">
          {property.postalCode} {property.city}
        </p>
      </CardContent>
    </Card>
  );
}
