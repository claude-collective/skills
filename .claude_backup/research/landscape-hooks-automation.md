# Claude Code Hooks & Automation Landscape

## Executive Summary

Claude Code hooks are deterministic shell commands that execute at specific points in Claude Code's lifecycle. Unlike prompts (suggestions), hooks provide guarantees - they fire every time a matching event occurs. This research documents the complete hooks ecosystem, creative uses, and production patterns as of January 2026.

---

## Hook Events Reference

Claude Code provides **8 hook lifecycle events**:

| Event | When It Fires | Can Block? | Primary Use Cases |
|-------|---------------|------------|-------------------|
| **UserPromptSubmit** | When user submits prompt, before Claude processes | Yes (exit 2) | Prompt validation, context injection, security filtering |
| **PreToolUse** | Before tool execution | Yes (exit 2) | Block dangerous commands, validate inputs, modify tool params |
| **PostToolUse** | After successful tool completion | No (already executed) | Auto-format, lint, validate results, notifications |
| **PermissionRequest** | When permission dialog shown (v2.0.45+) | Yes (allow/deny) | Auto-approve safe operations, deny risky ones |
| **Stop** | When Claude finishes responding | Yes (block) | Force continuation, completion notifications |
| **SubagentStop** | When subagent (Task tool) finishes | Yes (block) | Ensure subagent tasks complete properly |
| **PreCompact** | Before context compaction | No | Backup transcripts, log compression events |
| **SessionStart** | Session starts or resumes | No | Load context, run dependency installs |
| **SessionEnd** | Session terminates | No | Cleanup tasks, session logging |

---

## Configuration

### File Locations

Hooks can be configured in three locations (applied in order):

1. `~/.claude/settings.json` - User-level settings (machine-wide)
2. `.claude/settings.json` - Project settings (checked into git)
3. `.claude/settings.local.json` - Local project settings (gitignored)

### Basic Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### Matcher Patterns

- Simple strings match exactly: `Write` matches only the Write tool
- Use `*` to match all tools
- Regex patterns: `Write|Edit|MultiEdit` matches any of these
- MCP tools: `mcp__memory__.*` matches all memory server tools
- Bash with args: `Bash(npm test*)` matches npm test commands

---

## Hook Input & Output

### Input (JSON via stdin)

All hooks receive JSON on stdin with common fields:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/conversation.json",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|dontAsk|bypassPermissions",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

### Exit Codes

| Code | Behavior | Details |
|------|----------|---------|
| **0** | Success | JSON output in stdout is parsed |
| **2** | Blocking error | stderr fed back to Claude, blocks execution |
| **Other** | Non-blocking | stderr shown to user, execution continues |

### JSON Output Control

```json
{
  "continue": true,
  "stopReason": "Message when continue is false",
  "suppressOutput": true,
  "systemMessage": "Warning message for Claude",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Explanation",
    "updatedInput": { "modified": "parameters" }
  }
}
```

---

## Environment Variables

| Variable | Availability | Description |
|----------|--------------|-------------|
| `CLAUDE_PROJECT_DIR` | All hooks | Absolute path to project root |
| `CLAUDE_CODE_REMOTE` | All hooks | `"true"` for web, empty for CLI |
| `CLAUDE_ENV_FILE` | SessionStart only | Path to persist env vars |

---

## Common Use Cases & Examples

### 1. Desktop Notifications (macOS)

Alert when Claude finishes a task:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude finished!\" with title \"Claude Code\"'"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "terminal-notifier -title 'Claude Code' -message 'Waiting for input'"
          }
        ]
      }
    ]
  }
}
```

### 2. Push Notifications (ntfy.sh)

Cross-platform push notifications:

```bash
#!/bin/bash
curl -d "Claude Code finished your task" ntfy.sh/your-topic
```

### 3. Text-to-Speech Announcements

```python
#!/usr/bin/env python3
import pyttsx3
import json
import sys

engine = pyttsx3.init()
data = json.load(sys.stdin)
engine.say(f"Claude has finished. Event: {data.get('hook_event_name')}")
engine.runAndWait()
```

### 4. Auto-Format on Edit/Write

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          },
          {
            "type": "command",
            "command": "npx eslint --fix \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

### 5. Block Dangerous Commands

```python
#!/usr/bin/env python3
import json
import sys
import re

data = json.load(sys.stdin)
tool_name = data.get("tool_name", "")

if tool_name != "Bash":
    sys.exit(0)

command = data.get("tool_input", {}).get("command", "")

