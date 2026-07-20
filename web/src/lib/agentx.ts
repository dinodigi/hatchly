/**
 * AgentX delivery-API client for "Hatchly" — GENERATED CODE.
 * Regenerate with the get_client_code MCP tool after any schema change;
 * do not edit by hand.
 *
 * Usage:
 *   const ax = createClient({ token: process.env.AGENTX_DELIVERY_TOKEN! });
 *   const rows = await ax.messages.list();
 *
 * The token is a delivery-scoped project token — keep it server-side.
 * Collections with authenticated/owner access rules also need the signed-in
 * user's JWT: call ax.setUserToken(jwt) (sent as X-User-Token).
 * Errors throw AgentXError with the HTTP status, the server's message, and a
 * stable machine code (E_VALIDATION, E_AUTH, E_NOT_FOUND, E_RATE_LIMITED, …).
 */

const DEFAULT_BASE_URL = "https://pluggie.app/api/v1";

export interface AgentXClientOptions {
  /** Delivery API base; defaults to the deployment this client was generated from. */
  baseUrl?: string;
  /** Delivery-scoped project token (agx_...). */
  token: string;
  /** End-user JWT for authenticated/owner collections. */
  userToken?: string | null;
}

export class AgentXError extends Error {
  constructor(readonly status: number, message: string, readonly code?: string) {
    super(message);
    this.name = "AgentXError";
  }
}

/** One change from the realtime feed. `data` holds only publicRead fields;
 *  kind:"deleted" carries no data. Treat an unknown id as an upsert. */
export interface ChangeEvent {
  cursor: string;
  collection: string;
  id: string;
  kind: "created" | "updated" | "deleted";
  at: string;
  changedFields?: string[];
  data?: Record<string, unknown>;
}

/** messages — write shape (relations/assets by id; "owner_id" is stamped server-side). */
export interface MessagesCreate {
  chat: string;
  role: "user" | "assistant";
  content: string;
  turn: number;
  tool_trace?: unknown[];
  attachment_type?: "link" | "voice" | "file";
  attachment_url?: string;
  attachment_file?: string;
  created_at?: string;
}
export type MessagesUpdate = Partial<MessagesCreate>;

/** artifacts — write shape (relations/assets by id; "owner_id" is stamped server-side). */
export interface ArtifactsCreate {
  idea: string;
  type: "brief" | "problem" | "icp" | "positioning" | "mvp" | "pricing" | "landing" | "competitive" | "gtm" | "brand";
  title: string;
  subtitle?: string;
  is_brief?: boolean;
  on_public_page?: boolean;
  body?: unknown[];
  generated_by_agent?: boolean;
  updated_at?: string;
  created_at?: string;
}
export type ArtifactsUpdate = Partial<ArtifactsCreate>;

