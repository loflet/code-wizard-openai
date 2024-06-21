# Code Wizard OpenAI

## Overview

Code Wizard OpenAI is a VS Code extension that leverages Azure OpenAI's GPT-4 API to generate code based on user-provided descriptions. This extension aims to assist developers by generating code snippets that can be easily integrated into their projects.

## Features

- Generate code snippets by describing the desired functionality in plain language.
- Integrate generated code directly into the active text editor.
- Configure the extension using a user-friendly UI.

## Installation

To install the extension, follow these steps:

1. Download and install the extension from the Visual Studio Marketplace (link will be provided after publishing).
2. Alternatively, you can install the `.vsix` file directly by running the following command in the terminal:
    ```bash
    code --install-extension code-wizard-openai-0.0.1.vsix
    ```

## Configuration

After installing the extension, you will be prompted to configure it with your API credentials through a user-friendly UI.

1. **Open Configuration UI**:
    - If the API key is not set, the configuration UI will open automatically.
    - You can also open the configuration UI manually by running the command `CodeWizard: Configure` from the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).

2. **Select API Type**:
    - Choose between `OpenAI` and `Azure OpenAI`.

3. **Enter Configuration Details**:
    - For `OpenAI`:
        - **API Key**: Your OpenAI API key.
    - For `Azure OpenAI`:
        - **API Key**: Your Azure OpenAI API key.
        - **Endpoint**: Your Azure OpenAI endpoint (e.g., `https://your-azure-endpoint.openai.azure.com/`).
        - **Deployment Name**: Your deployment name (e.g., `gpt-4-deployment`).
        - **API Version**: Your OpenAI API Version (e.g., `2023-07-01-preview`).

4. **Save Configuration**:
    - Fill in the required fields and click the "Save" button.
    - A confirmation message will appear once the configuration is saved successfully.

## Usage

1. **Open a Text Editor**:
    - Open the file where you want to insert the generated code.

2. **Run the Command**:
    - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the command palette.
    - Type `CodeWizard: Generate Code` and select the command `CodeWizard: Generate Code`.

3. **Describe the Code**:
    - Enter a description of the code you want to generate in the input box that appears.

4. **Insert the Generated Code**:
    - The generated code will be inserted at the current cursor position in the active text editor.

## Example

Here's an example of how you can use the extension:

1. Open a JavaScript file in VS Code.
2. Run the `CodeWizard: Generate Code` command from the command palette.
3. Enter a description like "Create a function that returns the sum of two numbers".
4. The extension will generate the corresponding code and insert it into your file.

## Troubleshooting

If you encounter issues, ensure that:
- Your API key, endpoint, and deployment name are correctly set using the configuration UI.
- You have an active internet connection.
- The Azure OpenAI service is available and your credentials are valid.

For any other issues, feel free to raise an issue on the [GitHub repository](https://github.com/loflet/code-wizard).

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgements

Special thanks to the developers of the VS Code extension API and the Azure OpenAI team for providing the API used in this extension. This extension was developed with the assistance of ChatGPT, which helped in accelerating the development process.
