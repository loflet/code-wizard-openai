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

            const htmlPath = path.join(context.extensionPath, 'src', 'configuration.html');
            panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

            panel.webview.onDidReceiveMessage(async message => {
                if (message.command === 'saveConfig') {
                    const configuration = vscode.workspace.getConfiguration();
                    await configuration.update('openai.apiKey', message.apiKey, vscode.ConfigurationTarget.Global);
                    await configuration.update('openai.endpoint', message.endpoint, vscode.ConfigurationTarget.Global);
                    await configuration.update('openai.deploymentName', message.deploymentName, vscode.ConfigurationTarget.Global);
                    await configuration.update('openai.apiVersion', message.apiVersion, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('OpenAI configuration saved successfully!');
                    panel.dispose();
                }
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateCode', async () => {
            // Get the current text editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // No open text editor
            }

            // Prompt the user to enter the code description
            const prompt = await vscode.window.showInputBox({ prompt: 'Describe the code you want to generate' });
            if (!prompt) {
                return; // User canceled the input
            }

            // Get the OpenAI settings from the configuration
            const configuration = vscode.workspace.getConfiguration();
            const AZURE_OPENAI_API_KEY = configuration.get<string>('openai.apiKey');
            const AZURE_OPENAI_ENDPOINT = configuration.get<string>('openai.endpoint');
            const DEPLOYMENT_NAME = configuration.get<string>('openai.deploymentName');
            const API_VERSION = configuration.get<string>('openai.apiVersion');

            if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT || !DEPLOYMENT_NAME || !API_VERSION) {
                vscode.window.showErrorMessage('OpenAI API Key, Endpoint, or Deployment Name is not set. Please configure these in the settings.');
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
                    // Make a request to the Azure OpenAI Chat Completion API
                    const response = await axios.post(
                        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
                        {
                            messages: [
                                { role: 'system', content: 'You are Code Guru, User will ask you code-related queries. Please respond only with the code that can be directly copy-pasted, without any formatting or language-specific tags.' },
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 2000,
                            temperature: 0.7,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'api-key': AZURE_OPENAI_API_KEY
                            }
                        }
                    );

                    // Get the generated code from the response
                    const generatedCode = response.data.choices[0].message.content;

                    // Insert the generated code into the active text editor
                    editor.edit(editBuilder => {
                        const position = editor.selection.active;
                        editBuilder.insert(position, generatedCode);
                    });

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