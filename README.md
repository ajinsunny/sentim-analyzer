SentimAnalyzer
==============

Overview
--------

SentimAnalyzer is an AI-powered web application designed to analyze and interpret the emotional tone behind text inputs

Utilizing advanced natural language processing techniques, SentimAnalyzer can process a wide range of text inputs, such as social media posts, customer feedback, or general text entries, to determine the underlying sentiment. 

This tool is particularly useful for businesses, social media analysts, and individuals who need to gauge sentiment in written content.

Features
--------

-   Sentiment Analysis: Determine whether the text input is positive, negative, or neutral.
-   Emotion Detection: Identify specific emotions like joy, anger, sadness, etc., in the text (if the model supports it).
-   Multi-Text Input Support: Analyze text from various sources, including direct input, social media platforms, and customer feedback.
-   Interactive UI: User-friendly interface for easy interaction and result visualization.

Tech Stack
----------

-   Front-End: Next.js 14, React 18, TypeScript
-   UI Components: shadcn/ui, Radix UI, Tailwind CSS
-   Sentiment Analysis: HuggingFace Inference API
-   Model: RoBERTa-based 3-class sentiment classifier
-   Hosting: Vercel (recommended)
-   Version Control: Git, GitHub

Getting Started
---------------

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Git
-   HuggingFace account (free)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/ajinsunny/sentim-analyzer.git
    ```

2.  Navigate to the project directory and install dependencies:

    ```bash
    cd sentim-analyzer
    npm install
    ```

3.  Set up HuggingFace API:
    -   Create a free account at [HuggingFace](https://huggingface.co/join)
    -   Generate an API token at [Settings → Access Tokens](https://huggingface.co/settings/tokens)
    -   Select "Read" permissions
    -   Copy the token (starts with `hf_...`)

4.  Set up environment variables:
    -   Copy `.env.example` to `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    -   Open `.env.local` and replace the placeholder with your actual API key:
        ```
        HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
        ```

### Running the Application

1.  Start the Next.js development server:

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to:
    ```
    http://localhost:3000
    ```

3.  Enter any text and click "Analyze" to see the sentiment analysis results!

Contributing
------------

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

License
-------

Distributed under the MIT License. See `LICENSE` for more information.

Contact
-------

[Ajin Sunny](https://twitter.com/_ajinsunny_)


Project Link: <https://github.com/ajinsunny/sentim-analyzer>
