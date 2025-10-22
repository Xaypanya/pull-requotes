# Pull Requotes

A beautiful, infinite-scrolling wall of developer quotes with GitHub profile integration. Crowdsourced wisdom from the developer community.

**🔗 Live :** https://xaypanya.github.io/pull-requotes/
**📦 Repository:** https://github.com/Xaypanya/pull-requotes

🎉 **Perfect for Hacktoberfest!** Easy contributions, beginner-friendly, and your quote & profile will be displayed for everyone to see!

## Features

- ✨ **Infinite Scroll** - Load more quotes as you scroll
- 🎨 **GitHub Integration** - Your avatar and profile displayed
- 🏷️ **Category Tags** - Organized by wisdom, humor, debugging, career, and learning
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Lightweight** - Pure HTML/CSS/JavaScript, no frameworks

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Xaypanya/pull-requotes.git
cd pull-requotes
```

### 2. Open in Browser
- Double-click `index.html` to open it
- Or use a local server: `python -m http.server 8000`

## How to Contribute

Contributing is **super easy** - takes less than 5 minutes!

### Step 1: Fork the Repository
Click the "Fork" button on GitHub to create your own copy.

### Step 2: Edit `quotes.json`
Add your quote entry:

```json
{
  "id": "6",
  "quote": "Your inspiring developer quote",
  "author": "Quote Author Name",
  "githubUsername": "your-github-username",
  "category": ["wisdom"]
}
```

### Step 3: Choose a Category
Pick one or more:
- **wisdom** - Programming wisdom and best practices
- **humor** - Funny developer quotes
- **debugging** - About debugging and troubleshooting
- **career** - Career advice and growth
- **learning** - Learning tips and resources

Example: `"category": ["humor", "wisdom"]`

### Step 4: Submit a Pull Request
1. Go to your forked repository
2. Click "Compare & pull request"
3. Add a title: `Add quote by @your-username`
4. Click "Create pull request"
5. That's it! 🎉

## Guidelines

**✅ DO:**
- Keep quotes under 200 characters
- Use tech-related quotes
- Use a valid GitHub username
- One quote per pull request
- Be respectful and inclusive

**❌ DON'T:**
- Add duplicate quotes
- Use invalid GitHub usernames
- Include offensive content
- Edit other people's quotes

## Hacktoberfest 2024

- **Difficulty:** Beginner-friendly ⭐
- **Time:** 5 minutes ⚡
- **Perfect for:** First-time contributors
- **Tag your PR:** Include `#hacktoberfest` in title or description

## Get Help

- 💬 Check existing quotes in `quotes.json` for examples
- 📝 Open an [issue](https://github.com/Xaypanya/pull-requotes/issues) if you have questions
- 🤝 First-time contributor? We're here to help!

## License

MIT License - See LICENSE file for details

## Author

Created by [@Xaypanya](https://github.com/Xaypanya)

---

**Ready to contribute?** Fork the repo, add your quote, and submit a PR today! 🚀

*Pull Requotes - Because great developers share great quotes!*
