export interface AssistantToolDefinition {
  name: string;
  description: string;
  enabled: boolean;
}

export const assistantTools: AssistantToolDefinition[] = [
  {
    name: "getUserVettingStatus",
    description:
      "Returns the current vetting or approval status for the logged-in user.",
    enabled: false,
  },
  {
    name: "getJobDetails",
    description:
      "Returns structured details for a specific job so the assistant can explain the scope or status more accurately.",
    enabled: false,
  },
  {
    name: "findNearbyPaintStores",
    description:
      "Finds nearby paint stores based on the user's location.",
    enabled: false,
  },
  {
    name: "estimatePaintMaterials",
    description:
      "Returns a rough paint-material estimate based on scope inputs like square footage, surfaces, coats, and prep assumptions.",
    enabled: false,
  },
  {
    name: "estimateJobPrice",
    description:
      "Returns a rough contractor-side price estimate based on scope, region, prep, surfaces, and timeline assumptions.",
    enabled: false,
  },
  {
    name: "navigateToPage",
    description:
      "Navigates the user to a supported page or suggests the correct in-app destination.",
    enabled: false,
  },
];