# Landscape Analysis: Agent Compilation and Generation Systems

**Research Date:** 2026-01-05
**Focus:** YAML-based agent compilation, template generation, and modular agent definition formats

## Executive Summary

The landscape of agent definition and compilation systems is rapidly evolving, with several major frameworks adopting YAML-based declarative approaches. However, **no framework currently implements a true "compilation" step that transforms modular YAML profiles into static agent definitions** similar to what this project is exploring. Most systems use YAML for runtime configuration rather than build-time compilation.

Key differentiator for this project: **Pre-compilation of modular agent definitions into optimized, static markdown agents** - this approach is unique in the current landscape.

---

## Framework Comparison Matrix

| Framework | Format | Approach | Compilation | Profiles/Inheritance |
|-----------|--------|----------|-------------|---------------------|
| CrewAI | YAML | Runtime config | No | No |
| Google ADK | YAML | Runtime config | No | No |
| Swarms | YAML | Runtime loader | No | No |
| Semantic Kernel | YAML/JSON | Declarative spec | No | Templates only |
| AgentFiles | YAML | Runtime superset | No | No |
| LangChain | Python | Code-first | No | No |
| AutoGen | JSON/Code | Declarative | No | No |
| Pydantic AI | Python | Schema-driven | No | No |
| DSPy | Python | Signature-based | Prompt optimization | No |
| PromptFlow | YAML | DAG definition | No | No |
| Dify | YAML DSL | Export/Import | No | No |
| Flowise | Visual/JSON | Node-based | No | No |
| **This Project** | **YAML+Markdown** | **Build-time compilation** | **Yes** | **Yes** |

---

## Detailed Framework Analysis

### 1. CrewAI - YAML Configuration System

