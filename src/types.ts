export interface NotionConfig {
  token: string;
  userId: string;
  spaceId: string;
  /**
   * User-Agent sent on api/v3 and file requests. Optional everywhere and there is no
   * built-in default: loadConfig() resolves it from NOTION_USER_AGENT → config.json,
   * and when neither is set no User-Agent header is sent at all — Node's default goes
   * out and Cloudflare's bot check answers 403, rather than the server silently
   * impersonating a browser on the user's behalf.
   */
  userAgent?: string;
}

export interface NotionBlock {
  id: string;
  type: string;
  properties: Record<string, any>;
  format?: Record<string, any>;
  after?: string;
  children?: NotionBlock[];
  imageUpload?: { localPath: string; name: string; contentType: string; bytes: number };
}

export type RichTextSegment = [string] | [string, Array<[string, string?]>];

export interface NotionRawBlock {
  id: string;
  type: string;
  properties?: {
    title?: RichTextSegment[];
    checked?: [["Yes"]] | [["No"]];
    language?: [[string]];
    source?: [[string]];
    [key: string]: any;
  };
  content?: string[];
  format?: {
    page_icon?: string;
    table_block_column_order?: string[];
    [key: string]: any;
  };
}

export type BlockMap = Record<string, { value: NotionRawBlock }>;
