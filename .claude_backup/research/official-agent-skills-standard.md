# Official Anthropic Agent Skills Standard - Research Report

**Research Date:** January 5, 2026
**Status:** Comprehensive findings on the open standard specification and ecosystem adoption

---

## Executive Summary

Agent Skills is an open standard originally developed by Anthropic and released publicly on December 18, 2025. The specification defines a simple, portable format for packaging instructions, scripts, and resources that AI agents can discover and load dynamically. The standard has achieved rapid industry adoption, with Microsoft, OpenAI, GitHub, Cursor, and other major platforms implementing native support.

---

## 1. Official Specification

### Primary Resources
- **Specification Website:** https://agentskills.io/specification
- **Official Repository:** https://github.com/agentskills/agentskills
- **Anthropic Skills Examples:** https://github.com/anthropics/skills
- **Reference SDK (Python):** `pip install skills-ref`
- **Reference SDK (Rust):** `cargo add skills-ref-rs`

### Core Concept

Agent Skills are directories containing instructions, scripts, and resources that AI agents can discover and load dynamically. Each skill requires a `SKILL.md` file with metadata describing its capabilities. The format is intentionally minimal - as noted by Simon Willison, "It is a deliciously tiny specification - you can read the entire thing in just a few minutes."

---

## 2. File Structure

### Minimal Structure (Required)
```
my-skill/
└── SKILL.md          # Entry point with frontmatter and core instructions
```

### Recommended Structure (Full)
```
my-skill/
├── SKILL.md          # Required: Entry point with YAML frontmatter + instructions
├── resources/        # Optional: Supporting markdown/text files
│   ├── reference.md
│   ├── examples.md
│   └── checklist.txt
├── scripts/          # Optional: Executable code (Python, Bash, JS)
│   ├── helper.py
│   └── validate.sh
├── templates/        # Optional: Structured prompts or forms
│   └── form.md
└── assets/           # Optional: Static resources (images, data files)
    └── logo.png
```

---

## 3. SKILL.md Format

### Required Fields

```yaml
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---

# My Skill Name

[Markdown instructions that the agent will follow when this skill is active]
```

### Field Specifications

| Field | Requirements |
|-------|-------------|
| `name` | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must match parent directory name. Cannot start/end with hyphen or contain consecutive hyphens. |
| `description` | Max 1024 characters. Non-empty. Should include specific keywords for agent matching. |

### Optional Fields

| Field | Description |
|-------|-------------|
| `license` | Specifies the skill's license terms |
| `compatibility` | 1-500 characters indicating environment requirements |
| `metadata` | Arbitrary key-value pairs for additional properties |
| `allowed-tools` | Space-delimited list of pre-approved tools (experimental) |
| `model` | Specify model version for this skill |

### Body Content Guidelines

- No format restrictions - write whatever helps agents perform effectively
- Recommended sections: step-by-step instructions, input/output examples, edge case handling
- Keep under 500 lines (~5000 tokens) for core SKILL.md
- Link to supporting files for detailed content using relative paths

---

## 4. Progressive Disclosure Architecture

The core design principle enabling scalability:

### Three-Stage Loading

1. **Metadata Layer (Startup)**
   - Only `name` and `description` loaded into system prompt
   - ~50-100 tokens per skill
   - Enables semantic matching without full context

2. **Core Instructions (Activation)**
   - Full SKILL.md content loaded when agent determines relevance
   - Triggered by user request matching skill description

3. **Referenced Materials (On-Demand)**
   - Additional files (forms.md, reference.md) discovered contextually
   - Scripts executed without loading source into context

### Context Efficiency

As Anthropic's engineering team notes: "Agents with filesystem and code execution capabilities don't require loading entire skill content simultaneously. This design means the amount of context that can be bundled into a skill is effectively unbounded."

---

## 5. System Prompt Integration

### Recommended XML Format

