# SWR - Pagination Examples

> useSWRInfinite and infinite scroll patterns. See [core.md](core.md) for basic patterns.

---

## useSWRInfinite Basics

### Basic Infinite List

```typescript
// components/infinite-list.tsx
import useSWRInfinite from "swr/infinite";

interface Post {
  id: string;
  title: string;
  excerpt: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

const PAGE_SIZE = 20;

// Key generator function
const getKey = (pageIndex: number, previousPageData: PostsResponse | null) => {
  // Reached the end
  if (previousPageData && !previousPageData.nextCursor) return null;

  // First page, no cursor needed
  if (pageIndex === 0) return `/api/posts?limit=${PAGE_SIZE}`;

  // Add cursor to subsequent requests
  return `/api/posts?limit=${PAGE_SIZE}&cursor=${previousPageData?.nextCursor}`;
};

function InfinitePostList() {
  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite<PostsResponse>(getKey, fetcher);

  // Flatten all pages into single array
  const posts = data?.flatMap((page) => page.posts) ?? [];

  // Derived states
  const isEmpty = data?.[0]?.posts.length === 0;
  const isReachingEnd = data?.[data.length - 1]?.nextCursor === null;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  if (isLoading) return <PostSkeleton count={PAGE_SIZE} />;
  if (error) return <Error message={error.message} />;
  if (isEmpty) return <EmptyState message="No posts found" />;

  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>

      {!isReachingEnd && (
        <button onClick={loadMore} disabled={isLoadingMore}>
          {isLoadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export { InfinitePostList };
```

**Why good:** getKey function controls pagination logic, null return stops fetching, flatMap combines pages, derived states prevent unnecessary renders

---

## Infinite Scroll with Intersection Observer

### Automatic Load on Scroll

```typescript
// components/infinite-scroll-list.tsx
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useEffect } from "react";

interface Item {
  id: string;
  name: string;
}

interface ItemsResponse {
  items: Item[];
  hasMore: boolean;
}

const PAGE_SIZE = 20;
const INTERSECTION_THRESHOLD = 0.5;
const ROOT_MARGIN = "100px";

const getKey = (pageIndex: number, previousPageData: ItemsResponse | null) => {
  if (previousPageData && !previousPageData.hasMore) return null;
  return `/api/items?page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
};

function InfiniteScrollList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite<ItemsResponse>(getKey, fetcher, {
    // Don't revalidate all pages on focus
    revalidateFirstPage: false,
  });

  const items = data?.flatMap((page) => page.items) ?? [];
  const isReachingEnd = data?.[data.length - 1]?.hasMore === false;
  const isLoadingMore = !isLoading && isValidating;

  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [isReachingEnd, isValidating, setSize, size]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: INTERSECTION_THRESHOLD,
        rootMargin: ROOT_MARGIN,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loadMore]);

  if (isLoading) return <ItemSkeleton count={PAGE_SIZE} />;

  return (
    <div className="infinite-scroll-container">
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      {/* Sentinel element - triggers load when visible */}
      <div ref={loadMoreRef} className="load-more-sentinel">
        {isLoadingMore && <Spinner />}
        {isReachingEnd && items.length > 0 && (
          <p className="end-message">No more items</p>
        )}
      </div>
    </div>
  );
}

export { InfiniteScrollList };
```

**Why good:** IntersectionObserver triggers load automatically, rootMargin starts loading before user reaches bottom, revalidateFirstPage: false prevents unnecessary refetches

---

## Offset-Based Pagination

### Traditional Page Numbers

```typescript
// components/paginated-list.tsx
import useSWR from "swr";
import { useState } from "react";

interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const PAGE_SIZE = 10;

function PaginatedUserList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSWR<PaginatedResponse<User>>(
    `/api/users?page=${page}&limit=${PAGE_SIZE}`,
    fetcher,
    {
      // Keep previous data while loading new page
      keepPreviousData: true,
    }
  );

  if (isLoading && !data) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  if (!data?.items.length) return <EmptyState />;

  return (
    <div>
      <ul>
        {data.items.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />

      <p>
        Showing {data.items.length} of {data.totalItems} users
      </p>
    </div>
  );
}

export { PaginatedUserList };
```

### Offset Pagination with useSWRInfinite

```typescript
// components/offset-infinite-list.tsx
import useSWRInfinite from "swr/infinite";

interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

const PAGE_SIZE = 20;

const getKey = (pageIndex: number) => {
  return `/api/items?offset=${pageIndex * PAGE_SIZE}&limit=${PAGE_SIZE}`;
};

function OffsetInfiniteList() {
  const { data, size, setSize, isLoading } = useSWRInfinite<PaginatedResponse<Item>>(
    getKey,
    fetcher
  );

  const items = data?.flatMap((page) => page.items) ?? [];
  const total = data?.[0]?.total ?? 0;
  const isReachingEnd = items.length >= total;

  return (
    <div>
      <p>Loaded {items.length} of {total}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      {!isReachingEnd && (
        <button onClick={() => setSize(size + 1)}>
          Load More
        </button>
      )}
    </div>
  );
}

