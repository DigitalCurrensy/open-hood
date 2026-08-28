import {
  assembleClientPacket,
  persistPacket,
  type ClientReportInput,
} from "@/components/report/assemble-client";
import { packetToText } from "@/components/report/to-text";
import {
  REPORT_API_PATH,
  REPORT_DOWNLOAD_PATH,
  REPORT_PRINT_API_PATH,
  REPORT_PRINT_PATH,
  reportDownloadFilename,
  type ReportPacket,
} from "@/lib/report/packet";

export interface SubmitResult {
  packet: ReportPacket;
  printPath: string;
  fromApi: boolean;
}

export interface ReportApiResponse {
  packet?: ReportPacket;
  printPath?: string;
  error?: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/html" },
    body: JSON.stringify(body),
  });
}

/** POST current bay state to /api/report. Falls back to the client assembler if the API is not up. */
export async function submitFindings(extras: ClientReportInput = {}): Promise<SubmitResult> {
  const packet = assembleClientPacket(extras);
  persistPacket(packet);

  try {
    const response = await postJson(REPORT_API_PATH, {
      ...extras,
      packet,
      serviceLog: extras.serviceLog ?? packet.serviceLog,
    });
    if (response.ok) {
      const payload = (await response.json()) as ReportApiResponse;
      const next = payload.packet ? assembleClientPacket({ packet: payload.packet, mode: extras.mode }) : packet;
      persistPacket(next);
      return {
        packet: next,
        printPath: payload.printPath ?? "",
        fromApi: true,
      };
    }
  } catch {
    // API not landed yet — preview still works from session.
  }

  return { packet, printPath: "", fromApi: false };
}

export function downloadFindingsJson(packet: ReportPacket) {
  const filename = reportDownloadFilename(packet);
  const blob = new Blob([`${JSON.stringify(packet, null, 2)}\n`], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function downloadFindingsText(packet: ReportPacket) {
  const filename = reportDownloadFilename(packet).replace(/\.json$/i, ".txt");
  const blob = new Blob([`${packetToText(packet)}\n`], { type: "text/plain" });
  downloadBlob(blob, filename);
}

export async function tryDownloadJsonFromApi(packet: ReportPacket): Promise<boolean> {
  try {
    const response = await postJson(REPORT_DOWNLOAD_PATH, { packet });
    if (!response.ok) return false;
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("application/json") && !type.includes("octet-stream")) return false;
    const blob = await response.blob();
    if (blob.size < 8) return false;
    downloadBlob(blob, reportDownloadFilename(packet));
    return true;
  } catch {
    return false;
  }
}

async function htmlFromPrintRoute(packet: ReportPacket): Promise<string | null> {
  for (const url of [REPORT_PRINT_API_PATH, REPORT_PRINT_PATH]) {
    try {
      const response = await postJson(url, { packet });
      if (!response.ok) continue;
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("text/html")) continue;
      const html = await response.text();
      if (html.includes("<html") || html.includes("<!DOCTYPE")) return html;
    } catch {
      // try the next print URL
    }
  }
  return null;
}

function printHtmlDocument(html: string): boolean {
  const printer = window.open("", "_blank", "noopener,noreferrer");
  if (!printer) return false;
  printer.document.open();
  printer.document.write(html);
  printer.document.close();
  printer.focus();
  window.setTimeout(() => {
    printer.print();
  }, 250);
  return true;
}

/** Open sibling print HTML when it exists; otherwise print the on-page preview. */
export async function printFindings(packet: ReportPacket): Promise<"html" | "preview"> {
  const html = await htmlFromPrintRoute(packet);
  if (html && printHtmlDocument(html)) return "html";
  const previous = document.title;
  document.title = "Open Hood findings";
  window.print();
  window.setTimeout(() => {
    document.title = previous;
  }, 500);
  return "preview";
}
