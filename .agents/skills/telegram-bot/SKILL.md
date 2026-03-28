---
name: Telegram Bot Integration
description: Skill for debugging and expanding the Telegram bot notifications for new orders and system alerts.
---

# Telegram Bot Integration Skill

## Context
The application notifies restaurant admins or managers via Telegram when a new order is received. The script `test-telegram.js` implies active or planned integration with the Telegram Bot API.

## Guidelines
1. **Environment Variables**:
   - Relay on variables like `VITE_TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID`. Never hardcode keys in `.ts/.js` files.
2. **Error Handling & Resilience**:
   - Network requests to the Telegram API must be wrapped in robust `try/catch` and async patterns.
   - **Critical Rule**: A failure in the Telegram API call MUST NOT block the user from successfully placing an order. Catch the error, log it, and allow the application flow to continue gracefully.
3. **Message Formatting**:
   - Format messages elegantly using Telegram's MarkdownV2 or HTML mode. Always escape special characters (`!`, `.`, `-`, etc.) when using MarkdownV2 to prevent 400 Bad Request errors.
   - Include distinct visual separation in text (e.g., using emojis) to make order details scannable quickly for restaurant workers.