**URL:** [docs.crewai.com](https://docs.crewai.com/en/concepts/agents)

CrewAI provides the most mature YAML-based agent configuration in the current landscape.

**Configuration Structure:**
```yaml
# agents.yaml
researcher:
  role: >
    {topic} Senior Data Researcher
  goal: >
    Uncover cutting-edge developments in {topic}
  backstory: >
    You're a seasoned researcher with a knack for uncovering the latest developments...
  allow_delegation: False
  verbose: True
  llm: groq_llm
  tools:
    - myLinkedInProfileTool
    - mySerperDevTool
```

**Key Features:**
- Separate `agents.yaml` and `tasks.yaml` files
- Variable interpolation with `{variable}` syntax
- Tool and LLM references via Python decorators
- No inheritance or profile system

**Limitations:**
- Runtime interpretation only
- No pre-compilation or optimization
- No modular composition beyond file separation

---

### 2. Google Agent Development Kit (ADK)

**URL:** [google.github.io/adk-docs/agents/config](https://google.github.io/adk-docs/agents/config/)

Launched August 2025, ADK provides YAML-based agent definition.

**Configuration Structure:**
```yaml
name: assistant_agent
model: gemini-2.5-flash
description: A helper agent that can answer users' questions
instruction: You are an agent to help answer users' various questions.
```

**Key Features:**
- Three build modes: Python, YAML, Visual GUI
- Visual Agent Builder generates YAML under the hood
- Can mix Python code with YAML config
- `adk create --type=config` scaffolding

**Limitations:**
- Experimental feature
- Limited to Gemini models in pure YAML mode
- No profile/inheritance system
- No pre-compilation

---

### 3. Swarms Framework

**URL:** [docs.swarms.world](https://docs.swarms.world/en/latest/swarms/agents/create_agents_yaml/)

Enterprise-grade multi-agent framework with YAML support.

**Configuration Features:**
- `create_agents_from_yaml()` function
- AgentLoader for multiple formats (MD, YAML, CSV)
- Support for concurrent agent creation
- Multiple return types: agents, tasks, or both

**Architecture Support:**
- Hierarchical, Mesh, and Federated communication
- Swarm-level orchestration from config

**Limitations:**
- Runtime loading only
- No compilation step
- No profile inheritance

---

### 4. Microsoft Semantic Kernel

**URL:** [learn.microsoft.com/semantic-kernel/frameworks/agent/agent-templates](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-templates)

Provides declarative YAML/JSON agent specifications.

**Key Innovation:** Custom agent type registration via decorators:
```python
@register_agent_type("custom_agent")
class MyAgent:
    ...
```

**Schema Capabilities:**
- Properties, instructions, model configuration
- Tool and plugin definitions
- Data source configuration
- Template parameter substitution

**Supported Agent Types:**
- AzureAIAgent
- OpenAIAssistantAgent
- OpenAIResponsesAgent

**Status:** Experimental - subject to change

---

### 5. AgentFiles (RAG App)

**URL:** [github.com/ragapp/agentfiles](https://github.com/ragapp/agentfiles)

Simple YAML format for agent definition, built as CrewAI superset.

**Format:**
```yaml
# agentfile.yaml
name: agent_name
backstory: ...
goal: ...
role: ...
tools: [...]
```

**Features:**
- Web UI for configuration at `localhost:8000/admin/`
- Model selection via CLI parameter
- Tool configuration via UI

**Limitations:**
- Single agent focus
- No multi-agent orchestration
- No compilation

---

### 6. DSPy - Programmatic Approach

**URL:** [dspy.ai](https://dspy.ai/)

Stanford framework with unique "prompt compilation" concept.

**Programming Model:**
```python
class MySignature(dspy.Signature):
    """Description for the prompt"""
    question = dspy.InputField()
    answer = dspy.OutputField()
```

**Key Differentiator:** Automatic prompt optimization
- Compiles signatures into optimized prompts
- Data-driven prompt tuning
- ReAct agent architecture support

**Relevance:** DSPy's "compilation" concept is the closest to this project's approach, but operates at the prompt level rather than agent definition level.

---

### 7. PromptFlow (Microsoft)

**URL:** [microsoft.github.io/promptflow](https://microsoft.github.io/promptflow/reference/flow-yaml-schema-reference.html)

YAML-based DAG workflow definition.

**Structure:**
- `flow.dag.yaml` describes tool connections
- Prompty files with YAML frontmatter
- Visual DAG editing

**Use Case:** Flow orchestration rather than agent definition.

---

### 8. Dify AI

**URL:** [docs.dify.ai](https://docs.dify.ai/en/use-dify/getting-started/key-concepts)

Open-source platform with proprietary DSL.

**DSL Features:**
- YAML-based application export/import
- Workflow portability between workspaces
- Agent node for autonomous reasoning
- Community-shared DSL files

**Relevance:** Shows value of portable, version-controlled agent definitions.

---

### 9. Flowise AI

**URL:** [docs.flowiseai.com](https://docs.flowiseai.com)

Visual no-code platform built on LangChain/LangGraph.

**AgentFlow V2 Features:**
- Flow State mechanism for shared context
- Specialized standalone nodes
- JSON schema for structured output
- Conditional branches and validation

**Architecture:** Visual-first with JSON export.

---

### 10. Claude Code Native Approach

**URL:** [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)

Anthropic's native subagent definition format.

**Format:**
```markdown
---
name: agent-name
description: What the agent does
tools: [tool1, tool2]
model: claude-sonnet-4
---

System prompt content here...
```

**Key Features:**
- Markdown + YAML frontmatter
- SKILL.md for skill definitions
- CLAUDE.md for project context
- Bundled files under `/scripts`, `/references`, `/assets`

**Relevance:** This is the target format for compilation output.

---

## Patterns and Trends

### 1. Configuration vs. Compilation

**Current State:** All frameworks use YAML/JSON for runtime configuration, not build-time compilation.

**Opportunity:** Pre-compilation can enable:
- Validation at build time
- Profile-based variations
- Optimized, flattened output
- Version control for compiled artifacts

### 2. Inheritance Patterns

**Missing Feature:** No framework implements profile inheritance:
- Base agent definitions
- Environment-specific overrides
- Role-based variations
- Team-specific configurations

### 3. Modular Composition

**Limited Support:** Only basic file separation exists:
- CrewAI: agents.yaml + tasks.yaml
- Swarms: Separate YAML files per agent
- Semantic Kernel: Plugin registration

**Opportunity:** True modularity with:
- Shared capability libraries
- Reusable skill packs
- Composable instruction fragments

### 4. Variable Interpolation

**Common Pattern:** Most frameworks support basic variable substitution:
- CrewAI: `{topic}` syntax
- Semantic Kernel: Template parameters
- PromptFlow: Prompty placeholders

**Opportunity:** Enhanced interpolation with:
- Conditional blocks
- Profile-aware substitution
- Build-time resolution

---

## Unique Value Proposition for This Project

Based on landscape analysis, the proposed YAML-to-Markdown agent compilation system would be **unique** in several ways:

### 1. Build-Time Compilation
Unlike all surveyed frameworks that interpret configuration at runtime, this project compiles to static output. Benefits:
- Faster agent startup
- Reduced runtime dependencies
- Auditable compiled artifacts
- Version control for outputs

### 2. Profile System
No framework offers multi-environment profile inheritance:
```yaml
profiles:
  base:
    model: claude-sonnet-4
  production:
    extends: base
    model: claude-opus-4
  development:
    extends: base
    verbose: true
```

### 3. Modular Agent Sources
Composable fragments that compile to single output:
```yaml
sources:
  - skills/research.yaml
  - capabilities/code-review.yaml
  - instructions/team-conventions.md
```

### 4. Target Format Alignment
Direct compilation to Claude Code's native markdown format, enabling seamless integration with the Claude Code ecosystem.

---

## Recommendations

### 1. Study DSPy's Optimization Approach
DSPy's concept of "compiling" prompts offers insights for agent-level compilation, including optimization passes.

### 2. Consider CrewAI's Structure
CrewAI's agents.yaml + tasks.yaml separation is well-adopted; consider compatible syntax where practical.

### 3. Leverage Semantic Kernel's Registry
The `@register_agent_type` pattern could inform extensibility for custom compilation targets.

### 4. Export Format Compatibility
Consider supporting multiple output formats:
- Claude Code markdown (primary)
- CrewAI YAML
- Dify DSL
- Generic JSON

### 5. Validation and Linting
Build-time compilation enables schema validation, best practice linting, and error detection before deployment.

---

## Related Resources

- [CrewAI YAML Configuration](https://docs.crewai.com/en/concepts/agents)
- [Google ADK Agent Config](https://google.github.io/adk-docs/agents/config/)
- [Swarms YAML Agents](https://docs.swarms.world/en/latest/swarms/agents/create_agents_yaml/)
- [Semantic Kernel Agent Templates](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-templates)
- [DSPy Framework](https://dspy.ai/)
- [PromptFlow YAML Schema](https://microsoft.github.io/promptflow/reference/flow-yaml-schema-reference.html)
- [Dify DSL Documentation](https://docs.dify.ai/en/use-dify/getting-started/key-concepts)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [AgentFiles Repository](https://github.com/ragapp/agentfiles)
- [Flowise Documentation](https://docs.flowiseai.com)

---

## Conclusion

The agent compilation landscape is dominated by runtime configuration approaches. **No existing framework implements build-time compilation with profile inheritance and modular composition.** This represents a significant opportunity to differentiate and provide unique value to developers building multi-agent systems with Claude Code.

The proposed compilation approach aligns with emerging trends (declarative definitions, version-controlled configs) while solving problems not yet addressed by existing frameworks (profile management, build-time optimization, modular composition).
