# discord-messenger-integration

This project allows Discord <-> Facebook Messenger two-way communication.
- Discord members can send messages to a user at Messenger directly and vice-versa.
- Users can exchange text, and media including images, gifs, emojis, links, or even files, I embedded the most known formats compatible with the messenger platform.

## Requirements:
    1. Discord Channel ID.
    2. The Discord Channel Webhook (URL)
    3. A Discord Bot with permission to read messages in the channel.
    4. A server(or VM) to host the Discord Bot
    5. Any HTTPS endpoint with a valid TLS or SSL Certificate to receive webhooks notifications and to make post requests to discord webhook (just use FaaS services like Cloud Functions)
    6. A Facebook Page/ Business Page for conversation with the target user.
    7. Meta Developer Account, Create an App.

## About Integration
The Discord bot listens to every message (in the channel) and forwards them to Facebook API, you should host the bot in a server to keep it up and running.
A Facebook Business Page is needed to send messages on behalf of discord users. Thus by attaching nickname text(bold) to every message, the Facebook user can recognize the sender.
Return messages are more straightforward. A cloud function pipes every incoming Facebook message to the webhook belonging to the discord channel.
