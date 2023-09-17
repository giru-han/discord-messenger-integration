require('dotenv').config(); // initialize dotenv
//const fs = require('node:fs');

//const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js'); //basic for discord bot
const axios = require('axios'); // to make http request


// Your bot's token goes here
const token = process.env.CLIENT_TOKEN;
const bot_clientId = process.env.BOT_CLIENT_ID;
const guildId = process.env.GUILD_ID;  // Discord server ID
const page_id = process.env.PAGE_ID;   // Facebook Page ID
const fburl = `https://graph.facebook.com/v17.0/${page_id}/messages`; //Include Graph API version
const recipient_id = process.env.TESTER_PSID;                         //Messenger user PISD
const access_token = process.env.MESSENGER_ACCESS_TOKEN;
const fb_channel = process.env.FB_CHANNEL;                            //Discord channel which bot reads to forward every meesages

// Create client intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});


// Start logger
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Simple test bot respond to a word
client.on('messageCreate', (msg) => {
  if (msg.content === 'hi_bot') {
    msg.reply(`Hello! ${msg.author.username}`);
  }
});


// Function to check if a string is url
function isURL(str) {
  // Regular expression to match URLs
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return urlPattern.test(str);
}

// Function to make post request
function make_post_request(url, payload) {
	axios.post(url, payload)
		.then((response) => {
			// Handle the response here
			// console.log(response.data);
		})
		.catch((error) => {
			// Handle any errors here
			console.error(error);
		});
};

// Function to set payload and then call the post request
function post_payload(message_dict) {
		const payload = {
			'recipient': {'id': recipient_id},
			'message': message_dict,
			'messaging_type': 'UPDATE',
			'access_token': access_token
		};
		make_post_request(fburl, payload)
};

// Bot watch for message in specific fb discord channel and forward to fb page messenger
client.on('messageCreate', async (message) => {
    // Check if the message is sent at hidden channel + green discord + non-bot
    if (message.guild && message.guild.id === guildId && message.channel.id === fb_channel && !message.author.bot) {
		
		let files = [];
		let pictures = []
		if (message.attachments.size > 0) {
			message.attachments.forEach((attachment) => {
				if (attachment.contentType && attachment.contentType.startsWith('image/')) {
					// This is image
					pictures.push(attachment.url);
				} else {
					// This attachment is not an image (other file)
					files.push(attachment.url);
				}
			});
		}
		
		// collect the data for debug use in discord
		const messageDetails = {
            id: message.author.id,
            username: message.author.username,
            content: message.content,
			file_link: files,
			image_link: pictures,
        };
		// Convert messageDetails to a JSON-like string - later easy to read in discord
        const messageDetailsString = JSON.stringify(messageDetails, null, 2);
		
		// Print in vm (FOR DEBUG CHECK in VM)
        //console.log(messageDetailsString);
		
		// Post as discord message (FOR DEBUG CHECK in DISCORD)
        //message.reply(`${messageDetailsString}`);
		
		// Separate Image/gif from content, image/gif link goes to discord content instead attachment so we need segregate it out
		let plain_text = '';
		const imageUrls = [];
		if (message.content) {
			const parts = message.content.split(/\r?\n|\/n/);

			// Iterate through the parts and check if each part is a URL
			const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.ico', '.mp4']; // Add more if needed
			
			for (const [i, part] of parts.entries()) {
				const partLower = part.toLowerCase();

				// Check if the part is url and contains an image URL
				if (isURL(partLower) && imageExtensions.some(ext => partLower.includes(ext))) {
				  imageUrls.push(part.trim()); // Trim any leading/trailing whitespace
				} else {
				  // If not an image URL, consider it as text
				  // Check if it's not the last part
					if (i < parts.length - 1) {
						plain_text += part + '\n';
					} else {
						plain_text += part; // Don't add newline for the last part
					}
				}
			}
		}
			
		// Post filtered out text +  content separated image/gifs if found 1 link in imageUrls
		// This is priority because if someone insert built in gif or url for gif/image it goes to content in discord instead attachement
		if (imageUrls.length === 1) {
			post_payload({'text': `*${message.author.username}*\n${plain_text}`});
			// If mp4 then post as video
			if (imageUrls[0].toLowerCase().includes('.mp4')) {
				post_payload({'attachment': {'type': 'video','payload': {'url': imageUrls[0]}}})
			} else {
				// Post as image
				post_payload({'attachment': {'type': 'image','payload': {'url': imageUrls[0]}}})
			}
			
		} else {
			// Post nickname and text to fb messenger as page (Since we need know which discord user so this always included even content empty)
			post_payload({'text': `*${message.author.username}*\n${message.content}`});
		}
		
		// Post image to fb (if only 1 image in pictures ls)
		if (pictures.length === 1) {
			post_payload({'attachment': {'type': 'image','payload': {'url': pictures[0]}}})
			
		// Post multiple image to fb in generic template form
		} else if (pictures.length >= 2) {
			post_payload({'attachment': {'type': 'template', 'payload': {'template_type': 'generic', 'elements': pictures.map((url) => ({
				'image_url': url,
				'title': '',
				'subtitle': ''}))}}})
		}
		
		// Post files to fb 
		for (const file_url of files) {
			if (file_url.toLowerCase().includes('.mp4')) {
				// post as video
				post_payload({'attachment': {'type': 'video','payload': {'url': file_url.trim()}}});
			} else {
				// Post as file
				post_payload({'attachment': {'type': 'file','payload': {'url': file_url}}});
			}
		}
	}
});



//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); 