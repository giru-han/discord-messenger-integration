from flask import Flask, request
import requests
import json
import os

VERIFY_TOKEN = os.environ.get('HUB_VERIFY_TOKEN')
DIS_URL = os.environ.get('CHANNEL_WEBHOOK')

# Function to embed in discord if multiple image
def embed_image(data):
    # If text then payload the text terminate the function (since fb cannot mix text with others)
    if 'text' in data['entry'][0]['messaging'][0]['message']:
        return {"content": data['entry'][0]['messaging'][0]['message']['text']} # If text
    if 'attachments' in data['entry'][0]['messaging'][0]['message']:
        attachment_ls = data['entry'][0]['messaging'][0]['message']['attachments']
        # If attachment is more than 1 image
        if attachment_ls[0]['type'] == 'image' and len(attachment_ls) > 1: 
            image_objects = []
            for i in range(len(attachment_ls)):
                image_objects.append({'url': attachment_ls[i]['payload']['url']})
            # return the message data with the image attachments, to be append to dis data dictionary later
            return {'embeds': [{'image': image} for image in image_objects]}
        else:
            return {"content": attachment_ls[0]['payload']['url']} # If single image or file (fb file always single)
        

def post_2_discord(data):
    headers = {"Content-Type": "application/json"}
    dis_data = {"username": "fb user name"} # customize fb username to appear in discord
    try:
        dis_data.update(embed_image(data))
        # debug mode to return full data
        #dis_data = {"username": "custom username", "content": str(data)}
    except Exception as e:
        # return full data + error code if error
        dis_data = {"username": "custom username",
                    "content": str(data)+'ERROR! : '+str(e),
                    }

    result = requests.post(DIS_URL, json=dis_data, headers=headers)

#@app.route('/')
def root():
    return 'Hello, World! This is the root path.'


#@app.route('/messaging', methods=['GET'])
def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    if mode and token:
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            print('WEBHOOK_VERIFIED')
            return challenge, 200
        else:
            return 'Forbidden', 403

#@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        if data.get('object') == "page":
            # Send a '200 OK' response
            post_2_discord(data)
            return "EVENT_RECEIVED", 200
        else:
            # Return a '404 Not Found' response
            return "Not Found", 404
    except Exception as e:
        print(f"Error processing webhook: {e}")
        response_data = {'status': 'error'}
        return json.dumps(response_data), 500

def my_get_handler():
    # Handle the request and route it based on the path
    if request.path == '/':
        return root()
    elif request.path == '/new-page':
        return new_page()
    elif request.path == '/webhook':
        return verify_webhook()
    else:
        return 'Not Found', 404

# Expose the Cloud Function endpoint
def main(request):
    if request.method == 'GET':
        return my_get_handler()
    elif request.method == 'POST' and request.path == '/webhook':
        return webhook()
    else:
        return 'Method Not Allowed', 405
