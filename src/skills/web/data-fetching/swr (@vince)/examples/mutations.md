# SWR - Mutation Examples

> mutate, useSWRMutation, and optimistic updates. See [core.md](core.md) for basic patterns.

---

## useSWRMutation Basics

### Simple Mutation

```typescript
// components/create-post-form.tsx
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import type { FormEvent } from "react";

interface CreatePostInput {
  title: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Mutation fetcher - receives key and { arg }
async function createPost(url: string, { arg }: { arg: CreatePostInput }): Promise<Post> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}

function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/api/posts",
    createPost
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newPost = await trigger({ title, content });
      console.log("Created post:", newPost);
      setTitle("");
      setContent("");
    } catch (err) {
      // Error is also available via `error` return value
      console.error("Failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          <span>{error.message}</span>
          <button type="button" onClick={reset}>Dismiss</button>
        </div>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isMutating}
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isMutating}
        placeholder="Content..."
      />
      <button type="submit" disabled={isMutating || !title.trim()}>
        {isMutating ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}

export { CreatePostForm };
```

**Why good:** trigger returns promise for await, isMutating provides loading state, error state for display, reset clears error state

---

## Mutation Types

### Update (PUT/PATCH)

```typescript
// components/edit-profile.tsx
import useSWRMutation from "swr/mutation";

interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string;
}

async function updateUser(url: string, { arg }: { arg: UpdateUserInput }) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!response.ok) throw new Error("Update failed");
  return response.json();
}

function EditProfile({ userId }: { userId: string }) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/users/${userId}`,
    updateUser
  );

  const handleSave = async (data: UpdateUserInput) => {
    await trigger(data);
  };

  return (
    <ProfileForm
      onSave={handleSave}
      isLoading={isMutating}
    />
  );
}

export { EditProfile };
```

### Delete

```typescript
// components/delete-post-button.tsx
import useSWRMutation from "swr/mutation";

async function deletePost(url: string) {
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) throw new Error("Delete failed");
  return response.json();
}

function DeletePostButton({ postId, onDeleted }: { postId: string; onDeleted?: () => void }) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/posts/${postId}`,
    deletePost,
    {
      onSuccess: () => {
        onDeleted?.();
      },
    }
  );

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await trigger();
    }
  };

  return (
    <button onClick={handleDelete} disabled={isMutating}>
      {isMutating ? "Deleting..." : "Delete"}
    </button>
  );
}

export { DeletePostButton };
```

**Why good:** Separate mutation functions for different HTTP methods, onSuccess callback for side effects, confirmation before destructive action

---

## Optimistic Updates

### Basic Optimistic Update

```typescript
// components/like-button.tsx
import useSWRMutation from "swr/mutation";
import useSWR from "swr";

interface Post {
  id: string;
  title: string;
  likes: number;
  likedByMe: boolean;
}

async function toggleLike(url: string) {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) throw new Error("Like failed");
  return response.json();
}

function LikeButton({ postId }: { postId: string }) {
  const { data: post } = useSWR<Post>(`/api/posts/${postId}`, fetcher);

  const { trigger, isMutating } = useSWRMutation(
    `/api/posts/${postId}/like`,
    toggleLike,
    {
      // Optimistic update
      optimisticData: (currentData: Post) => ({
        ...currentData,
        likes: currentData.likedByMe ? currentData.likes - 1 : currentData.likes + 1,
        likedByMe: !currentData.likedByMe,
      }),
      // Rollback on error
      rollbackOnError: true,
      // Revalidate after success
      revalidate: true,
    }
  );

  if (!post) return null;

  return (
    <button
      onClick={() => trigger()}
      disabled={isMutating}
      className={post.likedByMe ? "liked" : ""}
    >
      {post.likedByMe ? "Unlike" : "Like"} ({post.likes})
    </button>
  );
}

export { LikeButton };
```

### Optimistic Update with List

```typescript
// components/todo-list.tsx
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

async function toggleTodo(url: string, { arg }: { arg: { completed: boolean } }) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return response.json();
}

function TodoItem({ todo }: { todo: Todo }) {
  const { mutate } = useSWRConfig();

  const { trigger } = useSWRMutation(
    `/api/todos/${todo.id}`,
    toggleTodo,
    {
      optimisticData: () => ({
        ...todo,
        completed: !todo.completed,
      }),
      rollbackOnError: true,
      // Also update the list cache
      onSuccess: () => {
        mutate("/api/todos");
      },
    }
  );

  return (
    <label className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => trigger({ completed: !todo.completed })}
      />
      <span className={todo.completed ? "completed" : ""}>
        {todo.title}
      </span>
    </label>
  );
}

export { TodoItem };
```

**Why good:** optimisticData shows immediate feedback, rollbackOnError ensures data consistency, list cache updated after item mutation

---

## Cache Updates After Mutation

### Invalidate Related Data

```typescript
// components/create-comment.tsx
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

async function createComment(url: string, { arg }: { arg: { content: string } }) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return response.json();
}

function CreateComment({ postId }: { postId: string }) {
  const { mutate } = useSWRConfig();
  const [content, setContent] = useState("");

  const { trigger, isMutating } = useSWRMutation(
    `/api/posts/${postId}/comments`,
    createComment,
    {
      onSuccess: () => {
        // Invalidate comments list
        mutate(`/api/posts/${postId}/comments`);
        // Invalidate post (comment count may have changed)
        mutate(`/api/posts/${postId}`);
        // Clear form
        setContent("");
      },
    }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); trigger({ content }); }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isMutating}
      />
      <button type="submit" disabled={isMutating || !content.trim()}>
        {isMutating ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}

export { CreateComment };
```