```xml
<available_skills>
  <skill>
    <name>skill-name</name>
    <description>Brief description of what this skill does</description>
    <location>/absolute/path/to/SKILL.md</location>
  </skill>
</available_skills>
```

### Using skills-ref Library

```bash
# Generate XML for system prompt
skills-ref to-prompt ./my-skill-a ./my-skill-b

# Validate a skill
skills-ref validate ./my-skill

# Read properties as JSON
skills-ref read-properties ./my-skill
```

---

## 6. Platform Adoption Status

### Native Support (As of January 2026)

| Platform | Implementation Status |
|----------|----------------------|
| Claude (Claude.ai, Claude Code, SDK) | Full native support |
| OpenAI Codex CLI | Full native support |
| GitHub Copilot | Native support |
| VS Code (Insiders) | Native support |
| Cursor | Native support |
| Amp | Native support |
| OpenCode | Native support |
| Goose | Native support |
| Letta | Native support |

### OpenAI's Implementation

OpenAI has adopted the Agent Skills specification in Codex, explicitly referencing the agentskills.io specification. Developer Elias Judin confirmed the implementation uses "the same file naming conventions, the same metadata format, the same directory organization."

### Industry Significance

Major analysts describe this as "the npm moment for AI agents" - every skill created works across the entire ecosystem, creating powerful network effects.

---

## 7. Skill Installation Locations

### Claude Code Priority Order
```
Enterprise (org-wide) > Personal (~/.claude/skills/) > Project (.claude/skills/) > Plugin
```

### Common Installation Methods

| Method | Scope | Usage |
|--------|-------|-------|
| Project Skills (`.claude/skills/`) | Repository-specific | Anyone cloning the repo |
| Personal Skills (`~/.claude/skills/`) | Current user | All projects |
| Plugins | Cross-repository | Via marketplace |
| Enterprise | Organization-wide | Managed settings |

---

## 8. Creating Custom Skills

### Basic Workflow

```bash
# Create skill directory
mkdir -p ~/.claude/skills/my-custom-skill

# Create SKILL.md
cat > ~/.claude/skills/my-custom-skill/SKILL.md << 'EOF'
---
name: my-custom-skill
description: Describe what this skill does and keywords that should trigger it
---

# My Custom Skill

## Instructions
Step-by-step guidance for the agent.

## Examples
Concrete usage examples.

## Guidelines
- Guideline 1
- Guideline 2
EOF

# Validate (optional)
skills-ref validate ~/.claude/skills/my-custom-skill

# Restart Claude Code to load
```

### Best Practices for Descriptions

**Poor:** "Helps with documents"

**Good:** "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."

Include:
- Specific actions (extract, fill, merge)
- Keywords users would naturally say
- File types or domain terms

---

## 9. Tool Restrictions

