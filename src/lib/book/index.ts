export { BOOK_API_PATH, BOOK_BRIEF, BOOK_NAV_ITEM, BOOK_NEXT_DESKS, BOOK_ROUTE } from "@/config/nav/book";
export { BOOK_COMPARE_LINE, BOOK_RIVALS } from "@/lib/book/compare";
export { dealerAppointmentLinks, matchDealerPattern } from "@/lib/book/dealers";
export { handleBookStatus, handleBookSubmit } from "@/lib/book/http";
export { bookMailerStatus, canSendBookEmail } from "@/lib/book/mail";
export { bookStorePath } from "@/lib/book/store";
export { bookDirectoryHref, bookNextDesks, buildBookSummary } from "@/lib/book/summary";
export {
  BOOK_DISPATCH_LINE,
  BOOK_JOBS,
  BOOK_MAX_NOTES,
  BOOK_VENUES,
  BOOK_WINDOWS,
  BookError,
} from "@/lib/book/types";
export type {
  BookBoardRow,
  BookDealerLink,
  BookDelivery,
  BookDraft,
  BookErrorBody,
  BookJob,
  BookMailerStatus,
  BookRequest,
  BookSubmitResult,
  BookSummary,
  BookVenue,
  BookWindow,
} from "@/lib/book/types";
export { emptyBookDraft, parseBookBody, validateBook } from "@/lib/book/validate";
export { BOOK_SHOP_VENDORS, BOOK_VENDOR_LINE } from "@/lib/book/vendors";
