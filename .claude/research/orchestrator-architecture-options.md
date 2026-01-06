# Orchestrator Architecture Options

## Problem Statement

The original orchestrator agent was designed to:
1. Read a task queue from `.claude/orchestrator-queue.json`
2. Spawn agents in parallel to process tasks
3. Poll for completion and track status
4. Handle dependencies between tasks

**However**, we discovered a hard limitation: **subagents cannot spawn other subagents**. This is an architectural constraint in Claude Code to prevent infinite recursion.

This means the orchestrator agent, when spawned via the Task tool, cannot use `Task` or `TaskOutput` - the very tools it needs to do its job.

## Current State

- Orchestrator agent exists at `.claude/agents/orchestrator.md`
- It has comprehensive instructions for queue processing
- When spawned, it fails because Task/TaskOutput tools are blocked
- The main Claude thread CAN spawn agents and use all tools

## Options

---

### Option 1: Context-Based Mode (Simplest)

**How it works:**
- No special agent or files needed
- User says "process the queue in the background" or "orchestrator mode"
- Main Claude understands from context to:
  - Spawn all agents with `run_in_background: true`
  - Stay responsive to user
  - Poll agents periodically
  - Update status files

**Pros:**
- Zero setup required
- Natural language interaction
- Flexible - user can phrase it however they want

**Cons:**
- Context might be lost in long conversations
- No persistent state across sessions
- Relies on Claude "remembering" the mode
- Behavior not formally defined

**Implementation:**
- None required - just conversational understanding
- Could add to CLAUDE.md as a convention

---

### Option 2: Status File as Mode Trigger

**How it works:**
- `.claude/orchestrator-status.json` has a `state` field
- When `state: "active"`, Claude operates in orchestrator mode
- All agent spawning uses `run_in_background: true`
- User can check status via `/status` command

```json
{
  "state": "active",
  "mode": "background",
  "updated": "2025-12-17T22:00:00Z",
  ...
}
```

**Pros:**
- Persistent across conversation turns
- Explicit on/off state
- Can be checked programmatically
- Status file already exists

**Cons:**
- Requires Claude to check file before spawning
- Need to define when mode starts/ends
- Extra file I/O

**Implementation:**
- Modify CLAUDE.md or create instruction file
- Add convention: "Before spawning agents, check orchestrator-status.json state"

---

### Option 3: Slash Command Trigger (`/orchestrate`)

**How it works:**
- User runs `/orchestrate` to enter orchestrator mode
- Command injects instructions into context
- Claude processes queue with background agents
- User runs `/orchestrate stop` or mode auto-ends when queue empty

**Pros:**
- Explicit user intent
- Instructions injected at right moment
- Can include detailed behavior rules
- Familiar pattern (like `/status`, `/w`)

**Cons:**
- Requires creating and maintaining command file
- User must remember the command
- Slightly more friction than natural language

**Implementation:**
Create `.claude/commands/orchestrate.md`:
```markdown
Enter orchestrator mode. Process `.claude/orchestrator-queue.json`.

## Instructions for Claude
1. Set orchestrator-status.json state to "active"
2. Read queue and identify ready tasks
3. Spawn ALL agents with run_in_background: true
4. Stay responsive - do not block on any single agent
5. Poll agents periodically (every response if user is active)
6. Update status.json after each state change
7. When all tasks complete, set state to "complete"

## User Interaction
While in orchestrator mode:
- User can add tasks: "Add research task for X"
- User can check status: "What's running?"
- User can stop: "Stop orchestrator"
```

---

### Option 4: Orchestrator as Planner Agent (Hybrid)

**How it works:**
- Keep orchestrator agent, but change its role
- Orchestrator analyzes requests and structures the queue
- Returns a "spawn plan" (list of agents to spawn with params)
- Main Claude executes the plan (spawns in background)

```
User: "Research auth and then implement login"
   ↓
Claude: Spawns orchestrator agent (not in background)
   ↓
Orchestrator: Returns structured plan
   {
     "tasks": [
       {"id": "1", "agent": "Explore", "prompt": "...", "deps": []},
       {"id": "2", "agent": "frontend-developer", "prompt": "...", "deps": ["1"]}
     ]
   }
   ↓
Claude: Spawns agents based on plan (in background)
```

