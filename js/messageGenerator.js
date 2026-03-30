 const MessageGenerator = {

    async generateWithClaude(data) {
        const apiKey = ApiKeyManager.get();

        if (!apiKey) {
            throw new Error('API key not set. Please set your Claude API key first.');
        }

        const prompt = this.buildPrompt(data);

        try {
            const response = await fetch(CONFIG.CLAUDE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: CONFIG.CLAUDE_MODEL,
                    max_tokens: CONFIG.MAX_TOKENS,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Claude API key.');
                }
                if (response.status === 429) {
                    throw new Error('Rate limited. Please wait a moment and try again.');
                }
                throw new Error(errorData.error?.message || 'API error: ' + response.status);
            }

            const result = await response.json();
            const content = result.content[0].text;

            return this.parseResponse(content);

        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Check your internet connection or try the offline mode.');
            }
            throw error;
        }
    },

    buildPrompt(data) {
        const { name, skills, bio, targetIndustry, outreachType, tone, clients } = data;

        const platformGuide = {
            email: 'a cold email (with subject line)',
            linkedin: 'a LinkedIn connection message or DM (keep under 300 characters for connection note)',
            twitter: 'a Twitter/X DM (concise, under 280 chars if possible)'
        };

        const toneGuide = {
            'professional-friendly': 'professional yet warm and approachable',
            'casual-confident': 'casual, confident, like talking to a peer',
            'formal': 'formal and business-like',
            'enthusiastic': 'enthusiastic, energetic, and passionate'
        };

        const clientContext = clients.map(c =>
            '- ' + c.type + ': ' + c.description + ' (Find them on: ' + c.where.join(', ') + ')'
        ).join('\n');

        return 'You are an expert cold outreach copywriter helping a beginner freelancer land their first client.\n\n' +
            '## FREELANCER DETAILS\n' +
            '- Name: ' + name + '\n' +
            '- Skills: ' + skills.join(', ') + '\n' +
            '- Bio: ' + bio + '\n' +
            (targetIndustry ? '- Target Industry: ' + targetIndustry + '\n' : '') +
            '\n## IDEAL CLIENT TYPES IDENTIFIED\n' +
            clientContext + '\n\n' +
            '## TASK\n' +
            'Generate ' + platformGuide[outreachType] + ' for this freelancer to send to potential clients.\n\n' +
            '## REQUIREMENTS\n' +
            '1. Tone: ' + toneGuide[tone] + '\n' +
            '2. Do NOT sound desperate or begging\n' +
            '3. Do NOT mention "I\'m a beginner" or "I have no experience" — focus on skills and enthusiasm\n' +
            '4. Lead with VALUE — what you can do for THEM\n' +
            '5. Be specific about the skill/service offered\n' +
            '6. Include a soft call-to-action\n' +
            '7. Keep it concise and scannable\n' +
            '8. Sound human, not AI-generated\n' +
            '9. Personalize it so the freelancer can adapt it to specific clients\n\n' +
            '## OUTPUT FORMAT\n' +
            'Return your response in this exact JSON format:\n' +
            '{\n' +
            '    "subject": "Email subject line (only for email type, empty string for others)",\n' +
            '    "message": "The full outreach message",\n' +
            '    "tips": [\n' +
            '        "Tip 1 for sending this message",\n' +
            '        "Tip 2",\n' +
            '        "Tip 3",\n' +
            '        "Tip 4",\n' +
            '        "Tip 5"\n' +
            '    ],\n' +
            '    "targetClientType": "The primary client type this message targets",\n' +
            '    "estimatedResponseRate": "Estimated response rate like 5-15%"\n' +
            '}\n\n' +
            'Return ONLY valid JSON. No markdown, no code blocks, no extra text.';
    },

    parseResponse(content) {
        try {
            let jsonStr = content.trim();

            // Remove markdown code blocks if present
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }

            const parsed = JSON.parse(jsonStr);
            return {
                subject: parsed.subject || '',
                message: parsed.message || content,
                tips: parsed.tips || [],
                targetClientType: parsed.targetClientType || 'General',
                estimatedResponseRate: parsed.estimatedResponseRate || '5-10%'
            };
        } catch (e) {
            // If JSON parsing fails, return raw content
            return {
                subject: '',
                message: content,
                tips: [
                    'Personalize the [bracketed] parts before sending',
                    'Send between Tuesday-Thursday for best results',
                    'Follow up after 3-5 days if no response',
                    'Keep your message short and scannable',
                    'Research the client before reaching out'
                ],
                targetClientType: 'General',
                estimatedResponseRate: '5-10%'
            };
        }
    },

    // Fallback: Generate message WITHOUT API (offline mode)
    generateOffline(data) {
        const { name, skills, bio, outreachType, tone, clients } = data;
        const primarySkill = skills[0] || 'freelance services';
        const clientType = clients[0]?.type || 'potential client';
        const whereToFind = clients[0]?.where?.join(', ') || 'LinkedIn, Twitter';

        const templates = {
            email: {
                'professional-friendly': {
                    subject: 'Quick idea for [Company Name]\'s ' + primarySkill.toLowerCase(),
                    message: 'Hi [Client Name],\n\n' +
                        'I came across [Company Name] and was really impressed by [something specific about their business — check their website/social media].\n\n' +
                        'I noticed [specific observation — e.g., "your website could use a refresh" or "you\'re posting great content but the designs could be more polished"].\n\n' +
                        'I specialize in ' + primarySkill.toLowerCase() + ' and I\'d love to help you with [specific deliverable — e.g., "a modern landing page redesign" or "a set of branded social media templates"].\n\n' +
                        (bio ? 'A bit about me — ' + bio + '\n\n' : '') +
                        'Would you be open to a quick 10-minute call this week? I have a few ideas I think could really help.\n\n' +
                        'Best,\n' + name + '\n\n' +
                        'P.S. Happy to share some relevant work samples if you\'re interested!'
                },
                'casual-confident': {
                    subject: 'Saw [Company Name] — had an idea 💡',
                    message: 'Hey [Client Name],\n\n' +
                        'Been following what you\'re doing with [Company Name] — really cool stuff.\n\n' +
                        'Quick thought: I noticed [specific observation about their business]. I do ' + primarySkill.toLowerCase() + ' and I think I could help you [specific benefit].\n\n' +
                        (bio ? 'Little about me — ' + bio + '\n\n' : '') +
                        'Not trying to sell you anything, just genuinely think I could add value here. Want to chat for 5 min?\n\n' +
                        'Cheers,\n' + name
                },
                'formal': {
                    subject: primarySkill + ' Services for [Company Name]',
                    message: 'Dear [Client Name],\n\n' +
                        'I hope this message finds you well. I am writing to introduce myself and my ' + primarySkill.toLowerCase() + ' services.\n\n' +
                        'After reviewing [Company Name]\'s online presence, I identified several opportunities where my skills could contribute to your business growth.\n\n' +
                        'Specifically, I could assist with:\n' +
                        '• [Specific deliverable 1]\n' +
                        '• [Specific deliverable 2]\n' +
                        '• [Specific deliverable 3]\n\n' +
                        (bio ? 'About me: ' + bio + '\n\n' : '') +
                        'I would welcome the opportunity to discuss how I can support [Company Name]. Would you have 15 minutes available this week for a brief call?\n\n' +
                        'Kind regards,\n' + name
                },
                'enthusiastic': {
                    subject: 'Love what [Company Name] is doing! Had to reach out 🚀',
                    message: 'Hey [Client Name]!\n\n' +
                        'Okay I have to be honest — I came across [Company Name] and got genuinely excited about what you\'re building! 🔥\n\n' +
                        '[Specific thing you noticed about their business] is awesome. But I noticed [specific area where you can help] and my brain immediately started thinking about how to make it even better.\n\n' +
                        'I\'m a ' + primarySkill.toLowerCase() + ' specialist, and here\'s what I\'m thinking:\n' +
                        '→ [Specific idea 1]\n' +
                        '→ [Specific idea 2]\n\n' +
                        (bio ? bio + '\n\n' : '') +
                        'I\'d absolutely love to chat about this — even just 5 minutes. I promise it\'ll be worth it!\n\n' +
                        'Let\'s make something great,\n' + name + ' ⚡'
                }
            },
            linkedin: {
                'professional-friendly': {
                    subject: '',
                    message: 'Hi [Name]! 👋\n\n' +
                        'I came across your profile and really admire what you\'re doing with [their company/project].\n\n' +
                        'I specialize in ' + primarySkill.toLowerCase() + ' and noticed [specific observation]. I\'d love to connect and share a quick idea on how I could help.\n\n' +
                        'No pressure at all — just thought it was worth reaching out!\n\n' +
                        '— ' + name
                },
                'casual-confident': {
                    subject: '',
                    message: 'Hey [Name]! 👋\n\n' +
                        'Love what you\'re building. I do ' + primarySkill.toLowerCase() + ' and had a quick idea that could help with [specific thing].\n\n' +
                        'Mind if I share?\n\n' +
                        '— ' + name
                },
                'formal': {
                    subject: '',
                    message: 'Dear [Name],\n\n' +
                        'I hope this message finds you well. I came across your profile and was impressed by your work at [Company].\n\n' +
                        'I specialize in ' + primarySkill.toLowerCase() + ' and believe I could add value to your team. Would you be open to a brief conversation?\n\n' +
                        'Best regards,\n' + name
                },
                'enthusiastic': {
                    subject: '',
                    message: 'Hey [Name]! 🚀\n\n' +
                        'Just discovered your work and I\'m genuinely impressed! What you\'re doing with [their project] is amazing.\n\n' +
                        'I\'m passionate about ' + primarySkill.toLowerCase() + ' and I have some ideas that could help take things to the next level. Would love to connect!\n\n' +
                        '— ' + name + ' ⚡'
                }
            },
            twitter: {
                'professional-friendly': {
                    subject: '',
                    message: 'Hey [Name]! Been following your work on [project] — really impressive stuff. I do ' + primarySkill.toLowerCase() + ' and had a quick idea that might help. Mind if I share? 🙏'
                },
                'casual-confident': {
                    subject: '',
                    message: 'Yo [Name]! Love what you\'re building 🔥 I do ' + primarySkill.toLowerCase() + ' and noticed something that could help. Cool if I send a quick idea?'
                },
                'formal': {
                    subject: '',
                    message: 'Hello [Name], I\'ve been following [Company] and I\'m impressed by your growth. I specialize in ' + primarySkill.toLowerCase() + ' and would love to discuss how I might contribute. Would you be open to connecting?'
                },
                'enthusiastic': {
                    subject: '',
                    message: '[Name]! 🚀 Your work on [project] is 🔥🔥🔥. I do ' + primarySkill.toLowerCase() + ' and literally had 3 ideas pop into my head. Can I share one quick thought? Promise it\'s good! ⚡'
                }
            }
        };

        const template = templates[outreachType]?.[tone] || templates[outreachType]?.['professional-friendly'] || templates.email['professional-friendly'];

        return {
            subject: template.subject,
            message: template.message,
            tips: [
                'Research each ' + clientType + ' before sending — personalize ALL the [bracketed] parts',
                'Find them on: ' + whereToFind,
                'Send between Tuesday-Thursday, 9-11 AM in their timezone for best response rates',
                'Follow up after 3-5 business days if no response — a simple "Just bumping this up" works',
                'Track every outreach in the tracker below — consistency wins',
                'Aim to send 5-10 personalized messages per day',
                'Don\'t copy-paste the same message — customize each one'
            ],
            targetClientType: clientType,
            estimatedResponseRate: '5-15%'
        };
    }
};
