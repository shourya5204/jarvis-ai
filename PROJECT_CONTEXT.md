# Jarvis AI Project Context

## Overview

Voice-controlled AI assistant (CLI-based) with push-to-talk input.

## Current Features

* Push-to-talk (ENTER)
* Speech → text via Groq Whisper API
* Intent parsing (aiParser)
* Router-based execution
* YouTube auto-play (yt-search)
* Safe tab management (Jarvis-only window)
* Browser search + summarization
* File operations (basic)

## Tech Stack

* Node.js
* Groq API
* yt-search
* Brave Browser (AppleScript automation)

## Architecture

User → CLI → Voice → AI Parser → Router → Agents → Speaker

## Key Files

* index.js → entry
* input/cli.js → input control
* input/voice.js → recording + transcription
* ai/aiParser.js → intent parsing
* router/router.js → execution logic
* agents/* → task handlers
* utils/* → helpers (speaker, audio, tabManager)

## Current State

Stable, cleaned, no unused deps, no Python envs.

## Next Goals

(To be updated)
