// aboutController.js
const aboutController = (req, res) => {
    res.render('about', {
        technologies: ['HTML', 'CSS', 'JavaScript', 'TailwindCSS', 'Express.js', 'Node.js', 'MySQL'],
        advantages: [
            'Potential for high returns',
            'Liquidity - easy to buy and sell',
            'Ownership in a company',
            'Opportunity for dividends'
        ],
        disadvantages: [
            'Market volatility',
            'Risk of loss',
            'Requires continuous learning',
            'Emotional decision-making'
        ],
        fresherDos: [
            'Research before investing',
            'Start with small investments',
            'Diversify your portfolio',
            'Learn about risk management'
        ],
        fresherDonts: [
            'Invest without knowledge',
            'Put all money in one stock',
            'Make decisions based on emotions',
            'Ignore market trends'
        ]
    });
};

module.exports = aboutController;