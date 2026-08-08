/**
 * TypeScript types for Books / Resources feature.
 */

export interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  imageLinks?: { smallThumbnail?: string; thumbnail?: string };
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBookSearchResult {
  items?: GoogleBookItem[];
  totalItems: number;
}

export interface ResourceBase {
  title: string;
  author?: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  published_year?: number;
  cover_url?: string;
  google_books_id?: string;
}

export interface ResourceResponse extends ResourceBase {
  id: string;
  copies_total: number;
  copies_available: number;
  created_at: string;
  updated_at: string;
}

export interface BookCopy {
  id: string;
  resource_id: string;
  barcode: string;
  status: string;
  created_at: string;
  updated_at: string;
}