/** quick_ideas — public view; only publicRead fields are ever returned. */
export interface QuickIdeas {
  id: string;
  author: { id: string; label: string };
  title: string;
  description?: string;
  tag?: string;
  upvotes: number;
  comment_count: number;
  cloned_count: number;
  created_at?: string;
}
export interface QuickIdeasListOpts {
  /** Equality filters on public fields. */
  filter?: {
    author?: string;
    title?: string;
    description?: string;
    tag?: string;
    upvotes?: number;
    comment_count?: number;
    cloned_count?: number;
    created_at?: string;
  };
  sort?: { field: "author" | "title" | "description" | "tag" | "upvotes" | "comment_count" | "cloned_count" | "created_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** users — public view; only publicRead fields are ever returned. */
export interface Users {
  id: string;
  handle: string;
  name: string;
  avatar?: { id: string; url: string; contentType: string };
  avatar_initials?: string;
  avatar_color?: string;
  bio?: string;
  created_at?: string;
}
export interface UsersListOpts {
  /** Equality filters on public fields. */
  filter?: {
    handle?: string;
    name?: string;
    avatar?: string;
    avatar_initials?: string;
    avatar_color?: string;
    bio?: string;
    created_at?: string;
  };
  sort?: { field: "handle" | "name" | "avatar" | "avatar_initials" | "avatar_color" | "bio" | "created_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}
/** users — write shape (relations/assets by id; "clerk_user_id" is stamped server-side). */
export interface UsersCreate {
  handle: string;
  name: string;
  avatar?: string;
  avatar_initials?: string;
  avatar_color?: string;
  bio?: string;
  email: string;
  email_verified?: boolean;
  suspended?: boolean;
  role: "member" | "moderator" | "admin";
  created_at?: string;
}
export type UsersUpdate = Partial<UsersCreate>;

/** ideas — write shape (relations/assets by id; "owner_id" is stamped server-side). */
export interface IdeasCreate {
  author: string;
  name: string;
  slug?: string;
  one_liner?: string;
  description?: string;
  stage: "ideation" | "public" | "build";
  visibility: "private" | "link" | "public";
  brief?: Record<string, unknown>;
  cover_preset?: "meadow" | "linen" | "dusk" | "gold" | "slate";
  cover_image?: string;
  tags?: unknown[];
  live_url?: string;
  archived?: boolean;
  from_quick_idea?: string;
  last_activity_at?: string;
  created_at?: string;
}
export type IdeasUpdate = Partial<IdeasCreate>;

/** listings — public view; only publicRead fields are ever returned. */
export interface Listings {
  id: string;
  author: { id: string; label: string };
  name: string;
  slug?: string;
  one_liner?: string;
  description?: string;
  category?: string;
  tags?: unknown[];
  cover_preset?: "meadow" | "linen" | "dusk" | "gold" | "slate";
  cover_image?: { id: string; url: string; contentType: string };
  live_url?: string;
  brief_snapshot?: Record<string, unknown>;
  bucks_total: number;
  bucks_window: number;
  bucks_today: number;
  backers_count: number;
  distinct_backers: number;
  rank_score: number;
  spark?: unknown[];
  published_at?: string;
}
export interface ListingsListOpts {
  /** Equality filters on public fields. */
  filter?: {
    author?: string;
    name?: string;
    slug?: string;
    one_liner?: string;
    category?: string;
    tags?: unknown[];
    cover_preset?: "meadow" | "linen" | "dusk" | "gold" | "slate";
    cover_image?: string;
    live_url?: string;
    brief_snapshot?: Record<string, unknown>;
    bucks_total?: number;
    bucks_window?: number;
    bucks_today?: number;
    backers_count?: number;
    distinct_backers?: number;
    rank_score?: number;
    spark?: unknown[];
    published_at?: string;
  };
  sort?: { field: "author" | "name" | "slug" | "one_liner" | "description" | "category" | "tags" | "cover_preset" | "cover_image" | "live_url" | "brief_snapshot" | "bucks_total" | "bucks_window" | "bucks_today" | "backers_count" | "distinct_backers" | "rank_score" | "spark" | "published_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** stakes — public view; only publicRead fields are ever returned. */
export interface Stakes {
  id: string;
  backer: { id: string; label: string };
  listing: { id: string; label: string };
  amount: number;
  created_at?: string;
}
export interface StakesListOpts {
  /** Equality filters on public fields. */
  filter?: {
    backer?: string;
    listing?: string;
    amount?: number;
    created_at?: string;
  };
  sort?: { field: "backer" | "listing" | "amount" | "created_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** quick_comments — public view; only publicRead fields are ever returned. */
export interface QuickComments {
  id: string;
  quick_idea: { id: string; label: string };
  author: { id: string; label: string };
  text: string;
  created_at?: string;
}
export interface QuickCommentsListOpts {
  /** Equality filters on public fields. */
  filter?: {
    quick_idea?: string;
    author?: string;
    text?: string;
    created_at?: string;
  };
  sort?: { field: "quick_idea" | "author" | "text" | "created_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** spotlight_bids — public view; only publicRead fields are ever returned. */
export interface SpotlightBids {
  id: string;
  bidder: { id: string; label: string };
  listing: { id: string; label: string };
  amount: number;
  status: "escrowed" | "active" | "expired" | "refunded";
  window_start?: string;
  window_end?: string;
  created_at?: string;
}
export interface SpotlightBidsListOpts {
  /** Equality filters on public fields. */
  filter?: {
    bidder?: string;
    listing?: string;
    amount?: number;
    status?: "escrowed" | "active" | "expired" | "refunded";
    window_start?: string;
    window_end?: string;
    created_at?: string;
  };
  sort?: { field: "bidder" | "listing" | "amount" | "status" | "window_start" | "window_end" | "created_at"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** chats — write shape (relations/assets by id; "owner_id" is stamped server-side). */
export interface ChatsCreate {
  idea: string;
  title: string;
  refining_memory_id?: string;
  last_message_at?: string;
  created_at?: string;
}
export type ChatsUpdate = Partial<ChatsCreate>;

/** reports — write shape (relations/assets by id; "reporter_id" is stamped server-side). */
export interface ReportsCreate {
  target_kind: "listing" | "quick_idea" | "comment" | "feedback" | "user";
  target_id: string;
  reason: "spam" | "abuse" | "impersonation" | "collusion" | "other";
  detail?: string;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  resolution_note?: string;
  created_at?: string;
}
export type ReportsUpdate = Partial<ReportsCreate>;

/** spotlight — public view; only publicRead fields are ever returned. */
export interface Spotlight {
  id: string;
  slot: string;
  listing?: { id: string; label: string };
  holder?: { id: string; label: string };
  amount?: number;
  window_start?: string;
  window_end?: string;
}
export interface SpotlightListOpts {
  /** Equality filters on public fields. */
  filter?: {
    slot?: string;
    listing?: string;
    holder?: string;
    amount?: number;
    window_start?: string;
    window_end?: string;
  };
  sort?: { field: "slot" | "listing" | "holder" | "amount" | "window_start" | "window_end"; dir: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

/** memories — write shape (relations/assets by id; "owner_id" is stamped server-side). */
export interface MemoriesCreate {
  idea: string;
  chat?: string;
  content: string;
  verbatim?: string;
  source_type: "chat" | "voice" | "link" | "manual";
  source_label?: string;
  source_url?: string;
  turn?: number;
  feeds?: "problem" | "who" | "value" | "features" | "open_questions";
  topic?: "problem" | "customer" | "product" | "brand" | "design" | "pricing" | "gtm" | "competition" | "tech" | "risk" | "decision" | "other";
  superseded?: boolean;
  created_at?: string;
}
export type MemoriesUpdate = Partial<MemoriesCreate>;

export function createClient(options: AgentXClientOptions) {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  let userToken = options.userToken ?? null;

  async function request<T>(
    method: string,
    path: string,
    query?: Record<string, unknown>,
    body?: unknown,
  ): Promise<T> {
    const url = new URL(baseUrl + path);
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const headers: Record<string, string> = { authorization: "Bearer " + options.token };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (userToken) headers["x-user-token"] = userToken;
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 204) return undefined as T;
    const json = (await res.json().catch(() => null)) as { error?: string; code?: string } | null;
    if (!res.ok) throw new AgentXError(res.status, json?.error ?? "HTTP " + res.status, json?.code);
    return json as T;
  }

  function authHeaders(): Record<string, string> {
    const h: Record<string, string> = { authorization: "Bearer " + options.token };
    if (userToken) h["x-user-token"] = userToken;
    return h;
  }

  /** One page of the change feed. Persist `cursor` and pass it as `since` next
   *  time; `ifNoneMatch` (the previous ETag) yields notModified when idle. */
  async function pollChanges(opts: { since?: string; collections?: string[]; ifNoneMatch?: string } = {}) {
    const url = new URL(baseUrl + "/changes");
    if (opts.since) url.searchParams.set("since", opts.since);
    if (opts.collections?.length) url.searchParams.set("collections", opts.collections.join(","));
    const headers = authHeaders();
    if (opts.ifNoneMatch) headers["if-none-match"] = opts.ifNoneMatch;
    const res = await fetch(url.toString(), { headers });
    const etag = res.headers.get("etag") ?? undefined;
    if (res.status === 304) return { changes: [] as ChangeEvent[], cursor: opts.since ?? "", hasMore: false, notModified: true, etag };
    const json = (await res.json().catch(() => null)) as
      | { changes?: ChangeEvent[]; cursor?: string; hasMore?: boolean; error?: string; code?: string }
      | null;
    if (!res.ok) throw new AgentXError(res.status, json?.error ?? "HTTP " + res.status, json?.code);
    return { changes: json?.changes ?? [], cursor: json?.cursor ?? "", hasMore: Boolean(json?.hasMore), notModified: false, etag };
  }

  return {
    /** Swap the end-user JWT after login/logout. */
    setUserToken(t: string | null) {
      userToken = t;
    },

    /**
     * Realtime change feed (PULL, not push). `poll` fetches changes since a
     * cursor (persist it); `stream` consumes SSE with automatic ?since resume
     * across the bounded-lifetime reconnects and a poll fallback. RECONCILE: on a
     * gap, a whole-collection delete, or a field rename, do a full .list() — the
     * feed is near-exact, not guaranteed-complete. Treat an unknown id as upsert.
     */
    changes: {
      poll: pollChanges,
      /** Consume the SSE stream, invoking onChange per event. Returns a stop fn. */
      stream(onChange: (c: ChangeEvent) => void, opts: { since?: string; collections?: string[] } = {}): () => void {
        let cursor = opts.since;
        let stopped = false;
        (async () => {
          while (!stopped) {
            try {
              const url = new URL(baseUrl + "/changes/stream");
              if (cursor) url.searchParams.set("since", cursor);
              if (opts.collections?.length) url.searchParams.set("collections", opts.collections.join(","));
              const res = await fetch(url.toString(), { headers: authHeaders() });
              if (!res.ok || !res.body) throw new AgentXError(res.status, "stream failed");
              const reader = res.body.getReader();
              const dec = new TextDecoder();
              let buf = "";
              while (!stopped) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                let i: number;
                while ((i = buf.indexOf("\n\n")) >= 0) {
                  const frame = buf.slice(0, i);
                  buf = buf.slice(i + 2);
                  const id = /^id: (.+)$/m.exec(frame)?.[1];
                  const ev = /^event: (.+)$/m.exec(frame)?.[1];
                  const data = /^data: (.+)$/m.exec(frame)?.[1];
                  if (id) cursor = id;
                  if (ev === "change" && data) onChange(JSON.parse(data) as ChangeEvent);
                  else if (ev === "cursor" && data) cursor = (JSON.parse(data) as { cursor: string }).cursor;
                }
              }
            } catch {
              // Fall back to a poll (also advances the cursor), then reconnect.
              try {
                const p = await pollChanges({ since: cursor });
                for (const c of p.changes) onChange(c);
                if (p.cursor) cursor = p.cursor;
              } catch {
                /* keep trying */
              }
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        })();
        return () => {
          stopped = true;
        };
      },
    },
    messages: { // requires setUserToken() for non-public access
      async create(data: MessagesCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/messages", undefined, data);
      },
      /** Upload a file, then reference the returned id in an asset field. */
      async upload(file: Blob, filename = "upload"): Promise<{ id: string; url: string }> {
        const fd = new FormData();
        fd.append("file", file, filename);
        const headers: Record<string, string> = { authorization: "Bearer " + options.token };
        if (userToken) headers["x-user-token"] = userToken;
        const res = await fetch(baseUrl + "/messages/uploads", { method: "POST", headers, body: fd });
        const json = (await res.json().catch(() => null)) as
          | { id?: string; url?: string; error?: string; code?: string }
          | null;
        if (!res.ok) throw new AgentXError(res.status, json?.error ?? "HTTP " + res.status, json?.code);
        return json as { id: string; url: string };
      },
      async update(id: string, patch: MessagesUpdate): Promise<{ id: string }> {
        return (await request<{ data: { id: string } }>("PATCH", "/messages/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/messages/" + encodeURIComponent(id));
      },
    },
    artifacts: { // requires setUserToken() for non-public access
      async create(data: ArtifactsCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/artifacts", undefined, data);
      },
      async update(id: string, patch: ArtifactsUpdate): Promise<{ id: string }> {
        return (await request<{ data: { id: string } }>("PATCH", "/artifacts/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/artifacts/" + encodeURIComponent(id));
      },
    },
    quick_ideas: {
      async list(opts: QuickIdeasListOpts = {}): Promise<QuickIdeas[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: QuickIdeas[] }>("GET", "/quick_ideas", query)).data;
      },
      async get(id: string): Promise<QuickIdeas> {
        return (await request<{ data: QuickIdeas }>("GET", "/quick_ideas/" + encodeURIComponent(id))).data;
      },
    },
    users: { // requires setUserToken() for non-public access
      async list(opts: UsersListOpts = {}): Promise<Users[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: Users[] }>("GET", "/users", query)).data;
      },
      async get(id: string): Promise<Users> {
        return (await request<{ data: Users }>("GET", "/users/" + encodeURIComponent(id))).data;
      },
      async create(data: UsersCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/users", undefined, data);
      },
      /** Upload a file, then reference the returned id in an asset field. */
      async upload(file: Blob, filename = "upload"): Promise<{ id: string; url: string }> {
        const fd = new FormData();
        fd.append("file", file, filename);
        const headers: Record<string, string> = { authorization: "Bearer " + options.token };
        if (userToken) headers["x-user-token"] = userToken;
        const res = await fetch(baseUrl + "/users/uploads", { method: "POST", headers, body: fd });
        const json = (await res.json().catch(() => null)) as
          | { id?: string; url?: string; error?: string; code?: string }
          | null;
        if (!res.ok) throw new AgentXError(res.status, json?.error ?? "HTTP " + res.status, json?.code);
        return json as { id: string; url: string };
      },
      async update(id: string, patch: UsersUpdate): Promise<Users> {
        return (await request<{ data: Users }>("PATCH", "/users/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/users/" + encodeURIComponent(id));
      },
    },
    ideas: { // requires setUserToken() for non-public access
      async create(data: IdeasCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/ideas", undefined, data);
      },
      /** Upload a file, then reference the returned id in an asset field. */
      async upload(file: Blob, filename = "upload"): Promise<{ id: string; url: string }> {
        const fd = new FormData();
        fd.append("file", file, filename);
        const headers: Record<string, string> = { authorization: "Bearer " + options.token };
        if (userToken) headers["x-user-token"] = userToken;
        const res = await fetch(baseUrl + "/ideas/uploads", { method: "POST", headers, body: fd });
        const json = (await res.json().catch(() => null)) as
          | { id?: string; url?: string; error?: string; code?: string }
          | null;
        if (!res.ok) throw new AgentXError(res.status, json?.error ?? "HTTP " + res.status, json?.code);
        return json as { id: string; url: string };
      },
      async update(id: string, patch: IdeasUpdate): Promise<{ id: string }> {
        return (await request<{ data: { id: string } }>("PATCH", "/ideas/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/ideas/" + encodeURIComponent(id));
      },
    },
    listings: {
      async list(opts: ListingsListOpts = {}): Promise<Listings[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: Listings[] }>("GET", "/listings", query)).data;
      },
      async get(id: string): Promise<Listings> {
        return (await request<{ data: Listings }>("GET", "/listings/" + encodeURIComponent(id))).data;
      },
    },
    stakes: {
      async list(opts: StakesListOpts = {}): Promise<Stakes[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: Stakes[] }>("GET", "/stakes", query)).data;
      },
      async get(id: string): Promise<Stakes> {
        return (await request<{ data: Stakes }>("GET", "/stakes/" + encodeURIComponent(id))).data;
      },
    },
    quick_comments: {
      async list(opts: QuickCommentsListOpts = {}): Promise<QuickComments[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: QuickComments[] }>("GET", "/quick_comments", query)).data;
      },
      async get(id: string): Promise<QuickComments> {
        return (await request<{ data: QuickComments }>("GET", "/quick_comments/" + encodeURIComponent(id))).data;
      },
    },
    spotlight_bids: {
      async list(opts: SpotlightBidsListOpts = {}): Promise<SpotlightBids[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: SpotlightBids[] }>("GET", "/spotlight_bids", query)).data;
      },
      async get(id: string): Promise<SpotlightBids> {
        return (await request<{ data: SpotlightBids }>("GET", "/spotlight_bids/" + encodeURIComponent(id))).data;
      },
    },
    chats: { // requires setUserToken() for non-public access
      async create(data: ChatsCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/chats", undefined, data);
      },
      async update(id: string, patch: ChatsUpdate): Promise<{ id: string }> {
        return (await request<{ data: { id: string } }>("PATCH", "/chats/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/chats/" + encodeURIComponent(id));
      },
    },
    reports: { // requires setUserToken() for non-public access
      async create(data: ReportsCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/reports", undefined, data);
      },
    },
    spotlight: {
      async list(opts: SpotlightListOpts = {}): Promise<Spotlight[]> {
        const query: Record<string, unknown> = { limit: opts.limit, offset: opts.offset, ...(opts.filter ?? {}) };
        if (opts.sort) query.sort = opts.sort.field + ":" + opts.sort.dir;
        return (await request<{ data: Spotlight[] }>("GET", "/spotlight", query)).data;
      },
      async get(id: string): Promise<Spotlight> {
        return (await request<{ data: Spotlight }>("GET", "/spotlight/" + encodeURIComponent(id))).data;
      },
    },
    memories: { // requires setUserToken() for non-public access
      async create(data: MemoriesCreate): Promise<{ id: string }> {
        return request<{ id: string }>("POST", "/memories", undefined, data);
      },
      async update(id: string, patch: MemoriesUpdate): Promise<{ id: string }> {
        return (await request<{ data: { id: string } }>("PATCH", "/memories/" + encodeURIComponent(id), undefined, patch)).data;
      },
      async remove(id: string): Promise<void> {
        await request<void>("DELETE", "/memories/" + encodeURIComponent(id));
      },
    },
  };
}
