import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { useDebounce } from "@/app/hooks/use-debounce";
import { AlertCircle, MapPin, Search } from "lucide-react";

// Initialize Mapbox with proper error handling
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface MapSelectorProps {
  onAddressSelect: (address: {
    fullAddress: string;
    coordinates: [number, number];
    postalCode: string;
    city: string;
    street: string;
  }) => void;
  selectedAddress?: {
    street: string;
    postalCode: string;
    city: string;
  };
}

export function MapSelector({ onAddressSelect, selectedAddress }: MapSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const debouncedSearchInput = useDebounce(searchInput, 300);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is available
    if (!MAPBOX_TOKEN) {
      setMapError(
        "Mapbox access token is missing. Please configure VITE_MAPBOX_ACCESS_TOKEN in your environment variables.",
      );
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [7.0, 51.0], // Default to Germany
        zoom: 5,
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError(`Error loading map: ${e.error?.message || "Unknown error"}`);
      });

      marker.current = new mapboxgl.Marker({
        color: "#FF0000",
        draggable: true,
      });

      // Add click event to map
      map.current.on("click", async (e) => {
        if (!marker.current || !map.current) return;

        const { lng, lat } = e.lngLat;

        // Add marker to map
        marker.current.setLngLat([lng, lat]).addTo(map.current);

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=address&language=de`,
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            processSelectedLocation(feature);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        }
      });

      // Handle marker drag end
      marker.current.on("dragend", async () => {
        if (!marker.current) return;
        const lngLat = marker.current.getLngLat();

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}&types=address&language=de`,
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            processSelectedLocation(feature);
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        `Error initializing map: ${(error as Error).message || "Unknown error"}`,
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Auto-search when input changes (after 3 characters)
  useEffect(() => {
    if (debouncedSearchInput.length >= 3) {
      searchAddress();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchInput]);

  // Search for addresses
  const searchAddress = async () => {
    if (!searchInput.trim() || searchInput.length < 3 || !MAPBOX_TOKEN) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput,
        )}.json?access_token=${MAPBOX_TOKEN}&country=de&types=address&language=de`,
      );
      const data = await response.json();

      if (data.features) {
        setSearchResults(data.features);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process selected location
  const processSelectedLocation = (feature: any) => {
    if (!map.current || !marker.current) return;

    const [lng, lat] = feature.center;

    // Add marker to map
    marker.current.setLngLat([lng, lat]).addTo(map.current);

    // Fly to location
    map.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      essential: true,
    });

    // Extract address components
    const postalCode =
      feature.context?.find((ctx: any) => ctx.id.startsWith("postcode"))?.text || "";
    const city =
      feature.context?.find((ctx: any) => ctx.id.startsWith("place"))?.text || "";
    const street = feature.text || "";
    const fullAddress = feature.place_name || "";

    // Update search input
    setSearchInput(fullAddress);

    // Pass address data to parent component
    onAddressSelect({
      fullAddress,
      coordinates: [lng, lat],
      postalCode,
      city,
      street,
    });

    setShowResults(false);
  };

  // Handle search result selection
  const handleResultClick = (feature: any) => {
    processSelectedLocation(feature);
    setSearchInput(feature.place_name);
  };

  // Set initial marker if address is provided
  useEffect(() => {
    if (selectedAddress && map.current && marker.current) {
      const addressString = `${selectedAddress.street}, ${selectedAddress.postalCode} ${selectedAddress.city}, Germany`;

      // Geocode the address to get coordinates
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          addressString,
        )}.json?access_token=${mapboxgl.accessToken}&country=de&types=address&language=de`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lng, lat] = feature.center;

            // Add marker to map
            marker.current?.setLngLat([lng, lat]).addTo(map.current!);

            // Fly to location
            map.current?.flyTo({
              center: [lng, lat],
              zoom: 16,
              essential: true,
            });

            // Update search input
            setSearchInput(feature.place_name);
          }
        })
        .catch((error) => {
          console.error("Error geocoding address:", error);
        });
    }
  }, [selectedAddress]);

  // Manual entry fallback
  const handleManualEntry = () => {
    // Use a default central Germany location
    onAddressSelect({
      fullAddress: searchInput,
      coordinates: [10.4515, 51.1657], // Center of Germany
      postalCode: "",
      city: "",
      street: searchInput,
    });
  };

  return (
    <div className="relative w-full">
      <div className="mb-4 flex">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Adresse suchen..."
          className="rounded-r-none"
          onKeyDown={(e) => e.key === "Enter" && searchAddress()}
        />
        <Button
          onClick={searchAddress}
          className="rounded-l-none"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showResults && searchResults.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full">
          <CardContent className="p-0">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="cursor-pointer p-3 hover:bg-muted flex items-center gap-2"
                onClick={() => handleResultClick(result)}
              >
                <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm">{result.place_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {mapError ? (
        <div className="w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">
              You can still enter an address manually and continue:
            </p>
            <Button onClick={handleManualEntry} variant="outline">
              Use Manual Address Entry
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div ref={mapContainer} className="h-[400px] w-full rounded-md border" />
          <div className="absolute bottom-3 left-3 bg-white/90 p-2 text-xs rounded shadow-sm">
            <p className="font-medium">Tipp:</p>
            <p>
              Klicken Sie auf die Karte oder ziehen Sie den Marker, um den Standort
              auszuwählen
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
