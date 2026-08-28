export {
  HISTORY_API_PATH,
  HISTORY_BRIEF,
  HISTORY_INDEX,
  HISTORY_LOG_HREF,
  HISTORY_NAV_ITEM,
  HISTORY_NEXT_DESKS,
  HISTORY_PHOTO_VIN_HREF,
  HISTORY_PLATE_API_PATH,
  HISTORY_ROUTE,
  HISTORY_STATUS_API_PATH,
} from "@/config/nav/history";
export { assembleDossier, requireVin } from "@/lib/history/dossier";
export {
  handleHistoryCatalog,
  handleHistoryLookup,
  handlePlateDecode,
  handlePlateStatus,
  historyCatalog,
} from "@/lib/history/http";
export {
  AUTOCHECK_PORTAL,
  AUTOCHECK_VIN_BASE,
  CARFAX_PORTAL,
  CARFAX_VIN_BASE,
  NICB_VINCHECK,
  NMVTIS_CONSUMERS,
  NMVTIS_EXPLAIN,
  NMVTIS_GOV,
  NMVTIS_HOME,
  autocheckPurchaseUrl,
  buildLinkOut,
  carfaxPurchaseUrl,
  nicbVincheckUrl,
  nmvtisLinks,
  photoVinLink,
  saferCarVinUrl,
} from "@/lib/history/links";
export { DECODER_SERIES_NOTE, DECODER_TRIM_NOTE, decoderOptions, optionsNote, vehicleHeadline } from "@/lib/history/options";
export {
  decodePlateToVin,
  envOn,
  hasPermissiblePurpose,
  normalizePlate,
  normalizeState,
  parsePlateInput,
  plateStatus,
} from "@/lib/history/plate";
export { HISTORY_SOURCE_LEDGER, TITLE_BRAND_INTRO, TITLE_BRAND_ROWS } from "@/lib/history/title";
export { eventsFromRecalls, eventsFromServiceLog, mergeHistoryTimeline } from "@/lib/history/timeline";
export {
  fetchVendorVinRecalls,
  mergeNameplateAndVendorRecalls,
  plateVendorKeysOn,
  vendorRecallKeyOn,
  VENDOR_RECALL_STAMP,
} from "@/lib/history/vendor-recalls";
export {
  HistoryError,
  HISTORY_STORAGE_LOG_KEY,
  PLATE_DARK_NOTE,
  PLATE_DPPA_CHECKBOX,
  PLATE_DPPA_NOTE,
  PLATE_VENDOR_KEY_NAMES,
} from "@/lib/history/types";
export type {
  HistoryCatalog,
  HistoryDossier,
  HistoryErrorBody,
  HistoryEvent,
  HistoryLane,
  HistoryLink,
  HistoryLinkOutBlock,
  HistoryLiveBlock,
  HistoryOptionField,
  HistoryPlateDecode,
  HistoryPlateProvider,
  HistoryPlateStatus,
  HistoryReportKind,
  HistorySourceRow,
  HistoryTitleRow,
} from "@/lib/history/types";