### Direct Cache Update (Without Refetch)

```typescript
// components/update-user-name.tsx
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

interface User {
  id: string;
  name: string;
  email: string;
}

async function updateUser(url: string, { arg }: { arg: { name: string } }) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  return response.json();
}

function UpdateUserName({ userId }: { userId: string }) {
  const { mutate } = useSWRConfig();

  const { trigger } = useSWRMutation(
    `/api/users/${userId}`,
    updateUser,
    {
      // populateCache updates cache with mutation response
      populateCache: (result: User, currentData: User) => ({
        ...currentData,
        ...result,
      }),
      // Don't revalidate since we're updating cache directly
      revalidate: false,
    }
  );

  return (
    <button onClick={() => trigger({ name: "New Name" })}>
      Update Name
    </button>
  );
}

export { UpdateUserName };
```

**Why good:** onSuccess allows invalidating related queries, populateCache updates cache without refetch, revalidate: false prevents unnecessary network request

---

## Using Bound mutate

### mutate for Revalidation

```typescript
// components/refresh-data.tsx
import useSWR from "swr";

function RefreshableData() {
  const { data, mutate, isValidating } = useSWR("/api/data", fetcher);

  // Simple revalidation
  const refresh = () => mutate();

  return (
    <div>
      <DataView data={data} />
      <button onClick={refresh} disabled={isValidating}>
        {isValidating ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}

export { RefreshableData };
```

### mutate with Data

```typescript
// components/optimistic-update.tsx
import useSWR from "swr";

interface Counter {
  value: number;
}

function OptimisticCounter() {
  const { data, mutate } = useSWR<Counter>("/api/counter", fetcher);

  const increment = async () => {
    // Optimistic update with async function
    await mutate(
      async (currentData) => {
        // Make API call
        const response = await fetch("/api/counter/increment", { method: "POST" });
        return response.json();
      },
      {
        // Show optimistic value immediately
        optimisticData: (current) => ({
          value: (current?.value ?? 0) + 1,
        }),
        // Rollback on error
        rollbackOnError: true,
        // Revalidate after
        revalidate: true,
      }
    );
  };

  return (
    <div>
      <span>Count: {data?.value ?? 0}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export { OptimisticCounter };
```

**Why good:** Bound mutate is simpler for single-key operations, async function pattern enables optimistic updates with API call, rollback handles errors gracefully

---

## Global mutate Patterns

### Invalidate by Pattern

```typescript
// lib/cache-utils.ts
import { mutate } from "swr";

// Invalidate all user-related queries
const invalidateUserQueries = () => {
  mutate(
    (key) => typeof key === "string" && key.startsWith("/api/users"),
    undefined,
    { revalidate: true },
  );
};

// Invalidate specific keys
const invalidateKeys = (keys: string[]) => {
  keys.forEach((key) => mutate(key));
};

// Clear entire cache
const clearCache = () => {
  mutate(() => true, undefined, { revalidate: false });
};

export { invalidateUserQueries, invalidateKeys, clearCache };
```

### After Logout

```typescript
// hooks/use-logout.ts
import { useSWRConfig } from "swr";

function useLogout() {
  const { mutate } = useSWRConfig();

  const logout = async () => {
    // Call logout API
    await fetch("/api/auth/logout", { method: "POST" });

    // Clear all cached data
    mutate(() => true, undefined, { revalidate: false });

    // Redirect to login
    window.location.href = "/login";
  };

  return { logout };
}

export { useLogout };
```

**Why good:** Pattern-based invalidation enables batch updates, cache clearing on logout prevents data leaks, global mutate handles cross-component cache updates

---

## Anti-Pattern Examples

```typescript
// BAD: Using useSWR for mutations
const { data, mutate } = useSWR("/api/posts", async () => {
  return fetch("/api/posts", {
    method: "POST",
    body: JSON.stringify({ title: "New Post" }),
  }).then((r) => r.json());
}); // This fires immediately on mount!

// BAD: Not using optimisticData for responsive UI
const { trigger } = useSWRMutation("/api/like", toggleLike);
// UI waits for server response before updating

// BAD: Missing rollbackOnError
const { trigger } = useSWRMutation("/api/update", updateFn, {
  optimisticData: (data) => ({ ...data, updated: true }),
  // Missing rollbackOnError: true - data stays wrong on error!
});

// BAD: Invalidating everything
const { mutate } = useSWRConfig();
mutate(); // Invalidates ALL cached data!
```

```typescript
// GOOD: useSWRMutation for write operations
const { trigger } = useSWRMutation("/api/posts", createPost);
await trigger({ title: "New Post" }); // Fires on demand

// GOOD: Optimistic update for instant feedback
const { trigger } = useSWRMutation("/api/like", toggleLike, {
  optimisticData: (data) => ({ ...data, liked: !data.liked }),
  rollbackOnError: true,
});

// GOOD: Full optimistic pattern
const { trigger } = useSWRMutation("/api/update", updateFn, {
  optimisticData: (data) => ({ ...data, updated: true }),
  rollbackOnError: true,
  revalidate: true,
});

// GOOD: Invalidate specific keys
const { mutate } = useSWRConfig();
mutate("/api/posts"); // Only invalidates posts
```

**Why bad examples fail:** useSWR fires immediately on mount (wrong for mutations), missing optimisticData makes UI feel slow, missing rollback leaves incorrect data on error, global mutate without key invalidates everything
