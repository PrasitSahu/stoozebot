# Contributing to Stoozebot

First off, thank you for considering contributing to Stoozebot! We welcome contributions to help improve the bot.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue and include:
- A clear and descriptive title.
- Steps to reproduce the bug.
- Expected behavior vs. actual behavior.
- Any relevant logs or errors.

### Suggesting Enhancements

If you have an idea for a new feature or improvement:
- Check existing issues to see if it has already been suggested.
- Open a new issue detailing your enhancement. Explain why it would be useful and how you envision it working.

### Contributing Code

1. **Fork the Repository**
2. **Clone your Fork:**
   ```bash
   git clone https://github.com/your-username/stoozebot.git
   cd stoozebot
   ```
3. **Install Dependencies:**
   Make sure you have [Bun](https://bun.sh/) installed.
   ```bash
   bun install
   ```
4. **Create a Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your Changes:**
   Write your code, ensuring you follow the existing coding style. Use TypeScript features appropriately.
6. **Run Tests:**
   Ensure all tests pass before submitting your PR.
   ```bash
   bun test
   ```
7. **Commit your Changes:**
   Write clear and descriptive commit messages.
   ```bash
   git commit -m "Add feature: your feature name"
   ```
8. **Push to your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open a Pull Request:**
   Submit a PR against the `main` branch of the original repository. Provide a thorough explanation of your changes in the PR description.

## Code Guidelines

- **TypeScript:** Use strict typing. Avoid `any` where possible.
- **Formatting:** We use Prettier. Ensure your code is formatted correctly.
- **Database Changes:** If your contribution involves database changes, ensure you update Drizzle schemas appropriately and provide migrations if necessary.
- **Tests:** Adding new features or fixing bugs? Please add/update tests in the `test/` directory to cover your changes.

Thank you for contributing!