DANGEROUS_PATTERNS = [
    r'rm\s+-rf\s+/',
    r'sudo\s+rm',
    r'git\s+push.*--force',
    r'DROP\s+TABLE',
    r'format\s+[a-zA-Z]:',
]

for pattern in DANGEROUS_PATTERNS:
    if re.search(pattern, command, re.IGNORECASE):
        print(f"BLOCKED: Dangerous command detected: {pattern}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

### 6. Protect Sensitive Files

```python
#!/usr/bin/env python3
import json
import sys

data = json.load(sys.stdin)
tool_name = data.get("tool_name", "")
file_path = data.get("tool_input", {}).get("file_path", "")

PROTECTED_PATTERNS = ['.env', 'credentials', 'secrets', '.git/', 'private']

if tool_name in ["Write", "Edit", "MultiEdit"]:
    for pattern in PROTECTED_PATTERNS:
        if pattern in file_path.lower():
            print(f"BLOCKED: Cannot modify protected file: {file_path}", file=sys.stderr)
            sys.exit(2)

sys.exit(0)
```

### 7. Context Injection on Session Start

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat ./current-sprint-context.md && git status --short"
          }
        ]
      }
    ]
  }
}
```

### 8. Auto-Approve Safe Operations

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "Bash(npm test*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PermissionRequest\",\"decision\":{\"behavior\":\"allow\"}}}'"
          }
        ]
      }
    ]
  }
}
```

### 9. Pre-Commit Validation

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "npm test && npm run lint"
          }
        ]
      }
    ]
  }
}
```

### 10. Slack/Discord Notifications

```bash
#!/bin/bash
# Send to Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Claude just finished a task!"}' \
  "$SLACK_WEBHOOK_URL"
```

---

## Advanced Patterns

### Input Modification (PreToolUse)

Starting in v2.0.10, PreToolUse hooks can modify tool inputs:

```python
#!/usr/bin/env python3
import json
import sys

data = json.load(sys.stdin)
tool_input = data.get("tool_input", {})

# Add --dry-run to all git push commands
if data.get("tool_name") == "Bash":
    command = tool_input.get("command", "")
    if "git push" in command and "--dry-run" not in command:
        tool_input["command"] = command + " --dry-run"
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "updatedInput": tool_input
            }
        }
        print(json.dumps(output))
        sys.exit(0)

sys.exit(0)
```

### Block-at-Submit Strategy

Block commits only if tests haven't passed:

```python
#!/usr/bin/env python3
import os
import sys

PASS_FILE = "/tmp/agent-pre-commit-pass"

if not os.path.exists(PASS_FILE):
    print("Tests haven't passed yet. Run tests first.", file=sys.stderr)
    sys.exit(2)

sys.exit(0)
```

### Multi-Agent Observability

```python
#!/usr/bin/env python3
import json
import sys
import requests

data = json.load(sys.stdin)

# Send to observability server
requests.post("http://localhost:3000/hooks", json={
    "event": data.get("hook_event_name"),
    "session_id": data.get("session_id"),
    "tool_name": data.get("tool_name"),
    "timestamp": datetime.now().isoformat()
})
```

### Session-Based Git Branches

Create isolated branches per Claude session:

```python
#!/usr/bin/env python3
import json
import sys
import subprocess

data = json.load(sys.stdin)
session_id = data.get("session_id", "unknown")

