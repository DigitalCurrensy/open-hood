export {
  REPORT_API_PATH,
  REPORT_DESK_HREFS,
  REPORT_DOWNLOAD_PATH,
  REPORT_NEXT_DESKS,
  REPORT_PATH,
  REPORT_PRINT_API_PATH,
  REPORT_PRINT_PATH,
  buildReportPacket,
  hasVehicleIdentity,
  isReportDeskHref,
  isReportMode,
  normalizeReportMode,
  reportDownloadFilename,
  vehicleHeadline,
} from "@/lib/report/packet";
export type {
  ReportCode,
  ReportDesk,
  ReportDeskHref,
  ReportFluids,
  ReportMode,
  ReportPacket,
  ReportPacketInput,
  ReportQuote,
  ReportServiceLogRow,
  ReportSymptom,
  ReportVehicle,
} from "@/lib/report/packet";
export { renderReportHtml, printTitle } from "@/lib/report/html";
export {
  ReportRequestError,
  handleReportBuild,
  handleReportDownload,
  handleReportPrint,
  inputFromSearchParams,
  inputFromUnknown,
  readReportInput,
} from "@/lib/report/http";
