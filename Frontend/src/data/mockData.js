export const MOCK_CLIENTS = [
    {
        id: 'c1',
        name: 'TechNova Solutions',
        industry: 'SaaS',
        logo: 'https://ui-avatars.com/api/?name=Tech+Nova&background=0D8ABC&color=fff',
        stats: {
            totalPosts: 124,
            engagementRate: '4.8%',
            viralScore: 85,
            bestPlatform: 'LinkedIn',
            followers: '12.5k'
        },
        platforms: {
            instagram: { connected: true, handle: '@technova' },
            linkedin: { connected: true, handle: 'TechNova Solutions' },
            twitter: { connected: true, handle: '@technova_tech' },
            facebook: { connected: false },
        },
        recentActivity: [
            { id: 1, type: 'post', platform: 'linkedin', content: 'Excited to announce our Series B funding!', status: 'published', time: '2h ago' },
            { id: 2, type: 'post', platform: 'twitter', content: 'Our new API is live. Check the docs.', status: 'published', time: '5h ago' },
            { id: 3, type: 'draft', platform: 'instagram', content: 'Team outing photos 📸', status: 'draft', time: '1d ago' },
        ],
        engagementData: [
            { name: 'Mon', value: 400 },
            { name: 'Tue', value: 300 },
            { name: 'Wed', value: 550 },
            { name: 'Thu', value: 450 },
            { name: 'Fri', value: 700 },
            { name: 'Sat', value: 200 },
            { name: 'Sun', value: 300 },
        ]
    },
    {
        id: 'c2',
        name: 'GreenLeaf Organics',
        industry: 'Retail',
        logo: 'https://ui-avatars.com/api/?name=Green+Leaf&background=27AE60&color=fff',
        stats: {
            totalPosts: 89,
            engagementRate: '6.2%',
            viralScore: 42,
            bestPlatform: 'Instagram',
            followers: '45.2k'
        },
        platforms: {
            instagram: { connected: true, handle: '@greenleaf_org' },
            linkedin: { connected: false },
            twitter: { connected: false },
            facebook: { connected: true, handle: 'GreenLeaf Organics' },
        },
        recentActivity: [
            { id: 1, type: 'post', platform: 'instagram', content: 'Fresh organic apples just arrived! 🍎', status: 'published', time: '1h ago' },
            { id: 2, type: 'post', platform: 'facebook', content: 'Weekend sale starts now.', status: 'published', time: '3h ago' },
        ],
        engagementData: [
            { name: 'Mon', value: 200 },
            { name: 'Tue', value: 400 },
            { name: 'Wed', value: 300 },
            { name: 'Thu', value: 600 },
            { name: 'Fri', value: 500 },
            { name: 'Sat', value: 800 },
            { name: 'Sun', value: 900 },
        ]
    }
];
