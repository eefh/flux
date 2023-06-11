# Flux AI Desktop Assistant

## Features

- Trigger the assistant with a customizable hotkey
- Contextual information from SERP/VectorDB
- Conversational queries and iterations
- Push actions to APIs
- Electron-based desktop app for cross-platform support
- Uses a managed API service that offers language model functionality

## Getting Started

These instructions will guide you to set up and run Flux AI Desktop Assistant on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.0.0 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/eefh/flux.git
```

2. Navigate to the project directory:
```
cd flux-ai-desktop-assistant
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm start
```


### API Keys and Configuration

To configure Flux AI Desktop Assistant, create a `.env` file in the root directory of the project, and enter the API keys.

Include the following content in your `.env` file:

```
OPENAI_API_KEY=<your_openai_api_key>
SERP_API_KEY=<your_serpapi_api_key>
```

Replace `<your_openai_api_key>` and `<your_serpapi_api_key>` with the API keys you obtained from their respective websites.


## Usage

While using your computer, press the hotkey Cmd + Shift + F to trigger the Flux AI Desktop Assistant. Enter your query and it will respond with contextually relevant information. You can iterate the conversation to complete a specific action.

## Contributing

## License
