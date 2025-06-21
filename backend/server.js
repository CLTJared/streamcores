require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TwitchSocket = require('ws');
const authRoutes = require("./auth");
const apiRoutes = require("./api");

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vite dev server
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

const { TWITCH_USERNAME, PORT } = process.env;
const IRC_ENDPOINT = 'wss://irc-ws.chat.twitch.tv:443';
let ts = null;
let tsClients = [];

function parseTags(line) {
    if (!line.startsWith('@')) return null;

    const tagsPart = line.split(' ')[0].slice(1); // remove leading '@'
    const tags = {};

    tagsPart.split(';').forEach(tag => {
        const [key, value] = tag.split('=');
        tags[key] = value;
    });

    return tags;
}

const connectTwitchChannel = (twitchUser, token) => {
    if (ts) ts.close();

    ts = new TwitchSocket(IRC_ENDPOINT);

    ts.onopen = () => {
        console.log(`Connecting to ${twitchUser}`);

        // Request tags, commands, membership for badges and info
        ts.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        ts.send(`PASS oauth:${token}`);
        ts.send(`NICK ${TWITCH_USERNAME}`);
        ts.send(`JOIN #${twitchUser}`);
    };

    ts.onmessage = (event) => {
        const lines = event.data.toString().split('\r\n');

        for (const line of lines) {
            if (line.startsWith('PING')) {
                ts.send('PONG :tmi.twitch.tv');
                console.log('\x1b[31m[PING-PONG]\x1b[0m');
            } else if (line.trim() !== '') {
                // console.log('\x1b[32m[IRC]\x1b[0m', line);
                // PRIVMSG regex with tags line starting with '@'

                const PRIVMSG_REGEX = /^@.*? :([^!]+)!.*PRIVMSG #[^ ]+ :(.+)$/;
                //const SYSMSG_REGEX = /^@.*? :(?:([^!]+)![^ ]+ )?tmi\.twitch\.tv USERNOTICE #([^ ]+)(?: :(.*))?$/;
                const SYSMSG_REGEX = /^@[^ ]+ :tmi\.twitch\.tv USERNOTICE #([^ ]+)(?: :(.*))?$/

                if (line.startsWith('@') && SYSMSG_REGEX.test(line)) {
                    const sysTags = parseTags(line);
                    const [message = ''] = line.match(SYSMSG_REGEX);
                    const sysMessage = {
                        type: 'system',
                        username: sysTags['display-name'] || '',
                        message,
                        msgId: sysTags['msg-id'] || '',
                        sysMsg: sysTags['system-msg'] || '',
                        color: sysTags.color || '',
                        badges: sysTags.badges || '',
                        displayName: sysTags['display-name'] || '',
                    };
                    console.log(sysMessage);

                    // Broadcast to all connected clients
                    tsClients.forEach((client) => {
                        if (client.readyState === TwitchSocket.OPEN) client.send(JSON.stringify(sysMessage));
                    });
                }

                if (line.startsWith('@') && PRIVMSG_REGEX.test(line)) {
                    const tags = parseTags(line);
                    const [, username, message] = line.match(PRIVMSG_REGEX);
                    const chatMessage = {
                        type: 'chat',
                        username,
                        message,
                        badges: tags.badges || '',
                        color: tags.color || '',
                        displayName: tags['display-name'] || username,
                    };

                    // Broadcast to all connected clients
                    tsClients.forEach((client) => {
                        if (client.readyState === TwitchSocket.OPEN) client.send(JSON.stringify(chatMessage));
                    });
                }
            }
        }
    };

    ts.onclose = () => console.log('IRC connection closed');
    ts.onerror = (err) => console.error('IRC error:', err);
};

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

const server = app.listen(PORT, () => console.log(`✅ API server running on port ${PORT}`));
const tss = new TwitchSocket.Server({ server });

tss.on('connection', (ws) => {
    tsClients.push(ws);

    ws.on('close', () => {
        tsClients = tsClients.filter((client) => client !== ws);
        console.log('WebSocket client disconnected');
    });
});

app.post('/connect', async (req, res) => {
    const { channel, accessToken } = req.body;

    if (!channel) return res.status(400).json({ error: 'Channel is required.' });

    connectTwitchChannel(channel.toLowerCase(), accessToken);
    res.json({ status: 'Connecting', channel });
});