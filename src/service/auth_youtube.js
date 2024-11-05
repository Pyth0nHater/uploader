const { exec } = require('child_process');
const WebSocket = require('ws');
const http = require('http');
const ProxyChain = require('proxy-chain');

async function main() {
    const tiktokLoginUrl = 'https://www.tiktok.com/login';
    const username = 'ВАШ_ЛОГИН';
    const password = 'ВАШ_ПАРОЛЬ';

    // Proxy setup
    const proxyUrl = 'http://modeler_ogMZPf:DQlr7VuGV8Sn@86.104.75.67:11620';
    const anonymizedProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);

    // Launch Chromium
    const command = `chromium-browser --remote-debugging-port=9222 --disable-gpu --user-data-dir=test --no-sandbox --disable-setuid-sandbox --proxy-server=${anonymizedProxyUrl}`;

    const chromiumProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error launching Chromium: ${error.message}`);
            return;
        }
        console.log(`Chromium started.`);
    });

    const connectToWebSocket = () => {
        http.get('http://localhost:9222/json', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const pages = JSON.parse(data);
                if (pages.length === 0) {
                    console.log('Chromium not ready yet, retrying in 1 second...');
                    setTimeout(connectToWebSocket, 1000);
                    return;
                }
                const pageUrl = pages[0].webSocketDebuggerUrl;
                const ws = new WebSocket(pageUrl);

                ws.on('open', () => {
                    console.log('WebSocket connection established.');

                    // Navigate to TikTok login page
                    ws.send(JSON.stringify({
                        id: 1,
                        method: 'Page.navigate',
                        params: { url: tiktokLoginUrl }
                    }));

                    ws.on('message', (message) => {
                        const parsedMessage = JSON.parse(message);

                        if (parsedMessage.id === 1) {
                            console.log('Navigated to TikTok login page.');

                            setTimeout(() => {
                                // Click the email login option
                                ws.send(JSON.stringify({
                                    id: 2,
                                    method: 'Runtime.evaluate',
                                    params: {
                                        expression: `document.querySelectorAll('div[class="tiktok-17hparj-DivBoxContainer e1cgu1qo0"]')[1]?.click()`
                                    }
                                }));

                                setTimeout(() => {
                                    // Click the email/phone login option if required
                                    ws.send(JSON.stringify({
                                        id: 3,
                                        method: 'Runtime.evaluate',
                                        params: {
                                            expression: `document.querySelector('a[href="/login/phone-or-email/email"]')?.click()`
                                        }
                                    }));

                                    setTimeout(() => {
                                        // Enter the username
                                        ws.send(JSON.stringify({
                                            id: 4,
                                            method: 'Runtime.evaluate',
                                            params: {
                                                expression: `document.querySelector('input[name="username"]').value = '${username}';`
                                            }
                                        }));

                                        setTimeout(() => {
                                            // Enter the password
                                            ws.send(JSON.stringify({
                                                id: 5,
                                                method: 'Runtime.evaluate',
                                                params: {
                                                    expression: `document.querySelector('input[type="password"]').value = '${password}';`
                                                }
                                            }));

                                            setTimeout(() => {
                                                // Click the login button
                                                ws.send(JSON.stringify({
                                                    id: 6,
                                                    method: 'Runtime.evaluate',
                                                    params: {
                                                        expression: `document.querySelector('button[type="submit"]')?.click();`
                                                    }
                                                }));
                                                console.log('Login attempt made.');
                                            }, 1000);
                                        }, 1000);
                                    }, 1000);
                                }, 1000);
                            }, 3000);
                        }
                    });

                    ws.on('error', (error) => {
                        console.error(`WebSocket error: ${error.message}`);
                    });
                });
            });
        });
    };

    setTimeout(connectToWebSocket, 3000);
}

main();
