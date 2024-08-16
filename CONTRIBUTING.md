# Contributing to MultiplayerChessJS

Thank you for your interest in contributing to MultiPlayer Chess! Before you start, please make sure to read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

To set up the development environment, please follow the steps outlined below.

1. Clone the repository: `git clone https://github.com/your-username/MultiplayerChessJS.git`
2. Navigate to the frontend directory: `cd MultiplayerChessJS/frontend`
3. Copy `.env.example` to `.env.local`
4. Navigate to the root directory `cd ../`
5. Run Docker Compose: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
   - **Note:** If `docker-compose` does not work for you, please use `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`.

## How to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature` or `git checkout -b bugfix/your-bug-fix`.
3. Make your changes and ensure all tests pass.
4. Commit your changes following the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).
5. Push your branch to your fork: `git push origin feature/your-feature`.
6. Open a pull request, describing your changes and referencing any related issues.

### Pull Request Titles

When creating pull requests, we encourage you to follow the conventions outlined in the [Pulsar Apache Contribution Guide](https://pulsar.apache.org/contribute/develop-semantic-title/). This guide provides useful tips for crafting meaningful and semantic pull request titles.

Thank you for your contribution!
