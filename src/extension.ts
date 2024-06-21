import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.configureOpenAI', () => {
            const panel = vscode.window.createWebviewPanel(
                'configureOpenAI',
                'OpenAI Configuration',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'configuration.html'));
            fs.readFile(htmlPath.fsPath, 'utf8', (err, data) => {
                if (err) {
                    vscode.window.showErrorMessage('Unable to load configuration file.');
                    return;
                }
                panel.webview.html = data;
            });
            panel.webview.onDidReceiveMessage(async message => {
                const config = vscode.workspace.getConfiguration('codeWizard');
                switch (message.type) {
                    case 'requestConfig':
                        panel.webview.postMessage({
                            type: 'loadConfig',
                            config: {
                                apiType: config.get<string>('apiType'),
                                openAIKey: config.get<string>('openAI.apiKey'),
                                azureOpenAIKey: config.get<string>('azureOpenAI.apiKey'),
                                azureOpenAIEndpoint: config.get<string>('azureOpenAI.endpoint'),
                                azureOpenAIDeploymentName: config.get<string>('azureOpenAI.deploymentName'),
                                azureOpenAIAPIVersion: config.get<string>('azureOpenAI.apiVersion')
                            }
                        });
                        break;
                    case 'saveConfig':
                        await config.update('apiType', message.apiType, vscode.ConfigurationTarget.Global);
                        if (message.apiType === 'OpenAI') {
                            await config.update('openAI.apiKey', message.openAIKey, vscode.ConfigurationTarget.Global);
                        } else if (message.apiType === 'AzureOpenAI') {
                            await config.update('azureOpenAI.apiKey', message.azureOpenAIKey, vscode.ConfigurationTarget.Global);
                            await config.update('azureOpenAI.endpoint', message.azureOpenAIEndpoint, vscode.ConfigurationTarget.Global);
                            await config.update('azureOpenAI.deploymentName', message.azureOpenAIDeploymentName, vscode.ConfigurationTarget.Global);
                            await config.update('azureOpenAI.apiVersion', message.azureOpenAIAPIVersion, vscode.ConfigurationTarget.Global);
                        }
                        vscode.window.showInformationMessage('Configuration saved successfully!');
                        break;
                }
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateCode', async () => {
            // Get the current text editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found.');
                return;
            }

            // Prompt the user to enter the code description
            const prompt = await vscode.window.showInputBox({ prompt: 'Describe the code you want to generate' });
            if (!prompt) {
                vscode.window.showInformationMessage('No description provided.');
                return;
            }

            const config = vscode.workspace.getConfiguration('codeWizard');
            const apiType = config.get<string>('apiType');
            let API_KEY: string | undefined, ENDPOINT: string | undefined, DEPLOYMENT_NAME: string | undefined, API_VERSION: string | undefined;
            let REQUEST_BODY: any;
            let API_URL: string;
            let HEADERS: any;

            const systemprompt = 'You are Code Guru, User will ask you code-related queries. Please respond only with the code that can be directly copy-pasted, without any formatting or language-specific tags.';

            if (apiType === 'OpenAI') {
                API_KEY = config.get<string>('openAI.apiKey');
                if (!API_KEY) {
                    vscode.window.showErrorMessage('OpenAI API key is not configured.');
                    return;
                }
                // Defining API URL and body
                API_URL = 'https://api.openai.com/v1/chat/completions';
                REQUEST_BODY = {
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemprompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                };
                HEADERS = {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                };

            } else if (apiType === 'AzureOpenAI') {
                API_KEY = config.get<string>('azureOpenAI.apiKey');
                ENDPOINT = config.get<string>('azureOpenAI.endpoint');
                DEPLOYMENT_NAME = config.get<string>('azureOpenAI.deploymentName');
                API_VERSION = config.get<string>('azureOpenAI.apiVersion');
                if (!API_KEY || !ENDPOINT || !DEPLOYMENT_NAME || !API_VERSION) {
                    vscode.window.showErrorMessage('Azure OpenAI configuration is incomplete.');
                    return;
                }
                // Defining API URL and body
                API_URL = `${ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
                REQUEST_BODY = {
                    messages: [
                        { role: 'system', content: systemprompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                };
                HEADERS = {
                    'api-key': API_KEY,
                    'Content-Type': 'application/json'
                };

            } else {
                vscode.window.showErrorMessage('Invalid API type selected.');
                return;
            }
            
            // Show progress notification
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating code...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });

                try {
                    // Make an API call
                    const response = await axios.post(API_URL, REQUEST_BODY, {
                        headers: HEADERS
                    });

                    // Get the generated code from the response
                    const generatedCode = response.data.choices[0].message.content;

                    // Insert the generated code into the active text editor
                    editor.edit(editBuilder => {
                        const position = editor.selection.active;
                        editBuilder.insert(position, generatedCode);
                    });

                    vscode.window.showInformationMessage('Code generation successful!');
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage('Failed to generate code: ' + error.message);
                    } else {
                        vscode.window.showErrorMessage('Failed to generate code: Unknown error');
                    }
                }
            });
        })
    );

    // Open the configuration UI when the extension is activated if necessary
    const configuration = vscode.workspace.getConfiguration();
    const apiKey = configuration.get<string>('openai.apiKey');
    if (!apiKey) {
        vscode.commands.executeCommand('extension.configureOpenAI');
    }

}

export function deactivate() { }