**Pros:**
- Leverages existing orchestrator instructions
- Separates planning from execution
- Orchestrator can do complex dependency analysis
- Main Claude handles spawning (which it can do)

**Cons:**
- Two-step process (plan then execute)
- Orchestrator agent still limited in tools
- More complex than needed for simple queues

**Implementation:**
- Modify orchestrator agent to return JSON plan instead of spawning
- Add "execute plan" logic to main Claude's understanding

---

### Option 5: CLAUDE.md Convention (Recommended)

**How it works:**
- Add orchestrator behavior rules to CLAUDE.md
- Define trigger phrases that activate the mode
- Document the expected behavior explicitly

Add to CLAUDE.md:
```markdown
## Orchestrator Mode

When user requests background task processing (phrases like "process queue",
"run in background", "orchestrator mode", "start background tasks"):

1. Read `.claude/orchestrator-queue.json` for pending tasks
2. Update `.claude/orchestrator-status.json` with state: "active"
3. Spawn ALL ready tasks with `run_in_background: true`
4. Remain responsive to user - do not block
5. On each response, poll running agents with `TaskOutput(block=false)`
6. Write completed results to `.claude/orchestrator/results/{task-id}.md`
7. Update status.json after each change
8. When queue is empty and all tasks complete, set state: "complete"

User can:
- Add tasks: "Add a task to research X"
- Check status: "/status" or "What's the status?"
- Stop: "Stop orchestrator" or "Cancel background tasks"
```

**Pros:**
- Explicit, documented behavior
- Loaded into every conversation automatically
- No extra commands or agents needed
- Extensible - add more conventions over time

**Cons:**
- Adds to CLAUDE.md length
- Relies on Claude following instructions (usually reliable)

---

## Comparison Matrix

| Option | Setup Effort | Persistence | Extensibility | User Friction |
|--------|--------------|-------------|---------------|---------------|
| 1. Context-based | None | Low | Low | Lowest |
| 2. Status file | Low | High | Medium | Low |
| 3. Slash command | Medium | Medium | High | Medium |
| 4. Planner agent | High | Medium | High | Medium |
| 5. CLAUDE.md | Low | High | High | Lowest |

## Recommendation

**Start with Option 5 (CLAUDE.md Convention)** because:
- Low setup effort
- High persistence (loaded every conversation)
- Extensible for future complex behaviors
- Low user friction (natural language triggers)
- Can combine with Option 2 (status file) for state tracking

**Future extensibility** with CLAUDE.md approach:
- Add more trigger phrases as needed
- Define complex behaviors (priority queues, retry logic)
- Add hooks integration when ready
- Formalize into a command later if needed

---

## Implementation Plan

### Phase 1: Basic Mode (Now)
1. Add orchestrator mode section to CLAUDE.md
2. Define trigger phrases
3. Document behavior rules
4. Test with simple queue

### Phase 2: Status Integration
1. Formalize status.json schema
2. Add state tracking (active/paused/complete)
3. Create `/status` command for quick checks

### Phase 3: Advanced Features (Future)
1. Priority levels for tasks
2. Retry logic for failed tasks
3. Result injection for dependent tasks
4. Hooks integration for automatic triggers
5. Metrics and logging

---

## Open Questions

1. **How to handle conversation compaction?**
   - When context is compacted, will Claude remember it's in orchestrator mode?
   - Solution: Check status.json state on each response

2. **What triggers mode exit?**
   - All tasks complete?
   - User explicitly stops?
   - Timeout?

3. **How to handle failures?**
   - Retry automatically?
   - Ask user?
   - Mark failed and continue?

4. **Can user pause and resume?**
   - Set state: "paused" in status.json?
   - How to resume gracefully?

---

## Files Involved

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Orchestrator mode behavior rules |
| `.claude/orchestrator-queue.json` | Task queue (tasks to process) |
| `.claude/orchestrator-status.json` | Current state and running tasks |
| `.claude/orchestrator/results/*.md` | Output from completed tasks |
| `.claude/commands/status.md` | Quick status check command |
| `.claude/commands/w.md` | Watch/polling command |