export { OffsetInfiniteList };
```

**Why good:** keepPreviousData prevents flash during page changes, offset calculation is simple, total from first page determines end condition

---

## Bidirectional Pagination

### Load Previous and Next

```typescript
// components/chat-messages.tsx
import useSWRInfinite from "swr/infinite";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

interface MessagesResponse {
  messages: Message[];
  hasPrevious: boolean;
  hasNext: boolean;
  cursor: string;
}

const PAGE_SIZE = 50;

function ChatMessages({ channelId }: { channelId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get newer messages (forward)
  const getKeyNewer = (pageIndex: number, previousPageData: MessagesResponse | null) => {
    if (previousPageData && !previousPageData.hasNext) return null;
    if (pageIndex === 0) return `/api/channels/${channelId}/messages?limit=${PAGE_SIZE}`;
    return `/api/channels/${channelId}/messages?after=${previousPageData?.cursor}&limit=${PAGE_SIZE}`;
  };

  const {
    data: newerData,
    size: newerSize,
    setSize: setNewerSize,
  } = useSWRInfinite<MessagesResponse>(getKeyNewer, fetcher);

  // All messages combined
  const messages = newerData?.flatMap((page) => page.messages) ?? [];

  const hasMoreNewer = newerData?.[newerData.length - 1]?.hasNext !== false;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div ref={containerRef} className="chat-container">
      {hasMoreNewer && (
        <button onClick={() => setNewerSize(newerSize + 1)}>
          Load older messages
        </button>
      )}

      {messages.map((message) => (
        <div key={message.id} className="message">
          <span className="timestamp">{message.timestamp}</span>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
}

export { ChatMessages };
```

**Why good:** Separate infinite queries for different directions, cursor-based prevents duplicates, auto-scroll improves UX

---

## Filtered Pagination

### Filter with Reset

```typescript
// components/filtered-paginated-list.tsx
import useSWRInfinite from "swr/infinite";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface ProductsResponse {
  products: Product[];
  hasMore: boolean;
}

const PAGE_SIZE = 20;

function FilteredProductList() {
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");

  const getKey = (pageIndex: number, previousPageData: ProductsResponse | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(PAGE_SIZE),
      sortBy,
    });

    if (category) params.set("category", category);

    return `/api/products?${params}`;
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite<ProductsResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setSize(1);
  }, [category, sortBy, setSize]);

  const products = data?.flatMap((page) => page.products) ?? [];
  const isReachingEnd = data?.[data.length - 1]?.hasMore === false;

  return (
    <div>
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      )}

      {!isReachingEnd && (
        <button
          onClick={() => setSize(size + 1)}
          disabled={isValidating}
        >
          {isValidating ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export { FilteredProductList };
```

**Why good:** Filter changes reset to page 1, URL params included in key create separate caches, each filter combination cached independently

---

## Configuration Options

### useSWRInfinite Options

```typescript
// components/configured-infinite-list.tsx
import useSWRInfinite from "swr/infinite";

function ConfiguredInfiniteList() {
  const { data, size, setSize } = useSWRInfinite(getKey, fetcher, {
    // Initial number of pages to load
    initialSize: 1,

    // Don't revalidate all pages, just first page
    revalidateAll: false,

    // Don't revalidate first page on focus/reconnect
    revalidateFirstPage: false,

    // Persist size across unmounts
    persistSize: false,

    // Parallel fetching (careful with rate limits)
    parallel: false,
  });

  return <List data={data} loadMore={() => setSize(size + 1)} />;
}

export { ConfiguredInfiniteList };
```

**Why good:** revalidateAll: false prevents refetching all pages, revalidateFirstPage: false improves performance, parallel option for faster loading when safe

---

## Anti-Pattern Examples

```typescript
// BAD: Using regular useSWR for pagination (no pagination support)
const [page, setPage] = useState(1);
const { data } = useSWR(`/api/items?page=${page}`, fetcher);
// Can't accumulate pages, loses data when page changes

// BAD: Missing null return in getKey (infinite loop)
const getKey = (pageIndex, prev) => {
  return `/api/items?page=${pageIndex}`; // Never stops!
};

// BAD: revalidateAll with many pages (performance killer)
const { data } = useSWRInfinite(getKey, fetcher, {
  revalidateAll: true, // Refetches ALL pages on every focus!
});

// BAD: Not using flatMap for combined data
const allItems = data?.map(page => page.items); // Array of arrays!
```

```typescript
// GOOD: useSWRInfinite for accumulating pages
const { data, size, setSize } = useSWRInfinite(getKey, fetcher);
const items = data?.flatMap(page => page.items) ?? [];

// GOOD: Proper end detection in getKey
const getKey = (pageIndex, prev) => {
  if (prev && !prev.hasMore) return null; // Stop when done
  return `/api/items?page=${pageIndex}`;
};

// GOOD: Disable revalidateAll for performance
const { data } = useSWRInfinite(getKey, fetcher, {
  revalidateAll: false,
  revalidateFirstPage: false,
});

// GOOD: flatMap combines pages
const allItems = data?.flatMap(page => page.items) ?? [];
```

**Why bad examples fail:** Regular useSWR loses data on page change, missing null causes infinite requests, revalidateAll hammers API, map without flat creates nested arrays