### allowed-tools Field

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read Grep Glob
---
```

When specified, the agent can only use listed tools without permission prompts during skill execution.

---

## 10. Subagent Integration

Skills don't automatically transfer to subagents. Explicit configuration required:

```yaml
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: Review code for quality
skills: pr-review, security-check
---
```

**Note:** Built-in agents (Explore, Plan, Verify) and Task tool don't inherit skills.

---

## 11. Security Considerations

### Known Vulnerabilities

Research published in October 2025 (arxiv.org/abs/2510.26328) demonstrates that Agent Skills enable "trivially simple prompt injections":

- Malicious instructions can be hidden in long skill files
- Scripts can exfiltrate sensitive data (API keys, credentials)
- "Don't ask again" permissions can be exploited for unauthorized actions
- Untrusted marketplace skills pose significant risk

### Attack Vectors

1. **Embedded exfiltration:** Malicious backup scripts that upload files
2. **URL encoding:** Sensitive data embedded in seemingly innocent links
3. **Permission inheritance:** Initial benign approval carrying to harmful actions

### Defensive Recommendations

| Measure | Description |
|---------|-------------|
| Source verification | Only install skills from trusted sources |
| Code review | Inspect all bundled scripts before installation |
| Sandboxing | Implement execution sandboxes for scripts |
| Allowlisting | Maintain approved skill registries |
| User confirmation | Require approval for potentially risky operations |
| Audit logging | Track skill execution and tool usage |

### Security Tools

- **SkillCheck:** Security scanner for SKILL.md vulnerability detection
- **NeMo Guardrails:** Conversational AI guardrails
- **Garak:** LLM vulnerability scanner
- Research code: https://github.com/aisa-group/promptinject-agent-skills

---

## 12. Partner Skills Directory

Anthropic launched a directory with skills from commercial partners:

- Atlassian
- Canva
- Cloudflare
- Figma
- Notion (https://www.notion.so/notiondevs/Notion-Skills-for-Claude)
- Ramp
- Sentry

---

## 13. Relationship to MCP

Agent Skills and MCP (Model Context Protocol) are complementary:

- **MCP:** Provides secure connectivity to external software and data
- **Skills:** Provide procedural knowledge for using those tools effectively

As Anthropic notes: "Partners who've invested in strong MCP integrations were a natural starting point" for skills development.

---

## 14. Community Resources

### Official
- Specification: https://agentskills.io
- Anthropic Skills: https://github.com/anthropics/skills
- Claude Help Center: https://support.claude.com/en/articles/12512176-what-are-skills

### Community
- Awesome Agent Skills: https://github.com/skillmatic-ai/awesome-agent-skills
- Skills Marketplace: https://skillsmp.com/
- OpenSkills (Universal loader): Compatible with any AI agent

### Frameworks
- LangChain Multi-Agent Skills
- Deep Agents (LangChain's open source framework)
- IntentKit (Intent-driven AI agent framework)
- Agentica (TypeScript function calling framework)

---

## 15. Example: Complete Skill Structure

```
pdf-processing/
├── SKILL.md
├── FORMS.md
├── REFERENCE.md
└── scripts/
    ├── fill_form.py
    └── validate.py
```

**SKILL.md:**
```yaml
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files.
allowed-tools: Read Bash(python:*)
---

# PDF Processing

## Quick Start

Extract text:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md)
For detailed API, see [REFERENCE.md](REFERENCE.md)

## Requirements

```bash
pip install pypdf pdfplumber
```
```

---

## 16. Validation

Use the skills-ref reference library:

```bash
# Install
pip install skills-ref

# Validate frontmatter and naming conventions
skills-ref validate ./my-skill
```

Validation confirms:
- YAML frontmatter syntax
- Required field presence
- Name format compliance (lowercase, hyphens, length)
- Directory name matching

---

## 17. Future Considerations

### Governance
The specification is "maintained by Anthropic and open to contributions from the community" through the agentskills/agentskills repository.

### Ongoing Development
- GitHub Discussions for specification proposals
- Issue tracker for feature requests
- Active conversations with additional platforms for adoption

---

## Sources

- [Anthropic Engineering Blog: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Agent Skills Integration Guide](https://agentskills.io/integrate-skills)
- [GitHub: anthropics/skills](https://github.com/anthropics/skills)
- [GitHub: agentskills/agentskills](https://github.com/agentskills/agentskills)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [OpenAI Codex Skills Documentation](https://developers.openai.com/codex/skills/)
- [VentureBeat: Anthropic launches enterprise Agent Skills](https://venturebeat.com/ai/anthropic-launches-enterprise-agent-skills-and-opens-the-standard)
- [The New Stack: Agent Skills - Anthropic's Next Bid to Define AI Standards](https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/)
- [Simon Willison: Agent Skills](https://simonwillison.net/2025/Dec/19/agent-skills/)
- [arXiv: Agent Skills Enable Prompt Injections](https://arxiv.org/html/2510.26328)
- [Awesome Agent Skills](https://github.com/skillmatic-ai/awesome-agent-skills)
