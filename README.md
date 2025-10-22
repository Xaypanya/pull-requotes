<div align="center">
  <img src="https://github.com/Xaypanya/pull-requotes/blob/main/img/pull-requotes.png?raw=true" alt="Pull Requotes" width="150"/>

  # Pull Requotes

  A beautiful, infinite-scrolling wall of developer quotes with GitHub profile integration. Crowdsourced wisdom from the developer community.

  **🔗 Live :** https://xaypanya.github.io/pull-requotes/

  **📦 Repository:** https://github.com/Xaypanya/pull-requotes
</div>

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
Add your quote entry to the array in `quotes.json`:

```json
{
  "quote": "Your inspiring developer quote",
  "author": "Quote Author Name",
  "githubUsername": "your-github-username",
  "category": ["wisdom"],
  "date": "DD-MM-YYYY"
}
```

**Important:**
- Add a comma `,` after the previous entry
- Use today's date in DD-MM-YYYY format (e.g., "22-10-2025")
- Make sure your JSON is valid (check for proper commas and brackets)
- Use your actual GitHub username (it will fetch your profile and stats automatically)

### Step 3: Choose a Category
Pick one or more categories that fit your quote:
- **wisdom** - Programming wisdom and best practices
- **humor** - Funny developer quotes
- **debugging** - About debugging and troubleshooting
- **career** - Career advice and growth
- **learning** - Learning tips and resources

Examples:
- Single category: `"category": ["wisdom"]`
- Multiple categories: `"category": ["humor", "debugging"]`

### Step 4: Submit a Pull Request
1. Go to your forked repository
2. Click "Compare & pull request"
3. Add a title: `Add quote by @your-username`
4. Click "Create pull request"
5. That's it! 🎉

## Example Contribution

Here's a complete example of adding a quote to `quotes.json`:

```json
[
  {
    "quote": "First, solve the problem. Then, write the code.",
    "author": "John Johnson",
    "githubUsername": "grapongz",
    "category": ["wisdom", "learning"],
    "date": "22-10-2025"
  },
  {
    "quote": "Code is like humor. When you have to explain it, it's bad.",
    "author": "Cory House",
    "githubUsername": "your-username",
    "category": ["humor", "wisdom"],
    "date": "23-10-2025"
  }
]
```

**Note the comma `,` between entries!**

## Guidelines

**✅ DO:**
- Keep quotes under 200 characters
- Use tech-related quotes
- Use your actual GitHub username (it shows your profile, avatar, and stats)
- Use today's date in DD-MM-YYYY format
- Add a comma after the previous entry in the JSON array
- One quote per pull request
- Be respectful and inclusive

**❌ DON'T:**
- Add duplicate quotes
- Use invalid GitHub usernames
- Forget to add the date field
- Break the JSON format (missing commas, brackets, or quotes)
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
