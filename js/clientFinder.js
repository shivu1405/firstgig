const ClientFinder = {

    skillClientMap: {
        'web development': [
            { type: 'Early-stage SaaS Founders', description: 'Building MVPs, need landing pages and dashboards.', where: ['IndieHackers', 'Twitter/X', 'Product Hunt'], tags: ['startup', 'tech'] },
            { type: 'Local Small Businesses', description: 'Restaurants, gyms, dentists needing a modern website.', where: ['Google Maps', 'Yelp', 'Local Facebook Groups'], tags: ['local', 'small-biz'] },
            { type: 'E-commerce Store Owners', description: 'Shopify or WooCommerce store owners needing customization.', where: ['Shopify Forums', 'Reddit r/ecommerce'], tags: ['ecommerce', 'shopify'] }
        ],
        'graphic design': [
            { type: 'Content Creators & YouTubers', description: 'Need thumbnails, channel art, social media graphics.', where: ['YouTube', 'Twitter/X', 'Instagram'], tags: ['creator', 'social'] },
            { type: 'Startup Founders', description: 'Need logos, pitch deck design, brand identity.', where: ['IndieHackers', 'LinkedIn', 'AngelList'], tags: ['startup', 'branding'] },
            { type: 'Small Business Owners', description: 'Need menus, flyers, business cards, social posts.', where: ['Local Groups', 'Nextdoor', 'Facebook'], tags: ['local', 'print'] }
        ],
        'content writing': [
            { type: 'SaaS Companies', description: 'Need blog posts, landing page copy, email sequences.', where: ['LinkedIn', 'Twitter/X', 'AngelList'], tags: ['saas', 'b2b'] },
            { type: 'Digital Marketing Agencies', description: 'Outsource blog writing and SEO content.', where: ['LinkedIn', 'Agency directories'], tags: ['agency', 'seo'] },
            { type: 'E-commerce Brands', description: 'Need product descriptions, email newsletters.', where: ['Shopify community', 'Instagram DMs'], tags: ['ecommerce', 'copy'] }
        ],
        'video editing': [
            { type: 'YouTubers & Streamers', description: 'Need consistent video editing for their channels.', where: ['YouTube', 'Twitter/X', 'Discord'], tags: ['creator', 'youtube'] },
            { type: 'Course Creators', description: 'Need polished course videos and promos.', where: ['Udemy community', 'Twitter/X'], tags: ['education', 'course'] },
            { type: 'Real Estate Agents', description: 'Need property tour videos edited.', where: ['LinkedIn', 'Zillow', 'Local groups'], tags: ['real-estate', 'video'] }
        ],
        'social media': [
            { type: 'Local Businesses', description: 'Need someone to manage their Instagram/Facebook.', where: ['Google Maps', 'Local groups', 'In person'], tags: ['local', 'social'] },
            { type: 'Personal Brands & Coaches', description: 'Need consistent social media content.', where: ['LinkedIn', 'Instagram', 'Twitter/X'], tags: ['coaching', 'brand'] },
            { type: 'E-commerce Brands', description: 'Need social media posts and engagement.', where: ['Instagram', 'Shopify community'], tags: ['ecommerce', 'social'] }
        ],
        'ui/ux design': [
            { type: 'SaaS Startup Founders', description: 'Need app UI/UX design or redesign.', where: ['IndieHackers', 'Product Hunt', 'LinkedIn'], tags: ['startup', 'product'] },
            { type: 'Mobile App Developers', description: 'Need UI design for their apps.', where: ['Reddit', 'Twitter/X', 'Discord'], tags: ['mobile', 'app'] },
            { type: 'Agencies', description: 'Outsource design work to freelancers.', where: ['LinkedIn', 'Dribbble', 'Behance'], tags: ['agency', 'design'] }
        ],
        'seo': [
            { type: 'Small Business Owners', description: 'Want to rank higher on Google locally.', where: ['Google Maps', 'LinkedIn', 'Local groups'], tags: ['local', 'seo'] },
            { type: 'Bloggers & Affiliate Marketers', description: 'Need SEO audits and keyword research.', where: ['Twitter/X', 'Reddit', 'Facebook groups'], tags: ['blogging', 'affiliate'] },
            { type: 'E-commerce Stores', description: 'Need product page SEO and technical SEO.', where: ['Shopify community', 'LinkedIn'], tags: ['ecommerce', 'technical'] }
        ],
        'python': [
            { type: 'Data-driven Startups', description: 'Need scripts, automation, data analysis.', where: ['LinkedIn', 'AngelList', 'Twitter/X'], tags: ['data', 'automation'] },
            { type: 'Researchers & Academics', description: 'Need data processing, scraping, visualization.', where: ['University boards', 'LinkedIn', 'Reddit'], tags: ['research', 'data'] },
            { type: 'Small Businesses', description: 'Need automation for repetitive tasks.', where: ['LinkedIn', 'Local groups'], tags: ['automation', 'small-biz'] }
        ],
        'react': [
            { type: 'SaaS Founders', description: 'Building React-based dashboards and web apps.', where: ['IndieHackers', 'Twitter/X', 'LinkedIn'], tags: ['startup', 'frontend'] },
            { type: 'Agencies', description: 'Need React developers for client projects.', where: ['LinkedIn', 'Agency job boards'], tags: ['agency', 'dev'] },
            { type: 'Open Source Projects', description: 'Contribute to gain visibility and get referrals.', where: ['GitHub', 'Discord', 'Twitter/X'], tags: ['opensource', 'portfolio'] }
        ],
        'data entry': [
            { type: 'E-commerce Store Owners', description: 'Need product listings entered and managed.', where: ['Shopify Forums', 'Facebook Groups'], tags: ['ecommerce', 'data'] },
            { type: 'Real Estate Agencies', description: 'Need property data entered into systems.', where: ['LinkedIn', 'Local groups'], tags: ['real-estate', 'data'] },
            { type: 'Small Business Owners', description: 'Need spreadsheets organized and data cleaned.', where: ['LinkedIn', 'Nextdoor', 'Local groups'], tags: ['local', 'small-biz'] }
        ],
        'copywriting': [
            { type: 'DTC Brands', description: 'Need landing page copy, ad copy, email funnels.', where: ['Twitter/X', 'LinkedIn', 'Instagram'], tags: ['ecommerce', 'marketing'] },
            { type: 'SaaS Startups', description: 'Need website copy, onboarding emails, feature pages.', where: ['IndieHackers', 'Product Hunt', 'LinkedIn'], tags: ['saas', 'startup'] },
            { type: 'Coaches & Course Creators', description: 'Need sales pages and launch copy.', where: ['Instagram', 'Facebook groups', 'LinkedIn'], tags: ['coaching', 'education'] }
        ]
    },

    defaultClients: [
        { type: 'Startup Founders', description: 'Early-stage founders always need affordable skilled help.', where: ['LinkedIn', 'Twitter/X', 'IndieHackers'], tags: ['startup', 'general'] },
        { type: 'Small Business Owners', description: 'Local businesses looking for affordable freelance help.', where: ['Google Maps', 'Facebook Groups', 'Nextdoor'], tags: ['local', 'small-biz'] },
        { type: 'Agencies', description: 'Agencies outsource work and are open to new freelancers.', where: ['LinkedIn', 'Agency directories'], tags: ['agency', 'outsource'] }
    ],

    findClients(skills, targetIndustry) {
        let allClients = [];

        skills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase().trim();
            const matched = this.skillClientMap[normalizedSkill];
            if (matched) {
                allClients = allClients.concat(matched);
            }
        });

        if (allClients.length === 0) {
            allClients = [...this.defaultClients];
        }

        // Remove duplicates by type
        const seen = new Set();
        allClients = allClients.filter(client => {
            if (seen.has(client.type)) return false;
            seen.add(client.type);
            return true;
        });

        // Filter by target industry if specified
        if (targetIndustry) {
            const industryFiltered = allClients.filter(c =>
                c.tags.some(t => targetIndustry.toLowerCase().includes(t)) ||
                c.type.toLowerCase().includes(targetIndustry.toLowerCase()) ||
                c.description.toLowerCase().includes(targetIndustry.toLowerCase())
            );
            if (industryFiltered.length > 0) {
                allClients = industryFiltered;
            }
        }

        return allClients.slice(0, 5);
    }
};