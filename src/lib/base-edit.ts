interface BaseEditSource {
  name: string;
  lat?: number;
  lng?: number;
  maintenance_mode: boolean;
}

export interface BaseEditDefaults {
  name: string;
  lat: string;
  lng: string;
  maintenance: boolean;
}

export function validateBaseEditName(name: string): string | null {
  return name.trim() ? null : "Base name is required.";
}

export function validateBaseEditCoordinates({
  lat,
  lng,
  hadCoordinates,
  hasInvalidInput,
}: {
  lat: string;
  lng: string;
  hadCoordinates: boolean;
  hasInvalidInput: boolean;
}): string | null {
  const trimmedLat = lat.trim();
  const trimmedLng = lng.trim();

  if (hasInvalidInput) {
    return "Enter valid coordinates.";
  }

  if (!trimmedLat && !trimmedLng) {
    return hadCoordinates ? "Coordinates cannot be cleared from this form." : null;
  }

  if (!trimmedLat || !trimmedLng) {
    return "Enter both latitude and longitude.";
  }

  if (Number.isNaN(Number(trimmedLat)) || Number.isNaN(Number(trimmedLng))) {
    return "Enter valid coordinates.";
  }

  return null;
}

export function getBaseEditDefaults(base: BaseEditSource): BaseEditDefaults {
  return {
    name: base.name,
    lat: base.lat?.toString() ?? "",
    lng: base.lng?.toString() ?? "",
    maintenance: base.maintenance_mode,
  };
}
