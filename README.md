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
A Facebook/Business Page is needed to send messages on behalf of Discord users. Thus by attaching nickname text(bold) to every message, the Facebook user can recognize the sender.
Return messages are more straightforward. A cloud function pipes every incoming Facebook message to the webhook belonging to the discord channel.

## Part 1: Discord to Facebook Messenger
1. Create a Discord Bot, and add it to your Discord server
2. Obtain the Bot Client Token and Bot Client ID
3. Obtain the Discord Channel's ID.
4. Create/Use a Facebook Page, add the target user to the page, and start a conversation with user.
5. Configure to access Facebook Graph API.
- Sign-up Meta Developers Platform > Get Started > Create App
- In the Dashboard > Add products to your app > Messenger > add the Facebook Page > Note the Page ID and Page Access Token (Click Generate Token to get one).
6. To Send or Receive Messages from user through API you need to add the user as a Tester in your App.
  - The user needs to sign up Meta Developer platform and accept your app request to be a Tester.
  - If you want to use the API on any user, you need to set your App Mode to Live and request advance access from Facebook which will take days if you pass the approval.
7. Set up a server to host your discord bot created in (1). You can use a local machine or any Virtual Machine in the Cloud. I used Google Compute Engine E2-Micro minimum configuration with Ubuntu 20.04 LTS for this purpose. If you want to run it on Node JS. Install necessary node npm(16) and discord libraries:
```
sudo apt update
sudo apt upgrade
sudo apt install nodejs npm
nvm install 16
nvm use 16
```
--
