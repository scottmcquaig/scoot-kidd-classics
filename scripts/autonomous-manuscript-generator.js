/**
 * Autonomous Manuscript Generator
 * Generates complete manuscripts from idea to finished product
 * Uses Claude.ai web interface (web credits, not API)
 */

const ClaudeAutomation = require('./claude-automation');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class AutonomousManuscriptGenerator {
    constructor(sessionCookie) {
        this.claude = new ClaudeAutomation(sessionCookie);
        this.ideasPath = path.join(__dirname, '../ideas/manuscript-ideas.json');
        this.manuscriptsPath = path.join(__dirname, '../manuscripts');
    }

    async initialize() {
        console.log('🚀 Initializing Autonomous Manuscript Generator...');
        await this.claude.initialize();
        await this.claude.login();
        console.log('✓ Claude automation ready');
    }

    async loadManuscriptIdeas() {
        const data = await fs.readFile(this.ideasPath, 'utf8');
        return JSON.parse(data);
    }

    async saveManuscriptIdeas(ideas) {
        await fs.writeFile(this.ideasPath, JSON.stringify(ideas, null, 2));
    }

    async selectNextManuscript() {
        const ideas = await this.loadManuscriptIdeas();
        const nextManuscript = ideas.manuscripts.find(m => m.status === 'idea' || m.status === 'in_progress');

        if (!nextManuscript) {
            console.log('🎉 All manuscripts completed!');
            return null;
        }

        console.log(`📚 Selected: "${nextManuscript.title}"`);
        return nextManuscript;
    }

    async generateOutline(manuscript) {
        console.log(`📝 Generating outline for "${manuscript.title}"...`);

        const prompt = `You are a professional book writer. Create a detailed outline for a book with the following specifications:

Title: ${manuscript.title}
Genre: ${manuscript.genre}
Tone: ${manuscript.tone}
Target Word Count: ${manuscript.targetWordCount}
Number of Chapters: ${manuscript.chapters}
Description: ${manuscript.description}

Please create:
1. A compelling book overview/hook
2. ${manuscript.chapters} chapter titles with detailed descriptions (300-500 words each chapter description)
3. Key themes and concepts to cover
4. Target audience and value proposition

Format the outline in markdown with clear sections.`;

        const outline = await this.claude.sendPrompt(prompt);

        // Save outline
        const outlinePath = path.join(this.manuscriptsPath, 'outlines', `${manuscript.id}-outline.md`);
        await fs.writeFile(outlinePath, outline);
        console.log(`✓ Outline saved to: ${outlinePath}`);

        return outline;
    }

    async extractChapterTitles(outline, expectedCount) {
        console.log('🔍 Extracting chapter structure...');

        const prompt = `From this book outline, extract ONLY the chapter titles in a simple numbered list format:

${outline}

Please respond with exactly ${expectedCount} chapter titles in this format:
1. [Chapter Title]
2. [Chapter Title]
etc.`;

        const response = await this.claude.sendPrompt(prompt);

        // Parse chapter titles
        const titles = [];
        const lines = response.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const match = line.match(/^\d+\.\s*(.+)$/);
            if (match && titles.length < expectedCount) {
                titles.push(match[1].trim());
            }
        }

        console.log(`✓ Extracted ${titles.length} chapter titles`);
        return titles;
    }

    async generateChapter(manuscript, chapterNumber, chapterTitle, outline) {
        console.log(`✍️  Writing Chapter ${chapterNumber}: "${chapterTitle}"...`);

        const prompt = `You are writing Chapter ${chapterNumber} of "${manuscript.title}".

BOOK CONTEXT:
${outline}

CHAPTER DETAILS:
Chapter ${chapterNumber}: ${chapterTitle}
Target word count: ${manuscript.targetWordCount / manuscript.chapters} words
Tone: ${manuscript.tone}
Style: Engaging, conversational yet philosophical

Please write a complete, engaging chapter that:
1. Flows naturally from the previous context
2. Includes real-world examples and stories
3. Contains practical exercises or takeaways
4. Maintains the specified tone
5. Hits the target word count

Write ONLY the chapter content in markdown format. Start with "# Chapter ${chapterNumber}: ${chapterTitle}"`;

        const chapterContent = await this.claude.sendPrompt(prompt);

        // Save chapter
        const chapterDir = path.join(this.manuscriptsPath, 'drafts', manuscript.id);
        await fs.mkdir(chapterDir, { recursive: true });

        const chapterPath = path.join(chapterDir, `chapter-${chapterNumber.toString().padStart(2, '0')}.md`);
        await fs.writeFile(chapterPath, chapterContent);

        console.log(`✓ Chapter ${chapterNumber} saved: ${chapterPath}`);

        // Add delay to avoid rate limiting
        await this.delay(5000);

        return chapterContent;
    }

    async generateAllChapters(manuscript, outline, chapterTitles) {
        console.log(`📖 Generating all ${chapterTitles.length} chapters...`);

        const chapters = [];

        for (let i = 0; i < chapterTitles.length; i++) {
            const chapterNumber = i + 1;
            const chapterTitle = chapterTitles[i];

            try {
                const content = await this.generateChapter(
                    manuscript,
                    chapterNumber,
                    chapterTitle,
                    outline
                );
                chapters.push({ number: chapterNumber, title: chapterTitle, content });

                console.log(`✓ Progress: ${chapterNumber}/${chapterTitles.length} chapters complete`);
            } catch (error) {
                console.error(`❌ Error generating chapter ${chapterNumber}:`, error.message);
                // Continue with next chapter
            }
        }

        return chapters;
    }

    async combineAndPolish(manuscript, chapters) {
        console.log('✨ Combining and polishing final manuscript...');

        // Combine all chapters
        const fullManuscript = chapters
            .map(ch => ch.content)
            .join('\n\n---\n\n');

        // Save combined draft
        const combinedPath = path.join(
            this.manuscriptsPath,
            'drafts',
            manuscript.id,
            '_combined-draft.md'
        );
        await fs.writeFile(combinedPath, fullManuscript);

        // Request final polish
        const polishPrompt = `Please review and lightly polish this complete manuscript. Fix any:
- Formatting inconsistencies
- Repetitive phrases
- Transitions between chapters
- Grammar/spelling issues

Maintain the original voice and content. Return the complete polished manuscript.

MANUSCRIPT:
${fullManuscript}`;

        const polished = await this.claude.sendPrompt(polishPrompt);

        // Save final version
        const finalPath = path.join(
            this.manuscriptsPath,
            'completed',
            `${manuscript.id}.md`
        );

        // Add title page
        const titlePage = `# ${manuscript.title}
**Genre:** ${manuscript.genre}
**Tone:** ${manuscript.tone}
**Generated:** ${new Date().toISOString()}

---

`;

        await fs.writeFile(finalPath, titlePage + polished);
        console.log(`✓ Final manuscript saved: ${finalPath}`);

        return finalPath;
    }

    async updateManuscriptStatus(manuscript, status) {
        const ideas = await this.loadManuscriptIdeas();
        const idx = ideas.manuscripts.findIndex(m => m.id === manuscript.id);

        if (idx !== -1) {
            ideas.manuscripts[idx].status = status;
            ideas.manuscripts[idx].completedAt = new Date().toISOString();
            await this.saveManuscriptIdeas(ideas);
            console.log(`✓ Status updated to: ${status}`);
        }
    }

    async generateManuscript() {
        try {
            // Select next manuscript
            const manuscript = await this.selectNextManuscript();
            if (!manuscript) {
                return null;
            }

            // Update status to in_progress
            await this.updateManuscriptStatus(manuscript, 'in_progress');

            // Step 1: Generate outline
            const outline = await this.generateOutline(manuscript);
            await this.delay(3000);

            // Step 2: Extract chapter structure
            const chapterTitles = await this.extractChapterTitles(outline, manuscript.chapters);
            await this.delay(3000);

            // Step 3: Generate all chapters
            const chapters = await this.generateAllChapters(manuscript, outline, chapterTitles);

            // Step 4: Combine and polish
            const finalPath = await this.combineAndPolish(manuscript, chapters);

            // Step 5: Update status
            await this.updateManuscriptStatus(manuscript, 'completed');

            console.log(`\n🎉 MANUSCRIPT COMPLETED: ${manuscript.title}`);
            console.log(`📁 Location: ${finalPath}`);
            console.log(`📊 Chapters: ${chapters.length}`);

            return finalPath;

        } catch (error) {
            console.error('❌ Error generating manuscript:', error);
            throw error;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        await this.claude.close();
    }
}

// Main execution
async function main() {
    const sessionCookie = process.env.CLAUDE_SESSION_COOKIE;

    if (!sessionCookie) {
        console.error('❌ CLAUDE_SESSION_COOKIE not set in .env file');
        process.exit(1);
    }

    const generator = new AutonomousManuscriptGenerator(sessionCookie);

    try {
        await generator.initialize();

        // Continuous mode: keep generating until all manuscripts are done
        const continuous = process.argv.includes('--continuous');

        if (continuous) {
            console.log('🔄 Running in continuous mode...');

            while (true) {
                const result = await generator.generateManuscript();

                if (!result) {
                    console.log('✓ All manuscripts completed!');
                    break;
                }

                console.log('\n⏳ Waiting 30 seconds before next manuscript...\n');
                await generator.delay(30000);
            }
        } else {
            // Single manuscript mode
            await generator.generateManuscript();
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await generator.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = AutonomousManuscriptGenerator;
