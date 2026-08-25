export type JobRole = "owner" | "DIY" | "tech" | "service-writer";

export type JobFamily =
  | "fluids"
  | "filters"
  | "brakes"
  | "tires"
  | "battery"
  | "obd"
  | "lights"
  | "wipers"
  | "ignition"
  | "jacking"
  | "buying-used"
  | "shop-talk"
  | "ev";

export interface YoutubeMeta {
  videoId: string;
  title: string;
  channel: string;
  whyThisVideo: string;
}

export interface Guide {
  id: string;
  title: string;
  plainEnglish: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeEstimate: string;
  toolsNeeded: string[];
  partsNeeded: string[];
  safetyNotes: string[];
  steps: string[];
  youtube: YoutubeMeta;
  relatedSymptomIds: string[];
  relatedPartTypes: string[];
  jobRoles: JobRole[];
  jobFamily: JobFamily;
  diySafe: boolean;
  shopSentence: string;
  askAtTheShop: string;
  verified: boolean;
}

export interface GuideFilters {
  q?: string;
  part?: string;
  job?: string;
  difficulty?: string;
  diy?: string;
}

export interface RelatedYoutubeVideo {
  videoId: string;
  title: string;
  channel: string;
  url: string;
}