# Create shadow branch for this session
branch_name = f"claude/{session_id}"
subprocess.run(["git", "checkout", "-B", branch_name], capture_output=True)
```

---

## Prompt-Based Hooks (LLM Evaluation)

Use Haiku LLM to make decisions:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude should stop. Check if all tests pass and code is formatted. Input: $ARGUMENTS",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

Response schema:
```json
{
  "decision": "approve|block",
  "reason": "Explanation",
  "continue": false,
  "stopReason": "Message shown to user",
  "systemMessage": "Context message"
}
```

---

## Community Resources & Tools

### GitHub Repositories

| Repository | Description |
|------------|-------------|
| [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | Complete demo of all 8 hooks with JSON payloads |
| [johnlindquist/claude-hooks](https://github.com/johnlindquist/claude-hooks) | TypeScript SDK with type safety |
| [decider/claude-hooks](https://github.com/decider/claude-hooks) | Python-based validation system |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Curated list of hooks, commands, workflows |
| [ryanlewis/claude-format-hook](https://github.com/ryanlewis/claude-format-hook) | Auto-format with Biome/Prettier fallback |
| [carlrannaberg/claudekit](https://github.com/carlrannaberg/claudekit) | Performance monitoring toolkit |
| [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) | Real-time multi-agent monitoring |
| [jfpedroza/claude-code-guardian](https://github.com/jfpedroza/claude-code-guardian) | Validation and permission system |

### Observability Solutions

| Tool | Description |
|------|-------------|
| [SigNoz + OpenTelemetry](https://signoz.io/blog/claude-code-monitoring-with-opentelemetry/) | Native OTEL integration |
| [Dev-Agent-Lens](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/) | Proxy-based tracing for Arize/Phoenix |
| [claude_telemetry](https://github.com/TechNickAI/claude_telemetry) | Drop-in wrapper for Logfire/Sentry/Datadog |
| [claude-code-otel](https://github.com/ColeMurray/claude-code-otel) | Comprehensive usage/cost monitoring |

### Integration Projects

| Project | Description |
|---------|-------------|
| [claude-code-slack-bot](https://github.com/mpociot/claude-code-slack-bot) | Slack bot for Claude Code |
| [claude-slack](https://github.com/dbenn8/claude-slack) | Bidirectional Slack integration |
| [Claude-Code-Remote](https://github.com/JessyTsui/Claude-Code-Remote) | Control via email/Discord/Telegram |

---

## Security Best Practices

### Critical Warnings

- Hooks execute with your user permissions
- They can read, modify, or delete any file you can access
- Malicious hooks can exfiltrate data
- Changes to hooks require review in `/hooks` menu before taking effect

### Security Checklist

1. **Validate all inputs** - Use regex, never trust JSON from stdin
2. **Quote shell variables** - Always use `"$VAR"` not `$VAR`
3. **Block path traversal** - Check for `..` in file paths
4. **Use absolute paths** - Reference `$CLAUDE_PROJECT_DIR`
5. **Skip sensitive files** - `.env`, `.git/`, keys, credentials
6. **Avoid eval** - Never use `eval` with untrusted input
7. **Set bash options** - Use `-euo pipefail` at script start
8. **Keep hooks fast** - Target under 1 second execution

### Enterprise Controls

- `allowManagedHooksOnly` - Block user/project/plugin hooks
- Hooks require review in `/hooks` menu for activation
- 60-second default timeout (configurable)

---

## Production Implementation Guidelines

### File Organization

```
.claude/
  settings.json          # Hook configuration
  settings.local.json    # Local overrides (gitignored)
  hooks/
    validate-command.py  # Individual hook scripts
    format-code.sh
    notify-slack.py
```

### Performance Tips

- Keep hooks under 1 second when possible
- All matching hooks run in parallel
- Identical commands are deduplicated
- Use `suppressOutput: true` to reduce noise

### Debugging

```bash
# Run with debug flag
claude --debug

# Check hook registration
/hooks

# Test commands manually first
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | python .claude/hooks/validate.py
```

### Common Mistakes to Avoid

1. **Wrong file location** - Ensure settings.json is in correct directory
2. **Exit code misunderstanding** - Exit 2 blocks, not exit 1
3. **Matcher patterns that never trigger** - Case-sensitive matching
4. **Missing permissions review** - Changes require `/hooks` menu approval
5. **Silent failures** - Add stderr output for debugging

---

## Feature Requests & Future Direction

### Pending Requests

- **PreCommit/PostCommit hooks** ([Issue #4834](https://github.com/anthropics/claude-code/issues/4834)) - Native git commit lifecycle hooks
- **SessionStart/SessionEnd in Python SDK** - Currently TypeScript only

### Recent Improvements

- **v2.0.45**: PermissionRequest hook added
- **v2.0.41**: SubagentStop hook added
- **v2.0.10**: PreToolUse input modification capability

---

## Sources

### Official Documentation
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Community Guides
- [GitButler: Automate Your AI Workflows](https://blog.gitbutler.com/automate-your-ai-workflows-with-claude-code-hooks)
- [Production-Ready Hooks Guide](https://alirezarezvani.medium.com/the-production-ready-claude-code-hooks-guide-7-hooks-that-actually-matter-823587f9fc61)
- [Claude Code Hooks Best Practices](https://prpm.dev/blog/claude-hooks-best-practices)
- [macOS Notifications with Claude Code](https://nakamasato.medium.com/claude-code-hooks-automating-macos-notifications-for-task-completion-42d200e751cc)
- [ntfy Push Notifications](https://andrewford.co.nz/articles/claude-code-instant-notifications-ntfy/)
- [Text-to-Speech Fun](https://stacktoheap.com/blog/2025/08/03/having-fun-with-claude-code-hooks/)

### GitHub Resources
- [claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [claude-hooks (TypeScript)](https://github.com/johnlindquist/claude-hooks)
- [claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
